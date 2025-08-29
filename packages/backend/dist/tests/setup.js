import mongoose from "mongoose";
import { connectDB } from "../src/config/dbconfig";
beforeAll(async () => {
    await connectDB();
}, 10000);
afterAll(async () => {
    await mongoose.disconnect();
    // @ts-ignore
    await global.__MONGO_SERVER__?.stop();
});
beforeEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
});
