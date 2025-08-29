import { defineConfig } from "vitest/config";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;
let uri;
const settingUri = async () => {
  mongoServer = await MongoMemoryServer.create();

  uri = mongoServer.getUri();
};

await settingUri();

// @ts-ignore
global.__MONGO_SERVER__ = mongoServer;

export default defineConfig({
  test: {
    globals: true, // so you can use describe/it/expect without imports
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      NODE_ENV: "testing",
      MONGODB_CONNECTION_STRING: uri,
      ACCESS_TOKEN_SECRET:
        "test_access_secret_12345678901234567890123456789012345",
      REFRESH_TOKEN_SECRET:
        "test_refresh_secret_12345678901234567890123456789012345",
      ACCESS_TOKEN_EXPIRY: "15m",
      REFRESH_TOKEN_EXPIRY: "9d",
    },
    setupFiles: ["./tests/setup.ts"],
  },
});
