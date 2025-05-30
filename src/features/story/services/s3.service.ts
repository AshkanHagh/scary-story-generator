import { Injectable } from "@nestjs/common";
import { IS3Service } from "../interfaces/service";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { IS3Config, S3Config } from "src/configs/s3.config";
import { StoryError, StoryErrorType } from "src/filter/exception";

@Injectable()
export class S3Service implements IS3Service {
  private client: S3Client;

  constructor(@S3Config() private config: IS3Config) {
    this.client = new S3Client({
      endpoint: this.config.endpoint!,
      credentials: {
        accessKeyId: this.config.accessKey!,
        secretAccessKey: this.config.secretKey!,
      },
      forcePathStyle: this.config.usePathStyle,
      region: this.config.region!,
    });
  }

  async putObject(
    id: string,
    mimetype: string,
    buffer: Buffer,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: id,
        Body: buffer,
        ContentType: mimetype,
      });

      await this.client.send(command);
      const url = `${this.config.endpoint}/${this.config.bucketName}/${id}`;

      return url;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.UploadOutfitFailed, error);
    }
  }
}
