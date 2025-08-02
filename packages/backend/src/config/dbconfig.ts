import mongoose, { ConnectOptions } from "mongoose";
import { env } from "./env.js";

mongoose.connection.on("connected", () =>
  console.log("DB connected successfullly")
);

const mongo_Options: ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 5000,

  maxPoolSize: 15,
  minPoolSize: 2,

  keepAliveInitialDelay: 50000,

  bufferCommands: false,

//   autoIndex: false,
};

// retrying options
const DB_RETRY_LIMIT = 4;
const INITIAL_RETRY_DELAY_MS = 1000;

// encapsulated connection logic
const tryDbConnection = async (retry = DB_RETRY_LIMIT): Promise<void> => {
  let currentDelay = INITIAL_RETRY_DELAY_MS;

  for (let attempt = 1; attempt <= retry; attempt++) {
    try {
      console.log(`Trying to connect to db, attepmt:-${attempt}`);

      await mongoose.connect(env.MONGODB_CONNECTION_STRING, mongo_Options);
      return;
    } catch (error) {
      if (attempt == retry) {
        throw error;
      }

      console.error(`attempt failed trying again in ${currentDelay}`);
      //exponential fallback logic
      await new Promise<void>((res: () => void) =>
        setTimeout(res, currentDelay)
      );
      currentDelay *= 2;
    }
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Database is already connected");
      return;
    }
    await tryDbConnection();
  } catch (error) {
    console.error(`FATAL:- Error while connecting to database ${error}`);
    process.exit(1);
  }
};
