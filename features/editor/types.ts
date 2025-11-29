/**
 * @feature Editor
 * @description Type definitions for Editor UI components
 */

/**
 * Props for EditorContent component
 */
export interface EditorContentProps {
  content: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  onEditorModeChange?: (isInEditorMode: boolean) => void;
}

/**
 * Props for EditorToolbar component
 */
export interface EditorToolbarProps {
  isBoldActive: boolean;
  isItalicActive: boolean;
  isListActive: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleList: () => void;
  isVisible?: boolean;
}

/**
 * Props for EditorHeader component
 */
export interface EditorHeaderProps {
  onBackPress?: () => void;
  onSharePress?: () => void;
  title?: string;
}

/**
 * Props for Editor component
 */
export interface EditorProps {
  content: string;
  onChangeText: (text: string) => void;
  isBoldActive: boolean;
  isItalicActive: boolean;
  isListActive: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleList: () => void;
  backgroundPreset?: 'sunny' | 'rainy';
  headerTitle?: string;
  onHeaderBackPress?: () => void;
  onHeaderSharePress?: () => void;
}

