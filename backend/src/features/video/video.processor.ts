import { Processor } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { StorageService } from "../storage/storage.service";
import { Logger } from "@nestjs/common";
import { BaseProcessor, QueueJob } from "src/queue/base-queue";
import { VIDEO_QUEUE } from "src/queue/constants";
import { VIDEO_QUEUES } from "./constants";
import storageKey from "src/utils/storage-key";
import { eq } from "drizzle-orm";
import { SegmentTable, StoryTable, VideoTable } from "src/drizzle/schemas";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "node:stream";
import { withDir } from "tmp-promise";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

@Processor(VIDEO_QUEUE, { concurrency: 6 })
export class VideoProcessor extends BaseProcessor {
  protected logger = new Logger(VideoProcessor.name);

  constructor(
    @InjectDatabase() private db: Database,
    private storageService: StorageService,
  ) {
    super();
  }

  async handle(job: Job<QueueJob<any>>) {
    switch (job.name) {
      case VIDEO_QUEUES.FINALIZE: {
        return await this.finalizeVideoGen(job);
      }
      case VIDEO_QUEUES.VIDEO_CONCAT: {
        return await this.concatVidoes(job);
      }
      case VIDEO_QUEUES.VIDEO: {
        return await this.genSegmentVideo(job);
      }
    }
  }

  async genSegmentVideo(
    job: Job<QueueJob<{ storyId: string; segmentId: string }>>,
  ) {
    const { payload } = job.data;
    const story = await this.db.query.StoryTable.findFirst({
      where: eq(StoryTable.id, payload.storyId),
      with: {
        segments: {
          where: eq(SegmentTable.id, payload.segmentId),
        },
      },
    });
    const segment = story!.segments[0];
    if (!story || !segment) {
      return;
    }
    const image = await this.storageService.get(
      storageKey(payload.storyId, payload.segmentId),
    );

    const videoBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const fps = 25;
      const totalFrames = Math.round(story.meta!.videoDuration * fps);
      // generates video base on segment image with reslotion of 720 and zoomin effect
      // video duration is calculated base on total segments/speach duration
      // prettier-ignore
      ffmpeg()
        .input(Readable.from([image.buffer]))
        .inputFormat("image2pipe")
        .videoFilters([
          // Upscale generously before zoompan — gives headroom so the pan/zoom
          // math never samples outside the frame
          "scale=3072:1728:flags=lanczos",
          "zoompan=" +
            "z='min(zoom+0.0003,1.12)':" +
            "x='iw/2-(iw/zoom/2)+sin(on/240)*0.8':" +
            "y='ih/2-(ih/zoom/2)+cos(on/310)*0.6':" +
            `d=${totalFrames}:` +
            "s=1280x720",
        ])
        .duration(story.meta!.videoDuration)
        .fps(fps)
        .outputOptions([
          "-pix_fmt", "yuv420p",
          "-movflags", "frag_keyframe+empty_moov",
          "-f", "mp4",
        ])
        .on("error", reject)
        .pipe()
        .on("data", (chunk: Buffer) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", reject);
    });

    await this.storageService.upload(
      storageKey(`${payload.storyId}/videos`, segment.order.toString()),
      "video/mp4",
      videoBuffer,
    );
  }

  async concatVidoes(job: Job<QueueJob<{ storyId: string; videoId: string }>>) {
    const { payload } = job.data;
    const story = await this.db.query.StoryTable.findFirst({
      where: eq(StoryTable.id, payload.storyId),
    });
    if (!story) {
      return;
    }

    const videoUrl = await withDir(
      async (tmpDir) => {
        const videos = await this.storageService.getVidoes(payload.storyId);
        const speach = await this.storageService.getSpeachWithSubtitle(
          payload.storyId,
          story.meta!.speachId,
          story.meta!.subtitleId,
        );

        const filePaths = await Promise.all(
          videos
            .sort((a, b) => parseInt(a.id) - parseInt(b.id))
            .map(async (video) => {
              return await this.writeFile(
                tmpDir.path,
                `${video.id}.mp4`,
                video.buffer,
              );
            }),
        );
        const [filesListPath, subtitlePath, speachPath] = await Promise.all([
          this.writeFile(
            tmpDir.path,
            "concat.txt",
            filePaths.map((path) => `file ${path}`).join("\n"),
          ),
          this.writeFile(
            tmpDir.path,
            `${story.meta!.subtitleId}.srt`,
            speach.subtitle.buffer,
          ),
          this.writeFile(
            tmpDir.path,
            `${story.meta!.speachId}.mp3`,
            speach.speach.buffer,
          ),
        ]);

        const videoBuffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          // prettier-ignore
          ffmpeg()
            .input(filesListPath)
            .inputOptions(["-f", "concat", "-safe", "0"])
            .input(speachPath)
            .videoFilters([
              `subtitles=${subtitlePath}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1'`,
            ])
            .outputOptions([
              "-map", "0:v",
              "-map", "1:a",
              "-c:v", "libx264",
              "-c:a", "aac",
              "-pix_fmt", "yuv420p",
              "-shortest",
              "-movflags", "frag_keyframe+empty_moov",
              "-f", "mp4",
            ])
            .on("error", reject)
            .pipe()
            .on("data", (chunk: Buffer) => chunks.push(chunk))
            .on("end", () => resolve(Buffer.concat(chunks)))
            .on("error", reject);
        });
        return await this.storageService.upload(
          storageKey(payload.storyId, payload.videoId),
          "video/mp4",
          videoBuffer,
        );
      },
      { unsafeCleanup: true },
    );
    return {
      videoUrl,
    };
  }

  async finalizeVideoGen(
    job: Job<QueueJob<{ storyId: string; videoId: string }>>,
  ) {
    const { payload } = job.data;
    const jobs = await job.getChildrenValues<{
      videoUrl: string;
    }>();
    const videoUrl = Object.values(jobs)[0]?.videoUrl;
    if (!videoUrl) {
      throw new Error(
        `finalizeVideoGen: missing/empty concat result for video ${payload.videoId}`,
      );
    }

    await Promise.all([
      this.db
        .update(VideoTable)
        .set({
          url: videoUrl,
          status: "completed",
        })
        .where(eq(VideoTable.id, payload.videoId)),
      this.db
        .update(StoryTable)
        .set({
          step: "video",
        })
        .where(eq(StoryTable.id, payload.storyId)),
    ]);
  }

  private async writeFile(dir: string, file: string, buffer: Buffer | string) {
    const filePath = join(dir, file);
    await writeFile(filePath, buffer);
    return filePath;
  }
}
