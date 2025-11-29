import { z } from 'zod';

/**
 * Persona model - represents a character/personality for the LLM
 */
export const personaSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  systemPrompt: z.string().min(1),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(512),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Persona = z.infer<typeof personaSchema>;

/**
 * Create a new persona
 */
export const createPersona = (
  data: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>
): Persona => {
  const now = Date.now();
  return {
    ...data,
    id: `persona_${now}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Update an existing persona
 */
export const updatePersona = (
  persona: Persona,
  updates: Partial<Omit<Persona, 'id' | 'createdAt'>>
): Persona => {
  return {
    ...persona,
    ...updates,
    updatedAt: Date.now(),
  };
};

/**
 * Validate persona data
 */
export const validatePersona = (data: unknown): Persona => {
  return personaSchema.parse(data);
};

/**
 * Type guard for Persona
 */
export const isPersona = (data: unknown): data is Persona => {
  return personaSchema.safeParse(data).success;
};
