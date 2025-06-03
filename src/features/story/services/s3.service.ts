import { Injectable } from "@nestjs/common";
import { IS3Service } from "../interfaces/service";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { AwsConfig, IAwsConfig } from "src/configs/aws.config";

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
  }

  async putObject(
    id: string,
    mimetype: string,
    buffer: Buffer,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.s3.bucketName,
        Key: id,
        Body: buffer,
        ContentType: mimetype,
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
}
