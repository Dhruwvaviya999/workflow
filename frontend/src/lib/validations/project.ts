import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required.").max(150),
  description: z.string().max(2000).optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a hex color like #4f46e5.")
    .optional(),
  status: z.enum(["active", "on_hold", "completed"]).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
