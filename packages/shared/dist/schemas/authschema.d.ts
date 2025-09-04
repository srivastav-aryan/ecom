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
export type userRegistrationInput = z.infer<typeof userRegistrationSchema>["body"];
export declare const userLoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodPipe<z.ZodEmail, z.ZodTransform<string, string>>;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type userLoginInput = z.infer<typeof userLoginSchema>["body"];
