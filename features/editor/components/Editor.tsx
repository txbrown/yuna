import { AnimatedBackground } from '@shared/components/AnimatedBackground';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { EditorProps } from '../types';
import { EditorContent } from './EditorContent';
import { EditorHeader } from './EditorHeader';
import { EditorToolbar } from './EditorToolbar';

/**
 * @description Main Editor component that composes AnimatedBackground, EditorContent, and EditorToolbar
 * @example
 * <Editor
 *   content={content}
 *   onChangeText={handleChange}
 *   isBoldActive={isBold}
 *   onToggleBold={handleToggleBold}
 *   // ... other props
 * />
 */
export const Editor: React.FC<EditorProps> = ({
  content,
  onChangeText,
  isBoldActive,
  isItalicActive,
  isUnderlineActive,
  isStrikeThroughActive,
  isListActive,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrikeThrough,
  onToggleList,
  backgroundPreset,
  headerTitle,
  onHeaderBackPress,
  onHeaderSharePress,
  onSelectionChange,
  inputRef,
  onEditorModeChange,
  onChangeState,
}) => {
  const [isInEditorMode, setIsInEditorMode] = React.useState(false);

  const handleEditorModeChange = (isEditing: boolean) => {
    setIsInEditorMode(isEditing);
    if (onEditorModeChange) {
      onEditorModeChange(isEditing);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground preset={backgroundPreset}>
        <View style={styles.editorContainer}>
          <EditorHeader
            title={headerTitle}
            onBackPress={onHeaderBackPress}
            onSharePress={onHeaderSharePress}
          />
          <EditorContent
            content={content}
            onChangeText={onChangeText}
            onEditorModeChange={handleEditorModeChange}
            onSelectionChange={onSelectionChange}
            inputRef={inputRef}
            onChangeState={onChangeState}
          />
          <EditorToolbar
            isBoldActive={isBoldActive}
            isItalicActive={isItalicActive}
            isUnderlineActive={isUnderlineActive}
            isStrikeThroughActive={isStrikeThroughActive}
            isListActive={isListActive}
            onToggleBold={onToggleBold}
            onToggleItalic={onToggleItalic}
            onToggleUnderline={onToggleUnderline}
            onToggleStrikeThrough={onToggleStrikeThrough}
            onToggleList={onToggleList}
            isVisible={isInEditorMode}
            showItalic={false} // Hide italic since Orbitron doesn't support it
          />
        </View>
      </AnimatedBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  editorContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

