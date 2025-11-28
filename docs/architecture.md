# Architecture Guide

> Conventions and rules for multi-engineer/LLM collaboration

## Core Architectural Principles

### 1. Feature Module Structure (Strict Convention)

```
features/
└── {feature-name}/          # kebab-case, singular noun
    ├── components/          # Feature-specific components
    ├── hooks/              # Feature-specific hooks
    ├── utils/              # Feature-specific utilities
    ├── types.ts            # Feature type definitions
    ├── constants.ts        # Feature constants
    ├── index.ts            # Public API (REQUIRED)
    └── {feature-name}.test.ts  # Feature tests
```

### 2. Naming Conventions (Non-Negotiable)

**Files:**
- Components:     `PascalCase.tsx`        (`NoteCard.tsx`)
- Hooks:          `camelCase.ts`          (`useNotes.ts`)
- Utils:          `camelCase.ts`          (`formatDate.ts`)
- Types:          `types.ts`              (per feature/module)
- Constants:      `constants.ts`          (per feature/module)
- Tests:          `{name}.test.ts(x)`     (`NoteCard.test.tsx`)

**Folders:**
- Features:       `kebab-case, singular`  (`note-editor/`)
- All others:     `kebab-case, plural`    (`components/`, `hooks/`)

**Exports:**
- Components:     `PascalCase`            (`export const NoteCard`)
- Hooks:          `use + PascalCase`      (`export const useNotes`)
- Utils:          `camelCase`             (`export const formatDate`)
- Types:          `PascalCase`            (`export type Note`)
- Constants:      `SCREAMING_SNAKE`       (`export const MAX_NOTE_LENGTH`)

### 3. Index.ts Pattern (Controlled Exports)

Every feature MUST have an index.ts that defines its public API:

```typescript
// features/notes/index.ts
export { NoteCard, NoteList } from './components/NoteCard'
export { useNotes, useNoteEditor } from './hooks/useNotes'
export type { Note, NoteMetadata } from './types'
export { NOTE_CONSTANTS } from './constants'

// DO NOT export utils unless explicitly public
// Internal utils stay private to the feature
```

### 4. Import Rules (Path Aliases)

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@features/*": ["./features/*"],
      "@data/*": ["./data/*"],
      "@services/*": ["./services/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

**Import hierarchy** (top cannot import from bottom):
```
app/              (routing layer)
  ↓
features/         (business features)
  ↓
services/         (cross-cutting concerns)
  ↓
data/             (storage & models)
  ↓
shared/           (pure utilities)
```

### 5. Type Definitions (Single Source of Truth)

```
data/
└── models/
    ├── note.model.ts       # Data model + validation
    ├── folder.model.ts
    └── index.ts
```

Each model file contains:
- Type definition
- Zod schema (or similar validator)
- Factory functions
- Type guards

### 6. Component Organization

**Simple components:**
```
features/{feature}/components/
├── {ComponentName}.tsx           # Component implementation
├── {ComponentName}.styles.ts     # If using styled-components
└── {ComponentName}.test.tsx      # Component tests
```

**Complex components:**
```
features/{feature}/components/
└── {ComponentName}/
    ├── index.tsx
    ├── {ComponentName}.tsx
    ├── {ComponentName}.styles.ts
    └── {ComponentName}.test.tsx
```

### 7. Hook Conventions

```typescript
// hooks/useFeatureName.ts
// ONE hook per file
// Hook name = file name

export const useNotes = () => {
  // Implementation
}

// Co-located helpers (private to hook)
const privateHelper = () => {}
```

### 8. Shared Module Organization

```
shared/
├── components/       # UI primitives (Button, Input, Modal)
├── hooks/           # Generic hooks (useDebounce, useAsync)
├── utils/           # Pure functions (formatters, validators)
├── constants/       # App-wide constants
└── types/           # Global types
```

### 9. Data Layer Pattern

```
data/
├── models/          # Type definitions + schemas
├── repositories/    # Data access layer
│   ├── note.repository.ts
│   └── index.ts
├── storage/         # Storage implementations
│   ├── async-storage.ts
│   ├── sqlite.ts
│   └── index.ts
└── index.ts         # Export repositories only
```

### 10. Documentation Requirements

Every feature `index.ts` should have:
```typescript
/**
 * @feature Notes
 * @description Core note management functionality
 * @public-api NoteCard, NoteList, useNotes
 */
```

Every public component/hook:
```typescript
/**
 * @description Renders a note card with title and preview
 * @example
 * <NoteCard note={note} onPress={handlePress} />
 */
```

### 11. Configuration Files

```
Root level:
├── .eslintrc.js       # Code style enforcement
├── .prettierrc        # Formatting rules
├── tsconfig.json      # TypeScript config
└── metro.config.js    # Metro bundler config
```

**Required ESLint rules:**
- No default exports (except for Expo Router screens)
- Enforce import order
- Enforce naming conventions
- No circular dependencies

### 12. File Size Limits

- Components: < 250 lines (split if larger)
- Hooks: < 150 lines
- Utils: < 100 lines per function
- Types file: unlimited (but group logically)

### 13. Testing Structure

Mirror source structure:
```
features/{feature}/__tests__/
```

OR co-located:
```
{ComponentName}.test.tsx
```

**Test naming:**
```typescript
describe('ComponentName', () => {
  it('should do something specific', () => {})
})
```

### 14. Barrel Export Pattern

```typescript
// features/index.ts (aggregates all features)
export * from './notes'
export * from './editor'
export * from './search'

// Allows: import { useNotes, useEditor } from '@features'
```

### 15. Code Ownership (Optional)

```
.github/CODEOWNERS
/features/notes/          @team-notes
/features/editor/         @team-editor
/data/                    @team-platform
```

## Key Rules for LLM/Multi-Engineer Teams

1. **No implicit exports** - Everything goes through `index.ts`
2. **No cross-feature imports** - Only import from feature's `index.ts`
3. **One responsibility per file** - One component, one hook, one util
4. **Predictable file locations** - If it's a hook, it's in `hooks/`
5. **Type-first development** - Define `types.ts` before implementation
6. **No magic strings** - Everything in `constants.ts`
7. **Explicit dependencies** - No circular imports, enforce with ESLint
8. **Consistent naming** - Automated enforcement via linting

## Example Feature Structure

```
features/notes/
├── components/
│   ├── NoteCard.tsx
│   ├── NoteList.tsx
│   └── NoteEditor/
│       ├── index.tsx
│       ├── NoteEditor.tsx
│       └── NoteEditor.test.tsx
├── hooks/
│   ├── useNotes.ts
│   ├── useNoteEditor.ts
│   └── useNoteSearch.ts
├── utils/
│   ├── formatNote.ts
│   └── validateNote.ts
├── types.ts
├── constants.ts
├── index.ts
└── notes.test.ts
```

## Path Alias Examples

```typescript
// ✅ Good
import { useNotes } from '@features/notes'
import { NoteModel } from '@data/models'
import { formatDate } from '@shared/utils'

// ❌ Bad
import { useNotes } from '../../../features/notes'
import { NoteCard } from '@features/notes/components/NoteCard'  // Not through index
```

## Import Order Convention

```typescript
// 1. React/React Native
import React from 'react'
import { View, Text } from 'react-native'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'

// 3. Aliases (@/*) - alphabetical
import { NoteModel } from '@data/models'
import { useNotes } from '@features/notes'
import { Button } from '@shared/components'

// 4. Relative imports
import { formatNote } from './utils/formatNote'
import type { NoteProps } from './types'
```

## Decision Tree for File Placement

```
Is it used by multiple features?
├─ Yes → shared/
└─ No → features/{feature-name}/

Is it about data persistence?
├─ Yes → data/
└─ No → Continue...

Is it a cross-cutting concern (analytics, logging)?
├─ Yes → services/
└─ No → features/{feature-name}/

Is it a React component?
├─ Yes → components/
└─ No → Continue...

Does it start with "use" and use React hooks?
├─ Yes → hooks/
└─ No → utils/
```
