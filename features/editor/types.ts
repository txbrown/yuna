/**
 * @feature Editor
 * @description Type definitions for Editor UI components
 */

import React from 'react';

/**
 * Props for EditorContent component
 */
export interface EditorContentProps {
  content: string; // Markdown content
  onChangeText: (text: string) => void; // Called with markdown
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  onEditorModeChange?: (isInEditorMode: boolean) => void;
  onSelectionChange?: (start: number, end: number, text?: string) => void;
  inputRef?: React.RefObject<any>; // Ref to EnrichedTextInputInstance
  onChangeState?: (state: any) => void; // For style state updates
}

/**
 * Props for EditorToolbar component
 */
export interface EditorToolbarProps {
  isBoldActive: boolean;
  isItalicActive: boolean;
  isUnderlineActive: boolean;
  isStrikeThroughActive: boolean;
  isListActive: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onToggleStrikeThrough: () => void;
  onToggleList: () => void;
  isVisible?: boolean;
  showItalic?: boolean; // Show/hide italic button based on font support
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
  content: string; // Markdown content
  onChangeText: (text: string) => void; // Called with markdown
  isBoldActive: boolean;
  isItalicActive: boolean;
  isUnderlineActive: boolean;
  isStrikeThroughActive: boolean;
  isListActive: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onToggleStrikeThrough: () => void;
  onToggleList: () => void;
  headerTitle?: string;
  onHeaderBackPress?: () => void;
  onHeaderSharePress?: () => void;
  onSelectionChange?: (start: number, end: number, text?: string) => void;
  inputRef?: React.RefObject<any>; // Ref to EnrichedTextInputInstance
  onEditorModeChange?: (isEditing: boolean) => void;
  onChangeState?: (state: any) => void; // For style state updates
}

