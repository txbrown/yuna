import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export const CreateNoteSchema = NoteSchema.omit({ id: true, createdAt: true, updatedAt: true }).strict();

export const UpdateNoteSchema = CreateNoteSchema.partial().strict();

export type Note = z.infer<typeof NoteSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
