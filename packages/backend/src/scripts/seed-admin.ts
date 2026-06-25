import mongoose from "mongoose";
import { User } from "../modules/identity/models/user.model.js";
import { USER_ROLES, DEFAULT_PERMISSIONS } from "@e-com/shared/authorization";
import { connectDB } from "../shared/config/dbconfig.js";

// NEVER IMPORT THIS FILE ANYWHERE IT WILL KILL THE NODE SERVER MIDWAY!!!!!!!!! AS IT CONTAINS process.exit() CALLS!!!!!!
// ALWAYS RUN THIS SCRIPT AS CLI TOOL!!!!!!!
// DO THIS pnpm run seed:admin

async function seedAdmin() {
  try {
    // Reusing centralized connection logic!
    console.log("Connecting to MongoDB...");
    await connectDB();

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
    if (existingAdmin) {
      console.log(
        `Super Admin already exists with email: ${existingAdmin.email}`,
      );
      return;
    }

    // Default admin credentials
    const adminEmail = "admin@example.com";
    const adminPassword = "AdminPass123!@"; // Will be hashed by mongoose pre-save hook

    console.log("Creating super admin...");
    const adminUser = new User({
      firstname: "Super",
      lastname: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: USER_ROLES.SUPER_ADMIN,
      permissions: DEFAULT_PERMISSIONS.SUPER_ADMIN,
      isActive: true,
      isEmailVerified: true,
    });

    await adminUser.save();
    console.log(`✅ Super Admin created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(
      `⚠️ IMPORTANT: Please log in and change this password immediately in production.`,
    );
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

seedAdmin();
