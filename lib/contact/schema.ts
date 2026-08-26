import { z } from 'zod';

/**
 * Shared by the s06 form and the route handler, so the client cannot submit
 * something the server would reject for a different reason.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
