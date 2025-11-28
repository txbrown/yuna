import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNotes } from '@/features/notes/hooks/useNotes';

export default function NotesDebugScreen() {
  const {
    notes,
    isLoading,
    error,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting,
  } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      await createNote({ title, content });
      setTitle('');
      setContent('');
      Alert.alert('Success', 'Note created!');
    } catch (err) {
      Alert.alert('Error', 'Failed to create note: ' + (err as Error).message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedNoteId) {
      Alert.alert('Error', 'No note selected');
      return;
    }

    try {
      await updateNote(selectedNoteId, { title, content });
      setTitle('');
      setContent('');
      setSelectedNoteId(null);
      Alert.alert('Success', 'Note updated!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update note: ' + (err as Error).message);
    }
  };

  const handleSelectNote = async (id: string) => {
    const note = await getNote(id);
    if (note) {
      setSelectedNoteId(note.id);
      setTitle(note.title);
      setContent(note.content);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(id);
              if (selectedNoteId === id) {
                setSelectedNoteId(null);
                setTitle('');
                setContent('');
              }
              Alert.alert('Success', 'Note deleted!');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete note: ' + (err as Error).message);
            }
          },
        },
      ]
    );
  };

  const handleClear = () => {
    setSelectedNoteId(null);
    setTitle('');
    setContent('');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>Notes Debug Screen</Text>
        <Text style={styles.subheader}>Total Notes: {notes.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedNoteId ? 'Edit Note' : 'Create Note'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Content (Markdown)"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonRow}>
          {selectedNoteId ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdate}
                disabled={isUpdating}
              >
                <Text style={styles.buttonText}>
                  {isUpdating ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClear}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreate}
              disabled={isCreating}
            >
              <Text style={styles.buttonText}>
                {isCreating ? 'Creating...' : 'Create Note'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes List</Text>

        {notes.length === 0 ? (
          <Text style={styles.emptyText}>No notes yet. Create one above!</Text>
        ) : (
          notes.map((note) => (
            <View
              key={note.id}
              style={[
                styles.noteCard,
                selectedNoteId === note.id && styles.selectedCard,
              ]}
            >
              <TouchableOpacity
                onPress={() => handleSelectNote(note.id)}
                style={styles.noteContent}
              >
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {note.content || 'No content'}
                </Text>
                <Text style={styles.noteDate}>
                  Updated: {new Date(note.updatedAt).toLocaleString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => handleDelete(note.id)}
                disabled={isDeleting}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    padding: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#4caf50',
  },
  updateButton: {
    backgroundColor: '#2196f3',
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    flex: 0,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  noteContent: {
    flex: 1,
    marginRight: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});
