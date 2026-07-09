import { User } from "src/drizzle/schemas";

declare module "fastify" {
  interface FastifyRequest {
    user?: Pick<User, "id">;
  }
}
