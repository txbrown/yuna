/**
 * @feature Personas
 * @description AI persona management and chat functionality using local LLM (Cactus)
 * @public-api PersonaCard, PersonaList, PersonaChat, usePersonas, usePersonaChat
 */

// Components
export { PersonaCard } from './components/PersonaCard';
export type { PersonaCardProps } from './components/PersonaCard';

export { PersonaList } from './components/PersonaList';
export type { PersonaListProps } from './components/PersonaList';

export { PersonaChat } from './components/PersonaChat';
export type { PersonaChatProps } from './components/PersonaChat';

export { PersonaEditor } from './components/PersonaEditor';
export type { PersonaEditorProps } from './components/PersonaEditor';

// Hooks
export { usePersonaChat } from './hooks/usePersonaChat';
export type { ChatMessage } from './hooks/usePersonaChat';
export { usePersonas } from './hooks/usePersonas';

// Models
export {
  createPersona,
  isPersona,
  updatePersona,
  validatePersona,
} from './models/persona';
export type { Persona } from './models/persona';

// Services
export { cactusService } from './services/cactus-service';
export type {
  CactusModel,
  CompletionMessage,
  CompletionOptions,
  CompletionResult,
} from './services/cactus-service';

// Constants
export {
  DEFAULT_PERSONA_MAX_TOKENS,
  DEFAULT_PERSONA_TEMPERATURE,
  DEFAULT_PERSONAS,
} from './constants';
