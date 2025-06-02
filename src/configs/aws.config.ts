import { Inject } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";

export const awsConfig = registerAs("aws", () => {
  return {
    s3: {
      endpoint: process.env.AWS_S3_ENDPOINT,
      accessKey: process.env.AWS_S3_ACCESS_KEY,
      secretKey: process.env.AWS_S3_SECRET_KEY,
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      usePathStyle: Boolean(process.env.AWS_S3_USE_PATH_STYLE),
      region: process.env.AWS_S3_REGION,
    },
  };
});

export const AwsConfig = () => Inject(awsConfig.KEY);
export type IAwsConfig = ConfigType<typeof awsConfig>;
