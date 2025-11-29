import { usePersonas } from '@/features/personas';
import type { Persona } from '@/features/personas/models/persona';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { EditorContentProps } from '../types';
import { PersonaSelectionToolbar } from './PersonaSelectionToolbar';
import { RichTextEditor, type RichTextEditorRef } from './RichTextEditor';
import { WelcomeScreen } from './WelcomeScreen';
import { usePersonaSelection } from './usePersonaSelection';

const isEmpty = (text: string) => text.trim().length === 0;

/**
 * @description Full-screen rich text content editor component with welcome screen
 * @example
 * <EditorContent
 *   content={content}
 *   onChangeText={handleChange}
 *   onFocus={handleFocus}
 *   placeholder="Start typing..."
 * />
 */
export const EditorContent: React.FC<EditorContentProps> = ({
  content,
  onChangeText,
  onFocus,
  onBlur,
  placeholder = 'Tap here to continue',
  onEditorModeChange,
  onSelectionChange,
  inputRef: externalInputRef,
  onChangeState,
}) => {
  const internalInputRef = useRef<RichTextEditorRef>(null);
  const editorContainerRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const [hasFocused, setHasFocused] = React.useState(false);
  const showWelcome = isEmpty(content) && !hasFocused;

  // Persona management
  const { personas } = usePersonas();
  const { selection, setSelectionFromIndices, clearSelection } =
    usePersonaSelection(content);
  
  // Calculate header height: safe area top + header padding top (8) + content min height (44) + header padding bottom (12)
  const headerHeight = insets.top + 8 + 44 + 12;
  
  // Editor start position (where text begins)
  const editorStartPosition = {
    x: 20, // padding
    y: headerHeight + 20, // header height + padding
  };

  React.useEffect(() => {
    if (onEditorModeChange) {
      // Pass hasFocused to indicate if user is actively editing (WebView is focused)
      onEditorModeChange(hasFocused);
    }
  }, [hasFocused, onEditorModeChange]);

  const editorOpacity = useSharedValue(showWelcome ? 0 : 1);

  React.useEffect(() => {
    if (showWelcome) {
      editorOpacity.value = withTiming(0, { duration: 300 });
    } else {
      editorOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [showWelcome, editorOpacity]);

  const handleWelcomePress = () => {
    setHasFocused(true);
    internalInputRef.current?.focus();
    if (onFocus) {
      onFocus();
    }
  };

  const handleFocus = () => {
    setHasFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    // Only reset hasFocused if content is empty
    if (isEmpty(content)) {
      setHasFocused(false);
    }
    if (onBlur) {
      onBlur();
    }
  };

  const handleSelectionChange = (
    start: number,
    end: number,
    text?: string
  ) => {
    // Update selection state
    setSelectionFromIndices(start, end, text);

    // Also call parent callback
    if (onSelectionChange) {
      onSelectionChange(start, end, text);
    }
  };


  // Handle persona selection
  const handlePersonaSelect = React.useCallback(
    (persona: Persona, selection: { start: number; end: number; text: string }) => {
      // TODO: Implement persona annotation handling (e.g., trigger AI response)
      console.log(`Persona ${persona.name} selected for text: "${selection.text}"`);
      
      // Clear selection
      clearSelection();
    },
    [clearSelection]
  );


  // Expose methods via ref for toolbar actions
  React.useImperativeHandle(
    externalInputRef,
    () => ({
      toggleBold: () => internalInputRef.current?.toggleBold(),
      toggleItalic: () => internalInputRef.current?.toggleItalic(),
      toggleUnderline: () => internalInputRef.current?.toggleUnderline(),
      toggleStrikeThrough: () => internalInputRef.current?.toggleStrikeThrough(),
      toggleUnorderedList: () => internalInputRef.current?.toggleUnorderedList(),
      focus: () => internalInputRef.current?.focus(),
    }),
    []
  );

  const editorStyle = useAnimatedStyle(() => {
    return {
      opacity: editorOpacity.value,
    };
  });

  return (
    <View
      testID="editor-content-container"
      ref={editorContainerRef}
      style={styles.container}
    >
      <WelcomeScreen
        visible={showWelcome}
        editorStartPosition={editorStartPosition}
        onPress={handleWelcomePress}
      />

      <Animated.View style={[styles.editorWrapper, editorStyle]}>
        {/* Show formatted markdown when not focused */}
        {!hasFocused && content ? (
          <Pressable
            style={[
              styles.formattedView,
              { paddingTop: headerHeight + 20 },
            ]}
            onPress={() => {
              setHasFocused(true);
              internalInputRef.current?.focus();
            }}
          >
            <Markdown style={markdownStyles}>{content}</Markdown>
          </Pressable>
        ) : (
          /* Use EnrichedTextInput when editing - shows formatted text while editing */
          <View style={[styles.inputContainer, { paddingTop: headerHeight + 20 }]}>
            <RichTextEditor
              ref={internalInputRef}
              content={content}
              onChangeText={onChangeText}
              onChangeState={onChangeState}
              onChangeSelection={handleSelectionChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={styles.input}
              placeholder=""
            />
          </View>
        )}
      </Animated.View>

      {/* Persona Selection Toolbar - In nav bar area on the right */}
      <PersonaSelectionToolbar
        visible={!!selection && selection.start !== selection.end}
        selection={selection}
        headerHeight={headerHeight}
        personas={personas}
        onPersonaSelect={handlePersonaSelect}
        onDismiss={clearSelection}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  editorWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  input: {
    flex: 1,
    width: '100%',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    color: '#000',
  },
  formattedView: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
});

// Markdown styles to match input styling
const markdownStyles = {
  body: {
    fontSize: 16,
    fontFamily: 'SpaceMono',
    color: '#000',
    lineHeight: 24,
  },
  strong: {
    fontWeight: 'bold' as const,
    fontFamily: 'SpaceMono-Bold',
  },
  em: {
    fontStyle: 'italic' as const,
    fontFamily: 'SpaceMono-Italic',
  },
  list_item: {
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
};

