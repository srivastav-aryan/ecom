import dotenv from "dotenv";
import { z } from "zod";
dotenv.config({ quiet: true });
const processEnvSchema = z.object({
    PORT: z.coerce.number(),
    NODE_ENV: z
        .enum(["development", "production", "testing"])
        .default("development"),
    MONGODB_CONNECTION_STRING: z.string().min(1, "MongoDB uri is required"),
    ACCESS_TOKEN_SECRET: z.string().min(1, "access token is required"),
    ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
    REFRESH_TOKEN_SECRET: z.string().min(1, "refresh token is needed"),
    REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
});
const result = processEnvSchema.safeParse(process.env);
if (!result.success) {
    const formattedErrors = result.error.flatten();
    console.log(formattedErrors.fieldErrors);
    process.exit(1);
}
export const env = result.data;
