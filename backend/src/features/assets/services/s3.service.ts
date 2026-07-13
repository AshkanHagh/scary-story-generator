import {
  DeleteObjectCommand,
  GetBucketLifecycleConfigurationCommand,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Logger, OnModuleInit } from "@nestjs/common";
import { StoryError, StoryErrorType } from "src/filters/exception";

export class S3Service implements OnModuleInit {
  private endpoint = process.env.AWS_S3_ENDPOINT;
  private bucketName = process.env.AWS_S3_BUCKET_NAME;
  private client: S3Client;
  private logger = new Logger(S3Service.name);

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
      this.logger.log("s3 temp rule did not exists");
    }

    await this.client
      .send(
        new PutBucketLifecycleConfigurationCommand({
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
        }),
      )
      .catch(() => {});
  }

  async putObject(
    prefix: string,
    id: string,
    mimeType: string,
    buffer: Buffer,
    temp: boolean = true,
  ) {
    try {
      const fileKey = `${prefix}/${id}`;
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `${prefix}/${id}`,
          Body: buffer,
          ContentType: mimeType,
          Tagging: temp ? "temp=true" : "temp=false",
        }),
      );
      const url = `${this.endpoint}/${this.bucketName}/${fileKey}`;
      return url;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.S3_REQ_FAILED, error);
    }
  }

  async delete(id: string) {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: id,
        }),
      );
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.S3_REQ_FAILED, error);
    }
  }

  async removeImageTempFlag(fileId: string) {
    try {
      await this.client.send(
        new PutObjectTaggingCommand({
          Bucket: this.bucketName,
          Key: fileId,
          Tagging: {
            TagSet: [],
          },
        }),
      );
    } catch (error) {
      throw new StoryError(StoryErrorType.S3_REQ_FAILED, error);
    }
  }
}
