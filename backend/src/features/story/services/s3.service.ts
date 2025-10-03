import { Injectable } from "@nestjs/common";
import { IS3Service } from "../interfaces/service";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { AwsConfig, IAwsConfig } from "src/configs/aws.config";
import { Readable } from "stream";

@Injectable()
export class S3Service implements IS3Service {
  private client: S3Client;

  constructor(@AwsConfig() private config: IAwsConfig) {
    this.client = new S3Client({
      endpoint: this.config.s3.endpoint!,
      credentials: {
        accessKeyId: this.config.s3.accessKey!,
        secretAccessKey: this.config.s3.secretKey!,
      },
      forcePathStyle: this.config.s3.usePathStyle,
      region: this.config.s3.region!,
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.init();
  }

  private async init() {
    const bucketCommand = new HeadBucketCommand({
      Bucket: this.config.s3.bucketName,
    });

    await this.client.send(bucketCommand).catch(async () => {
      try {
        const command = new CreateBucketCommand({
          Bucket: this.config.s3.bucketName,
        });
        await this.client.send(command);
        await this.initLifecycle();
      } catch (error: unknown) {
        throw new StoryError(StoryErrorType.S3ReqFailed, error);
      }
    });
  }

  private async initLifecycle() {
    const ruleCommand = new PutBucketLifecycleConfigurationCommand({
      Bucket: this.config.s3.bucketName,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: "TemporaryFilesRule",
            Filter: {
              Tag: {
                Key: "temporary",
                Value: "true",
              },
            },
            Status: "Enabled",
            Expiration: {
              Days: 1,
            },
          },
        ],
      },
    });

    await this.client.send(ruleCommand);
  }

  async putObject(
    id: string,
    mimetype: string,
    buffer: Buffer | Readable,
    temp?: boolean,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.s3.bucketName,
        Key: id,
        Body: buffer,
        ContentType: mimetype,
        Tagging: temp ? "temporary=true" : "temporary=false",
      });

      await this.client.send(command);
      const url = `${this.config.s3.endpoint}/${this.config.s3.bucketName}/${id}`;

      return url;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.S3ReqFailed, error);
    }
  }

  async getObject(id: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.s3.bucketName,
        Key: id,
      });

      const response = await this.client.send(command);
      return Buffer.from(await response.Body!.transformToByteArray());
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.S3ReqFailed, error);
    }
  }

  async deleteObject(id: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.s3.bucketName,
        Key: id,
      });

      await this.client.send(command);
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.S3ReqFailed, error);
    }
  }
}
