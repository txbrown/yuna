import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Editor } from './components/Editor';

/**
 * @feature Editor
 * @description Editor screen component that manages editor state and composes Editor components
 * @public-api EditorScreen (default export)
 */
export default function EditorScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isListActive, setIsListActive] = useState(false);

  const handleToggleBold = () => {
    setIsBoldActive((prev) => !prev);
  };

  const handleToggleItalic = () => {
    setIsItalicActive((prev) => !prev);
  };

  const handleToggleList = () => {
    setIsListActive((prev) => !prev);
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
      isListActive={isListActive}
      onToggleBold={handleToggleBold}
      onToggleItalic={handleToggleItalic}
      onToggleList={handleToggleList}
      backgroundPreset="sunny"
      onHeaderBackPress={handleBackPress}
    />
  );
}

