import { Inject } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";

export const s3Config = registerAs("s3", () => {
  return {
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucketName: process.env.S3_BUCKET_NAME,
    usePathStyle: Boolean(process.env.S3_USE_PATH_STYLE),
    region: process.env.S3_REGION,
  };
});

export const S3Config = () => Inject(s3Config.KEY);
export type IS3Config = ConfigType<typeof s3Config>;
