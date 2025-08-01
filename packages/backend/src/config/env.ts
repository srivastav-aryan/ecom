import dotenv from "dotenv";
import { treeifyError, z } from "zod";

dotenv.config({ quiet: true });

const processEnvSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z
    .enum(["development", "production", "testing"])
    .default("development"),
  MONGODB_CONNECTION_STRING: z.string().min(1, "MongoDB uri is required"),
});

const result = processEnvSchema.safeParse(process.env);

if (!result.success) {
  console.log(`.env file error:- ${treeifyError(result.error)}`);
  process.exit(1);
}

export const env = result.data;
