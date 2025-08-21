import { z } from "zod";
export declare const userRegistrationSchema: z.ZodObject<{
    body: z.ZodObject<{
        firstname: z.ZodString;
        lastname: z.ZodString;
        email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        password: z.ZodString;
        confirmPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
