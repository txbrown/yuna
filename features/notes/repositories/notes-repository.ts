import * as Crypto from 'expo-crypto';
import { Database } from '../database/database';
import { Note, CreateNoteInput, UpdateNoteInput, NoteSchema, CreateNoteSchema, UpdateNoteSchema } from '../models/note';

interface NoteRow {
  id: string;
  title: string;
  content: string;
  created_at: number;
  updated_at: number;
}

export class NotesRepository {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  async create(input: CreateNoteInput): Promise<Note> {
    const validated = CreateNoteSchema.parse(input);

    const id = Crypto.randomUUID();
    const now = Date.now();

    const note: Note = {
      id,
      title: validated.title,
      content: validated.content,
      createdAt: now,
      updatedAt: now,
    };

    NoteSchema.parse(note);

    const database = this.db.getDatabase();
    await database.runAsync(
      'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [note.id, note.title, note.content, note.createdAt, note.updatedAt]
    );

    return note;
  }

  async findById(id: string): Promise<Note | null> {
    const database = this.db.getDatabase();
    const row = await database.getFirstAsync<NoteRow>(
      'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?',
      [id]
    );

    if (!row) {
      return null;
    }

    return this.mapRowToNote(row);
  }

  async findAll(): Promise<Note[]> {
    const database = this.db.getDatabase();
    const rows = await database.getAllAsync<NoteRow>(
      'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC'
    );

    return rows.map((row) => this.mapRowToNote(row));
  }

  async update(id: string, input: UpdateNoteInput): Promise<Note | null> {
    const validated = UpdateNoteSchema.parse(input);

    if (Object.keys(validated).length === 0) {
      return this.findById(id);
    }

    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const updatedNote: Note = {
      ...existing,
      ...validated,
      updatedAt: Date.now(),
    };

    NoteSchema.parse(updatedNote);

    const database = this.db.getDatabase();
    const result = await database.runAsync(
      'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?',
      [updatedNote.title, updatedNote.content, updatedNote.updatedAt, id]
    );

    if (result.changes === 0) {
      return null;
    }

    return updatedNote;
  }

  async delete(id: string): Promise<boolean> {
    const database = this.db.getDatabase();
    const result = await database.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    return result.changes > 0;
  }

  private mapRowToNote(row: NoteRow): Note {
    const note: Note = {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return NoteSchema.parse(note);
  }
}
