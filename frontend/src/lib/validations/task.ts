import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required.").max(255),
  description: z.string().max(5000).optional(),
  status: z
    .enum(["todo", "in_progress", "review", "completed", "cancelled"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  due_date: z.string().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  estimated_hours: z.string().optional().or(z.literal("")),
});

export type TaskInput = z.infer<typeof taskSchema>;
