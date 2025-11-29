import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Editor } from './components/Editor';
import type { RichTextEditorRef } from './components/RichTextEditor';

/**
 * @feature Editor
 * @description Editor screen component that manages editor state and composes Editor components
 * @public-api EditorScreen (default export)
 */
export default function EditorScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [styleState, setStyleState] = useState<any>(null);
  const inputRef = useRef<RichTextEditorRef | null>(null);

  // Get active states from EnrichedTextInput's onChangeState
  const isBoldActive = styleState?.isBold ?? false;
  const isItalicActive = styleState?.isItalic ?? false;
  const isUnderlineActive = styleState?.isUnderline ?? false;
  const isStrikeThroughActive = styleState?.isStrikeThrough ?? false;
  const isListActive = styleState?.isUnorderedList ?? false;

  const handleSelectionChange = (start: number, end: number) => {
    // Selection change is handled by EnrichedTextInput
  };

  const handleToggleBold = () => {
    inputRef.current?.toggleBold();
  };

  const handleToggleItalic = () => {
    inputRef.current?.toggleItalic();
  };

  const handleToggleUnderline = () => {
    inputRef.current?.toggleUnderline();
  };

  const handleToggleStrikeThrough = () => {
    inputRef.current?.toggleStrikeThrough();
  };

  const handleToggleList = () => {
    inputRef.current?.toggleUnorderedList();
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <Editor
      content={content}
      onChangeText={setContent}
      isBoldActive={isBoldActive}
      isItalicActive={isItalicActive}
      isUnderlineActive={isUnderlineActive}
      isStrikeThroughActive={isStrikeThroughActive}
      isListActive={isListActive}
      onToggleBold={handleToggleBold}
      onToggleItalic={handleToggleItalic}
      onToggleUnderline={handleToggleUnderline}
      onToggleStrikeThrough={handleToggleStrikeThrough}
      onToggleList={handleToggleList}
      onHeaderBackPress={handleBackPress}
      onSelectionChange={handleSelectionChange}
      inputRef={inputRef}
      onEditorModeChange={setIsEditing}
      onChangeState={setStyleState}
    />
  );
}

