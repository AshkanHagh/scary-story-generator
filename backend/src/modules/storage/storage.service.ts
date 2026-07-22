import {
  GetBucketLifecycleConfigurationCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Logger, OnModuleInit } from "@nestjs/common";
import { StoryError, StoryErrorType } from "src/filters/exception";
import storageKey from "src/utils/storage-key";

export class StorageService implements OnModuleInit {
  private endpoint = process.env.AWS_S3_ENDPOINT;
  private bucketName = process.env.AWS_S3_BUCKET_NAME;
  private client: S3Client;
  private logger = new Logger(StorageService.name);

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.AWS_S3_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
      },
      forcePathStyle:
        process.env.AWS_S3_USE_PATH_STYLE === "true" ? true : false,
      region: process.env.AWS_S3_REGION,
    });
  }

  async onModuleInit() {
    const ruleId = "expire-temp-objects-after-1-day";
    try {
      const rules = await this.client.send(
        new GetBucketLifecycleConfigurationCommand({
          Bucket: this.bucketName,
        }),
      );
      if (rules.Rules?.find((rule) => rule.ID == ruleId)) {
        return;
      }
    } catch (_) {
      this.logger.error(`rule {ruleId} not found`);
    }

    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: this.bucketName,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: "expire-temp-objects-after-1-day",
            Status: "Enabled",
            Filter: {
              Tag: {
                Key: "temp",
                Value: "true",
              },
            },
            Expiration: {
              Days: 1,
            },
          },
        ],
      },
    });
    await this.client.send(command).catch(() => {});
    this.logger.error(`rule {ruleId} created`);
  }

  async upload(key: string, mimeType: string, body: Buffer | string) {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: mimeType,
          Tagging: "temp=true",
        }),
      );
      const url = `${this.endpoint}/${this.bucketName}/${key}`;
      return url;
    } catch (error) {
      throw new StoryError(StoryErrorType.S3_REQ_FAILED, error);
    }
  }

  async getSpeachWithSubtitle(
    storyId: string,
    speachId: string,
    subtitleId: string,
  ) {
    try {
      const [speach, subtitle] = await Promise.all([
        this.client.send(
          new GetObjectCommand({
            Key: storageKey(storyId, speachId),
            Bucket: this.bucketName,
          }),
        ),
        this.client.send(
          new GetObjectCommand({
            Key: storageKey(storyId, subtitleId),
            Bucket: this.bucketName,
          }),
        ),
      ]);
      return {
        speach: {
          buffer: Buffer.from(await speach.Body!.transformToByteArray()),
          contentType: speach.ContentType!,
        },
        subtitle: {
          buffer: Buffer.from(await subtitle.Body!.transformToByteArray()),
          contentType: subtitle.ContentType!,
        },
      };
    } catch (error) {
      throw new StoryError(StoryErrorType.S3_REQ_FAILED, error);
    }
  }

  async get(key: string) {
    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Key: key,
          Bucket: this.bucketName,
        }),
      );
      return {
        buffer: Buffer.from(await result.Body!.transformToByteArray()),
        contentType: result.ContentType!,
      };
    } catch (error) {
      throw new StoryError(StoryErrorType.S3_REQ_FAILED, error);
    }
  }

  async getVidoes(storyId: string) {
    try {
      const folderPath = storageKey(storyId, "videos");
      const result = await this.client.send(
        new ListObjectsV2Command({
          Prefix: folderPath,
          Bucket: this.bucketName,
        }),
      );
      if (result.Contents?.length === 0) {
        throw new StoryError(StoryErrorType.VIDEOS_NOT_FOUND);
      }
      const objectsPromise = result.Contents!.map(async (context) => {
        const result = await this.client.send(
          new GetObjectCommand({
            Key: context.Key!,
            Bucket: this.bucketName,
          }),
        );
        return {
          id: context.Key!.split("/").pop()!,
          buffer: Buffer.from(await result.Body!.transformToByteArray()),
          contentType: result.ContentType!,
        };
      });
      return await Promise.all(objectsPromise);
    } catch (error) {
      throw new StoryError(StoryErrorType.S3_REQ_FAILED, error);
    }
  }
}
