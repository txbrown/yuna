# Notes Feature

Data layer for the notes feature in Yuna note-taking app.

## Features

- SQLite database storage using expo-sqlite
- Type-safe CRUD operations
- Zod schema validation
- Markdown content support
- Full test coverage (36 tests)

## Usage

```typescript
import { database, NotesRepository } from '@/features/notes';

// Initialize the database
await database.initialize();

// Create a repository instance
const notesRepo = new NotesRepository(database);

// Create a note
const note = await notesRepo.create({
  title: 'My First Note',
  content: '# Hello World\n\nThis is my first note in **markdown**!',
});

// Find all notes (ordered by updatedAt desc)
const allNotes = await notesRepo.findAll();

// Find note by ID
const foundNote = await notesRepo.findById(note.id);

// Update a note
const updated = await notesRepo.update(note.id, {
  title: 'Updated Title',
  content: '# Updated Content',
});

// Delete a note
await notesRepo.delete(note.id);
```

## Database Schema

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
```

## Types

### Note
```typescript
{
  id: string;           // UUID
  title: string;        // 1-255 characters
  content: string;      // Markdown content
  createdAt: number;    // Unix timestamp
  updatedAt: number;    // Unix timestamp
}
```

### CreateNoteInput
```typescript
{
  title: string;
  content: string;
}
```

### UpdateNoteInput
```typescript
{
  title?: string;
  content?: string;
}
```

## Testing

Run tests:
```bash
npm test features/notes/
```

All operations are validated with Zod schemas, ensuring type safety at runtime.
