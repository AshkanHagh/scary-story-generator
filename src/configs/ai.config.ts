import { Inject } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";

export const aiConfig = registerAs("ai", () => {
  return {
    openai: {
      endpoint: process.env.LIARA_OPEN_AI_ENDPINT,
      secret: process.env.LIARA_OPEN_AI_SECRET,
    },
  };
});

export const AiConfig = () => Inject(aiConfig.KEY);
export type IAiConfig = ConfigType<typeof aiConfig>;
