import { useState, useEffect, useCallback } from 'react';
import { Persona } from '../models/persona';
import { personaRepository } from '../repositories/persona-repository';

/**
 * Hook for managing personas
 */
export const usePersonas = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPersonas = useCallback(() => {
    setIsLoading(true);
    try {
      const allPersonas = personaRepository.getAll();
      setPersonas(allPersonas);
    } catch (error) {
      console.error('Failed to load personas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  const createPersona = useCallback(
    (data: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newPersona = personaRepository.create(data);
        setPersonas((prev) => [...prev, newPersona]);
        return newPersona;
      } catch (error) {
        console.error('Failed to create persona:', error);
        throw error;
      }
    },
    []
  );

  const updatePersona = useCallback(
    (id: string, updates: Partial<Omit<Persona, 'id' | 'createdAt'>>) => {
      try {
        const updated = personaRepository.update(id, updates);
        if (updated) {
          setPersonas((prev) =>
            prev.map((p) => (p.id === id ? updated : p))
          );
        }
        return updated;
      } catch (error) {
        console.error('Failed to update persona:', error);
        throw error;
      }
    },
    []
  );

  const deletePersona = useCallback((id: string) => {
    try {
      const deleted = personaRepository.delete(id);
      if (deleted) {
        setPersonas((prev) => prev.filter((p) => p.id !== id));
      }
      return deleted;
    } catch (error) {
      console.error('Failed to delete persona:', error);
      throw error;
    }
  }, []);

  const getPersona = useCallback((id: string) => {
    return personaRepository.getById(id);
  }, []);

  const resetToDefaults = useCallback(() => {
    try {
      personaRepository.reset();
      loadPersonas();
    } catch (error) {
      console.error('Failed to reset personas:', error);
      throw error;
    }
  }, [loadPersonas]);

  return {
    personas,
    isLoading,
    createPersona,
    updatePersona,
    deletePersona,
    getPersona,
    resetToDefaults,
    refresh: loadPersonas,
  };
};

