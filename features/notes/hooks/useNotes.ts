import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotesContext } from '../providers/NotesProvider';
import type { Note, CreateNoteInput, UpdateNoteInput } from '../models/note';

const NOTES_QUERY_KEY = ['notes'];
const noteQueryKey = (id: string) => ['notes', id];

export function useNotes() {
  const { repository } = useNotesContext();
  const queryClient = useQueryClient();

  // Query for all notes
  const notesQuery = useQuery<Note[], Error>({
    queryKey: NOTES_QUERY_KEY,
    queryFn: () => repository.findAll(),
  });

  // Get single note function
  const getNote = async (id: string): Promise<Note | null> => {
    // Check cache first
    const cached = queryClient.getQueryData<Note | null>(noteQueryKey(id));
    if (cached) return cached;

    // Fetch from database
    const note = await repository.findById(id);

    // Cache it
    if (note) {
      queryClient.setQueryData(noteQueryKey(id), note);
    }

    return note;
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateNoteInput) => repository.create(input),
    onSuccess: (newNote) => {
      // Invalidate and refetch notes list
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      // Cache the new note
      queryClient.setQueryData(noteQueryKey(newNote.id), newNote);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      repository.update(id, input),
    onSuccess: (updatedNote, { id }) => {
      if (updatedNote) {
        // Update cache for this specific note
        queryClient.setQueryData(noteQueryKey(id), updatedNote);
        // Invalidate notes list to refresh order (updatedAt changed)
        queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: noteQueryKey(id) });
      // Invalidate notes list
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });

  return {
    // Query state
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    refetch: notesQuery.refetch,

    // Read operations
    getNote,

    // Mutation functions
    createNote: createMutation.mutateAsync,
    updateNote: (id: string, input: UpdateNoteInput) =>
      updateMutation.mutateAsync({ id, input }),
    deleteNote: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
