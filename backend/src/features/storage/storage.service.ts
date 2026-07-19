import {
  GetBucketLifecycleConfigurationCommand,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Logger, OnModuleInit } from "@nestjs/common";
import { StoryError, StoryErrorType } from "src/filters/exception";

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
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.S3_REQ_FAILED, error);
    }
  }
}
