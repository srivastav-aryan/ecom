import { z } from "zod";
export declare const userRegistrationSchema: z.ZodObject<{
    body: z.ZodObject<{
        firstname: z.ZodString;
        lastname: z.ZodString;
        email: z.ZodEmail;
        password: z.ZodString;
        confirmPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
