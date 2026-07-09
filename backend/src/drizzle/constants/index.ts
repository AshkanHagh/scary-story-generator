import { Inject } from "@nestjs/common";

export const DATABASE = "DATABASE";
export const InjectDatabase = () => Inject(DATABASE);
