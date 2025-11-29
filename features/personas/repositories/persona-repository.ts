import { DEFAULT_PERSONAS } from '../constants';
import { Persona, createPersona, updatePersona } from '../models/persona';

/**
 * Repository for managing personas in memory
 * TODO: In the future, this could be backed by AsyncStorage or SQLite
 */
export class PersonaRepository {
  private personas: Map<string, Persona> = new Map();

  constructor() {
    // Initialize with default personas
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    DEFAULT_PERSONAS.forEach((persona) => {
      this.personas.set(persona.id, persona);
    });
  }

  /**
   * Get all personas
   */
  getAll(): Persona[] {
    return Array.from(this.personas.values());
  }

  /**
   * Get a persona by ID
   */
  getById(id: string): Persona | null {
    return this.personas.get(id) || null;
  }

  /**
   * Create a new persona
   */
  create(data: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>): Persona {
    const persona = createPersona(data);
    this.personas.set(persona.id, persona);
    return persona;
  }

  /**
   * Update an existing persona
   */
  update(
    id: string,
    updates: Partial<Omit<Persona, 'id' | 'createdAt'>>
  ): Persona | null {
    const existing = this.personas.get(id);
    if (!existing) {
      return null;
    }

    const updated = updatePersona(existing, updates);
    this.personas.set(id, updated);
    return updated;
  }

  /**
   * Delete a persona
   */
  delete(id: string): boolean {
    return this.personas.delete(id);
  }

  /**
   * Check if a persona exists
   */
  exists(id: string): boolean {
    return this.personas.has(id);
  }

  /**
   * Get count of personas
   */
  count(): number {
    return this.personas.size;
  }

  /**
   * Reset to default personas
   */
  reset(): void {
    this.personas.clear();
    this.initializeDefaults();
  }
}

// Singleton instance
export const personaRepository = new PersonaRepository();
