import z from "zod";

export const userAddressSchema = z.object({
  addressType: z.enum(["HOME", "OFFICE", "OTHER"]),
  pincode: z.string().min(6, "Pincode must be 6 digits"),
  state: z.string().min(1, "State is required"),
  locality: z.string().min(1, "Locality is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().min(1, "Address line 2 is required"),
  landmark: z.string().min(1, "Landmark is required"),
  phone: z.string().min(1, "Phone is required"),
  name: z.string().min(1, "Name is required"),
});

export type UserAddress = z.infer<typeof userAddressSchema>;