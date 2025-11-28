import { NoteSchema, CreateNoteSchema, UpdateNoteSchema } from '../models/note';

describe('Note Model', () => {
  describe('NoteSchema', () => {
    it('should validate a valid note', () => {
      const validNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Note',
        content: '# Test Content\n\nThis is a test note.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = NoteSchema.safeParse(validNote);
      expect(result.success).toBe(true);
    });

    it('should reject note with invalid UUID', () => {
      const invalidNote = {
        id: 'not-a-uuid',
        title: 'Test Note',
        content: 'Test content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = NoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });

    it('should reject note with empty title', () => {
      const invalidNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: '',
        content: 'Test content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = NoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });

    it('should reject note with title exceeding 255 characters', () => {
      const invalidNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'a'.repeat(256),
        content: 'Test content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = NoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });

    it('should accept note with markdown content', () => {
      const validNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Markdown Note',
        content: '# Heading\n\n- List item 1\n- List item 2\n\n**Bold text**',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = NoteSchema.safeParse(validNote);
      expect(result.success).toBe(true);
    });

    it('should accept note with empty content', () => {
      const validNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Empty Note',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = NoteSchema.safeParse(validNote);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateNoteSchema', () => {
    it('should validate valid create input', () => {
      const validInput = {
        title: 'New Note',
        content: '# New content',
      };

      const result = CreateNoteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with id field', () => {
      const invalidInput = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'New Note',
        content: 'Content',
      };

      const result = CreateNoteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject input with timestamps', () => {
      const invalidInput = {
        title: 'New Note',
        content: 'Content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = CreateNoteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateNoteSchema', () => {
    it('should validate partial update with title only', () => {
      const validInput = {
        title: 'Updated Title',
      };

      const result = UpdateNoteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate partial update with content only', () => {
      const validInput = {
        content: 'Updated content',
      };

      const result = UpdateNoteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate update with both fields', () => {
      const validInput = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const result = UpdateNoteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate empty update object', () => {
      const validInput = {};

      const result = UpdateNoteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });
});
