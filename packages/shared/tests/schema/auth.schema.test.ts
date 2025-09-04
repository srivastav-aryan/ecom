import { describe, expect, it } from "vitest";
import {
  userLoginSchema,
  userRegistrationSchema,
} from "../../src/schemas/auth.schema";

describe("Authentication schema tests", () => {
  describe("User Registeration schema test", () => {
    it("Should validate correct user registeration input", () => {
      const validInput = {
        body: {
          firstname: "Test",
          lastname: "Surname",
          email: "Testemail123@gmail.com",
          password: "Testpass@123",
          confirmPassword: "Testpass@123",
        },
      };
      const result = userRegistrationSchema.safeParse(validInput);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.body.email).toBe("testemail123@gmail.com");
      }
    });

    it("should not validate data with wrong email", () => {
      const validInput = {
        body: {
          firstname: "Test",
          lastname: "Surname",
          email: "Testemail123gmail.com",
          password: "Testpass@123",
          confirmPassword: "Testpass@123",
        },
      };

      const res = userRegistrationSchema.safeParse(validInput);

      expect(res.success).toBe(false);
      if (!res.success) {
        const issues = res.error.issues;

        const emailError = issues.find(
          (issue) => issue.path.join(".") === "body.email"
        );

        expect(emailError?.message).toBe("Invalid email format");
      }
    });

    it("should not check the password regex is working or not", () => {
      const validInput = {
        body: {
          firstname: "Test",
          lastname: "Surname",
          email: "Testemail123@gmail.com",
          password: "Testpass123",
          confirmPassword: "Testpass123",
        },
      };

      const result = userRegistrationSchema.safeParse(validInput);

      expect(result.success).toBe(false);

      if (!result.success) {
        const issues = result.error.issues;
        const passError = issues.find((e) => e.path.includes("password"));
        expect(passError?.message).toBe(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
    });

    it("should fail for missing required fields", () => {
      const invalidInput = {
        body: {
          lastname: "Doe",
          email: "test@example.com",
          password: "Password123!",
          confirmPassword: "Password123!",
        },
      };
      const result = userRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorPaths = result.error.issues.map((e) => e.path[1]);
        expect(errorPaths).toContain("firstname");
      }
    });
  });

  describe("user Login Schema test", () => {
    it("should validate a valid login input", () => {
      const validInput = {
        body: {
          email: "TEST@EXAMPLE.COM", // Test transformation
          password: "MyValidPassword",
        },
      };
      const result = userLoginSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.email).toBe("test@example.com");
      }
    });

    it("should fail for invalid email format on login", () => {
      const invalidInput = {
        body: {
          email: "not-an-email",
          password: "Password123",
        },
      };
      const result = userLoginSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((e) => e.path.includes("email"));
        expect(error?.message).toBe("Email should be of correct format");
      }
    });

    it("should fail for missing password on login", () => {
      const invalidInput = {
        body: {
          email: "test@example.com",
          // password missing
        },
      };
      const result = userLoginSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorPaths = result.error.issues.map((e) => e.path[1]);
        expect(errorPaths).toContain("password");
      }
    });
  });
});
