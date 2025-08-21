import z from "zod";
export declare const userAddressSchema: z.ZodObject<{
    addressType: z.ZodEnum<{
        HOME: "HOME";
        OFFICE: "OFFICE";
        OTHER: "OTHER";
    }>;
    pincode: z.ZodString;
    state: z.ZodString;
    locality: z.ZodString;
    city: z.ZodString;
    country: z.ZodString;
    addressLine1: z.ZodString;
    addressLine2: z.ZodString;
    landmark: z.ZodString;
    phone: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
export type UserAddress = z.infer<typeof userAddressSchema>;
