import { Persona, createPersona } from './models/persona';

/**
 * Avatar preset configuration type
 */
export interface AvatarPreset {
  id: string;
  emoji: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  name: string;
}

/**
 * Available avatar presets
 */
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'kid',
    emoji: '🧒',
    backgroundColor: '#FFF4E6',
    borderColor: '#FFB84D',
    textColor: '#8B4513',
    name: 'Kid',
  },
  {
    id: 'engineer',
    emoji: '👷',
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    textColor: '#1565C0',
    name: 'Engineer',
  },
  {
    id: 'scientist',
    emoji: '🔬',
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
    textColor: '#6A1B9A',
    name: 'Scientist',
  },
  {
    id: 'artist',
    emoji: '🎨',
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    textColor: '#C62828',
    name: 'Artist',
  },
  {
    id: 'writer',
    emoji: '✍️',
    backgroundColor: '#FFF9C4',
    borderColor: '#FFC107',
    textColor: '#F57F17',
    name: 'Writer',
  },
  {
    id: 'teacher',
    emoji: '👨‍🏫',
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    textColor: '#2E7D32',
    name: 'Teacher',
  },
  {
    id: 'doctor',
    emoji: '👨‍⚕️',
    backgroundColor: '#E0F2F1',
    borderColor: '#009688',
    textColor: '#00695C',
    name: 'Doctor',
  },
  {
    id: 'chef',
    emoji: '👨‍🍳',
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    textColor: '#E65100',
    name: 'Chef',
  },
  {
    id: 'athlete',
    emoji: '🏃',
    backgroundColor: '#E1F5FE',
    borderColor: '#00BCD4',
    textColor: '#00838F',
    name: 'Athlete',
  },
  {
    id: 'musician',
    emoji: '🎵',
    backgroundColor: '#FCE4EC',
    borderColor: '#E91E63',
    textColor: '#AD1457',
    name: 'Musician',
  },
  {
    id: 'explorer',
    emoji: '🧭',
    backgroundColor: '#E8EAF6',
    borderColor: '#3F51B5',
    textColor: '#283593',
    name: 'Explorer',
  },
  {
    id: 'wizard',
    emoji: '🧙',
    backgroundColor: '#F1F8E9',
    borderColor: '#8BC34A',
    textColor: '#558B2F',
    name: 'Wizard',
  },
  {
    id: 'robot',
    emoji: '🤖',
    backgroundColor: '#ECEFF1',
    borderColor: '#607D8B',
    textColor: '#37474F',
    name: 'Robot',
  },
  {
    id: 'ninja',
    emoji: '🥷',
    backgroundColor: '#EFEBE9',
    borderColor: '#795548',
    textColor: '#5D4037',
    name: 'Ninja',
  },
  {
    id: 'superhero',
    emoji: '🦸',
    backgroundColor: '#FFEBEE',
    borderColor: '#E91E63',
    textColor: '#AD1457',
    name: 'Superhero',
  },
];

/**
 * Get avatar preset by ID
 */
export const getAvatarPreset = (id: string): AvatarPreset | undefined => {
  return AVATAR_PRESETS.find((preset) => preset.id === id);
};

/**
 * Initial default personas
 */
export const DEFAULT_PERSONAS: Persona[] = [
  createPersona({
    name: '12 Year Old Kid',
    description:
      'A curious and energetic 12-year-old who asks lots of questions and uses simple language',
    systemPrompt:
      'You are a curious 12-year-old kid giving quick feedback on writing. Point out confusing parts, get excited about cool ideas, ask simple questions. Keep it short (2-3 sentences). Use casual kid language. Be helpful and enthusiastic!',
    temperature: 0.8,
    maxTokens: 256,
    avatarConfig: { presetId: 'kid' },
  }),
  createPersona({
    name: 'Engineer',
    description:
      'A practical engineer who thinks systematically and focuses on solutions',
    systemPrompt:
      'You are an engineer giving brief writing feedback. Point out unclear logic, missing details, or structure issues. Suggest improvements. Be direct and concise (2-3 sentences). Focus on clarity and precision.',
    temperature: 0.5,
    maxTokens: 512,
    avatarConfig: { presetId: 'engineer' },
  }),
  createPersona({
    name: 'Scientist',
    description:
      'A methodical scientist who values evidence, accuracy, and thorough explanations',
    systemPrompt:
      'You are a scientist giving quick writing feedback. Identify unsupported claims, ask for evidence or examples, point out logical gaps. Be analytical but brief (2-3 sentences). Stay curious and constructive.',
    temperature: 0.6,
    maxTokens: 512,
    avatarConfig: { presetId: 'scientist' },
  }),
];

/**
 * Default persona settings
 */
export const DEFAULT_PERSONA_TEMPERATURE = 0.7;
export const DEFAULT_PERSONA_MAX_TOKENS = 512;
