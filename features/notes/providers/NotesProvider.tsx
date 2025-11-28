import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { database, Database, NotesRepository } from '../index';

interface NotesContextValue {
  repository: NotesRepository;
  database: Database;
  isInitialized: boolean;
}

const NotesContext = createContext<NotesContextValue | null>(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [repository, setRepository] = useState<NotesRepository | null>(null);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        await database.initialize();
        const repo = new NotesRepository(database);
        setRepository(repo);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }

    initializeDatabase();
  }, []);

  if (!isInitialized || !repository) {
    return null;
  }

  return (
    <NotesContext.Provider value={{ repository, database, isInitialized }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </NotesContext.Provider>
  );
}

export function useNotesContext(): NotesContextValue {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within NotesProvider');
  }
  return context;
}
