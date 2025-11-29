import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { EditorContentProps } from '../types';
import { RichTextEditor, type RichTextEditorRef } from './RichTextEditor';

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
  const insets = useSafeAreaInsets();
  const [hasFocused, setHasFocused] = React.useState(false);
  const showWelcome = isEmpty(content) && !hasFocused;
  const isInEditorMode = hasFocused || !isEmpty(content);
  
  // Calculate header height: safe area top + header padding top (8) + content min height (44) + header padding bottom (12)
  const headerHeight = insets.top + 8 + 44 + 12;

  React.useEffect(() => {
    if (onEditorModeChange) {
      // Pass hasFocused to indicate if user is actively editing (WebView is focused)
      onEditorModeChange(hasFocused);
    }
  }, [hasFocused, onEditorModeChange]);
  const welcomeOpacity = useSharedValue(showWelcome ? 1 : 0);
  const editorOpacity = useSharedValue(showWelcome ? 0 : 1);

  React.useEffect(() => {
    if (showWelcome) {
      welcomeOpacity.value = withTiming(1, { duration: 300 });
      editorOpacity.value = withTiming(0, { duration: 300 });
    } else {
      welcomeOpacity.value = withTiming(0, { duration: 300 });
      editorOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [showWelcome, welcomeOpacity, editorOpacity]);

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

  const handleSelectionChange = (start: number, end: number) => {
    if (onSelectionChange) {
      onSelectionChange(start, end);
    }
  };

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

  const welcomeStyle = useAnimatedStyle(() => {
    return {
      opacity: welcomeOpacity.value,
      transform: [
        {
          translateY: interpolate(welcomeOpacity.value, [0, 1], [20, 0]),
        },
      ],
    };
  });

  const editorStyle = useAnimatedStyle(() => {
    return {
      opacity: editorOpacity.value,
    };
  });

  return (
    <Pressable
      testID="editor-content-container"
      style={styles.container}
      onPress={showWelcome ? handleWelcomePress : undefined}
    >
      {showWelcome && (
        <Animated.View
          testID="welcome-screen"
          style={[styles.welcomeContainer, welcomeStyle]}
        >
          <Text style={styles.welcomeTitle}>ITS A GOOD DAY TO YUNA</Text>
          <Text style={styles.welcomeSubtitle}>tap to get started</Text>
        </Animated.View>
      )}

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
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  welcomeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: '700',
    fontFamily: 'Orbitron_700Bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Orbitron_400Regular',
    color: '#666',
    textAlign: 'center',
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
    fontFamily: 'Orbitron_400Regular',
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
    fontFamily: 'Orbitron_400Regular',
    color: '#000',
    lineHeight: 24,
  },
  strong: {
    fontWeight: 'bold' as const,
    fontFamily: 'Orbitron_700Bold',
  },
  em: {
    fontStyle: 'italic' as const,
  },
  list_item: {
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
};

