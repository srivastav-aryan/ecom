import { z } from "zod";
import { name_Regex, passwordRegex, password_Max_Length, password_Min_Length, } from "../constants/constants.js";
export const userRegistrationSchema = z.object({
    body: z
        .object({
        firstname: z
            .string()
            .min(1, "First name is required")
            .max(50, "First name cannot exceed 50 characters")
            .trim()
            .regex(name_Regex, "First name can only contain letters and spaces"),
        lastname: z
            .string()
            .min(1, "Last name is required")
            .max(50, "Last name cannot exceed 50 characters")
            .trim()
            .regex(name_Regex, "Last name can only contain letters and spaces"),
        email: z
            .string()
            .email({ message: "Invalid email format" }) // Validates it's an email
            .transform((val) => val.toLowerCase().trim()) // Cleans it (lowercase + trim)
            .refine((val) => val.length > 0, {
            message: "Email cannot be empty after trimming",
        }), // Ex
        password: z
            .string()
            .min(password_Min_Length, "Password must be at least 8 characters long")
            .max(password_Max_Length, "Password must be at most 16 characters long")
            .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
        confirmPassword: z.string("This field is required"),
    })
        .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
});
