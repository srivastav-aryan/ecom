import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const processEnvSchema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z
        .enum(["development", "production", "testing"])
        .default("development"),
});
const result = processEnvSchema.safeParse(process.env);
if (!result.success) {
    console.log(`.env file error:- ${result.error.format}`);
    process.exit(1);
}
export const env = result.data;
