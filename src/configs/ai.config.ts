import { Inject } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";

export const aiConfig = registerAs("ai", () => {
  return {
    liara_openai: {
      endpoint: process.env.LIARA_OPEN_AI_ENDPINT,
      secret: process.env.LIARA_OPEN_AI_SECRET,
    },
    openai: {
      secret: process.env.OPENAI_SECRET,
    },
    replicate: {
      secret: process.env.REPLICATE_API_TOKEN!,
    },
  };
});

export const AiConfig = () => Inject(aiConfig.KEY);
export type IAiConfig = ConfigType<typeof aiConfig>;
