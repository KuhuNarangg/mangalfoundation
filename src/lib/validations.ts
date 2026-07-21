import { z } from "zod";

/** A 24-char hex Mongo ObjectId. */
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

/**
 * Public donation input. Whitelists exactly the fields a donor may set —
 * payment status and Razorpay ids are always assigned server-side.
 */
export const donationInputSchema = z.object({
  donorName: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("A valid email is required").max(200),
  phone: z
    .string()
    .trim()
    .min(7, "A valid phone number is required")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "A valid phone number is required"),
  isAnonymous: z.boolean().default(false),
  message: z.string().trim().max(1000).optional(),
  categoryId: objectId,
  packageId: objectId.nullable().optional(),
  amount: z
    .number()
    .int("Amount must be a whole number")
    .min(1, "Minimum donation is ₹1")
    .max(10_000_000, "Amount exceeds the allowed limit"),
});
export type DonationInput = z.infer<typeof donationInputSchema>;

/** Admin: create a donation category. */
export const categoryInputSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug may contain lowercase letters, numbers and hyphens"),
  description: z.string().trim().min(2).max(2000),
  image: z.string().trim().min(1, "Image is required").max(500),
  monthlyTarget: z.number().min(0).max(1_000_000_000),
  isActive: z.boolean().default(true),
});
export const categoryUpdateSchema = categoryInputSchema.partial();

/** Admin: create a donation package (preset amount within a category). */
export const packageInputSchema = z.object({
  categoryId: objectId,
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(2000),
  amount: z.number().int().min(1).max(10_000_000),
  image: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
});
export const packageUpdateSchema = packageInputSchema.partial();

/** Admin login credentials. */
export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(100),
  password: z.string().min(1, "Password is required").max(200),
});

/** First-time admin setup (bootstrap). */
export const setupSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

/** Admin account: create a new admin user (super-admin only). */
export const adminCreateSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  role: z.enum(["super_admin", "admin", "editor"]).default("admin"),
});

export const adminUpdateSchema = z.object({
  role: z.enum(["super_admin", "admin", "editor"]).optional(),
  isActive: z.boolean().optional(),
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
});

/** Change the signed-in admin's own password. */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(200),
});

/** Admin: manually record an offline donation. */
export const manualDonationSchema = z.object({
  donorName: z.string().trim().min(1, "Donor name is required").max(100),
  email: z.string().trim().toLowerCase().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  isAnonymous: z.boolean().default(false),
  categoryId: objectId,
  amount: z.number().int("Amount must be a whole number").min(1).max(10_000_000),
  paymentMethod: z.enum(["cash", "cheque", "bank_transfer", "upi", "other"]),
  notes: z.string().trim().max(1000).optional(),
  date: z.string().optional(), // yyyy-mm-dd; defaults to now
});

/** Public volunteer application. */
export const volunteerApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().toLowerCase().email("A valid email is required").max(200),
  phone: z
    .string()
    .trim()
    .min(7, "A valid contact number is required")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "A valid contact number is required"),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  age: z.number().int().min(10).max(120).optional().nullable(),
  occupation: z.string().trim().max(120).optional().or(z.literal("")),
  organization: z.string().trim().max(160).optional().or(z.literal("")),
  interestedAreas: z.array(z.string().max(60)).max(20).default([]),
  availability: z.string().trim().max(40).optional().or(z.literal("")),
  motivation: z.string().trim().max(2000).optional().or(z.literal("")),
  previousExperience: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v === true, "Consent is required"),
});

/** Admin: update a volunteer application. */
export const volunteerUpdateSchema = z.object({
  status: z
    .enum(["Pending", "In Review", "Contacted", "Accepted", "Rejected"])
    .optional(),
  adminNotes: z.string().max(4000).optional(),
});

/** Flatten a ZodError into a compact, client-friendly array. */
export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
