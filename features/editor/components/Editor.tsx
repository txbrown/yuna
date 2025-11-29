import React from 'react';
import { StyleSheet, View } from 'react-native';
// import { AnimatedBackground } from '@shared/components/AnimatedBackground';
import { EditorContent } from './EditorContent';
import { EditorToolbar } from './EditorToolbar';
import { EditorHeader } from './EditorHeader';
import type { EditorProps } from '../types';

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
  isListActive,
  onToggleBold,
  onToggleItalic,
  onToggleList,
  backgroundPreset,
  headerTitle,
  onHeaderBackPress,
  onHeaderSharePress,
}) => {
  const [isInEditorMode, setIsInEditorMode] = React.useState(false);

  return (
    <View style={styles.container}>
      {/* <AnimatedBackground preset={backgroundPreset}> */}
        <View style={styles.editorContainer}>
          <EditorHeader
            title={headerTitle}
            onBackPress={onHeaderBackPress}
            onSharePress={onHeaderSharePress}
          />
          <EditorContent
            content={content}
            onChangeText={onChangeText}
            onEditorModeChange={setIsInEditorMode}
          />
          <EditorToolbar
            isBoldActive={isBoldActive}
            isItalicActive={isItalicActive}
            isListActive={isListActive}
            onToggleBold={onToggleBold}
            onToggleItalic={onToggleItalic}
            onToggleList={onToggleList}
            isVisible={isInEditorMode}
          />
        </View>
      {/* </AnimatedBackground> */}
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

