import { NotesRepository } from '../repositories/notes-repository';
import { Database } from '../database/database';
import type { CreateNoteInput, UpdateNoteInput } from '../models/note';

describe('NotesRepository', () => {
  let repository: NotesRepository;
  let database: Database;

  beforeEach(async () => {
    database = Database.getInstance();
    await database.initialize();
    repository = new NotesRepository(database);
  });

  afterEach(async () => {
    await database.reset();
    await database.close();
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const input: CreateNoteInput = {
        title: 'Test Note',
        content: '# Test Content\n\nThis is markdown content.',
      };

      const note = await repository.create(input);

      expect(note.id).toBeDefined();
      expect(note.title).toBe(input.title);
      expect(note.content).toBe(input.content);
      expect(note.createdAt).toBeGreaterThan(0);
      expect(note.updatedAt).toBeGreaterThan(0);
      expect(note.createdAt).toBe(note.updatedAt);
    });

    it('should generate unique IDs for each note', async () => {
      const input: CreateNoteInput = {
        title: 'Test Note',
        content: 'Content',
      };

      const note1 = await repository.create(input);
      const note2 = await repository.create(input);

      expect(note1.id).not.toBe(note2.id);
    });

    it('should validate input before creating', async () => {
      const invalidInput = {
        title: '',
        content: 'Content',
      } as CreateNoteInput;

      await expect(repository.create(invalidInput)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find a note by ID', async () => {
      const input: CreateNoteInput = {
        title: 'Find Me',
        content: 'Content',
      };

      const created = await repository.create(input);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe(created.title);
      expect(found?.content).toBe(created.content);
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById('550e8400-e29b-41d4-a716-446655440000');
      expect(found).toBeNull();
    });

    it('should validate note data from database', async () => {
      const input: CreateNoteInput = {
        title: 'Test',
        content: 'Content',
      };

      const created = await repository.create(input);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all notes ordered by updatedAt descending', async () => {
      const note1 = await repository.create({ title: 'Note 1', content: 'Content 1' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const note2 = await repository.create({ title: 'Note 2', content: 'Content 2' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const note3 = await repository.create({ title: 'Note 3', content: 'Content 3' });

      const notes = await repository.findAll();

      expect(notes).toHaveLength(3);
      expect(notes[0].id).toBe(note3.id);
      expect(notes[1].id).toBe(note2.id);
      expect(notes[2].id).toBe(note1.id);
    });

    it('should return empty array when no notes exist', async () => {
      const notes = await repository.findAll();
      expect(notes).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update note title', async () => {
      const created = await repository.create({
        title: 'Original Title',
        content: 'Content',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const update: UpdateNoteInput = {
        title: 'Updated Title',
      };

      const updated = await repository.update(created.id, update);

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.content).toBe('Content');
      expect(updated?.updatedAt).toBeGreaterThan(created.updatedAt);
    });

    it('should update note content', async () => {
      const created = await repository.create({
        title: 'Title',
        content: 'Original Content',
      });

      const update: UpdateNoteInput = {
        content: '# Updated Content\n\nNew markdown content.',
      };

      const updated = await repository.update(created.id, update);

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Title');
      expect(updated?.content).toBe('# Updated Content\n\nNew markdown content.');
    });

    it('should update both title and content', async () => {
      const created = await repository.create({
        title: 'Title',
        content: 'Content',
      });

      const update: UpdateNoteInput = {
        title: 'New Title',
        content: 'New Content',
      };

      const updated = await repository.update(created.id, update);

      expect(updated?.title).toBe('New Title');
      expect(updated?.content).toBe('New Content');
    });

    it('should return null when updating non-existent note', async () => {
      const updated = await repository.update('550e8400-e29b-41d4-a716-446655440000', {
        title: 'New Title',
      });

      expect(updated).toBeNull();
    });

    it('should not modify createdAt timestamp', async () => {
      const created = await repository.create({
        title: 'Title',
        content: 'Content',
      });

      const updated = await repository.update(created.id, { title: 'New Title' });

      expect(updated?.createdAt).toBe(created.createdAt);
    });

    it('should validate update input', async () => {
      const created = await repository.create({
        title: 'Title',
        content: 'Content',
      });

      const invalidUpdate = { title: '' } as UpdateNoteInput;

      await expect(repository.update(created.id, invalidUpdate)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a note by ID', async () => {
      const created = await repository.create({
        title: 'To Delete',
        content: 'Content',
      });

      const result = await repository.delete(created.id);
      expect(result).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent note', async () => {
      const result = await repository.delete('550e8400-e29b-41d4-a716-446655440000');
      expect(result).toBe(false);
    });

    it('should not affect other notes', async () => {
      const note1 = await repository.create({ title: 'Note 1', content: 'Content 1' });
      const note2 = await repository.create({ title: 'Note 2', content: 'Content 2' });

      await repository.delete(note1.id);

      const notes = await repository.findAll();
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe(note2.id);
    });
  });
});
