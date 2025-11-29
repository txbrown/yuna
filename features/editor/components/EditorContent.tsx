import { cactusService, usePersonas } from '@/features/personas';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { EditorContentProps } from '../types';
import {
  PersonaResponse,
  PersonaResponseBottomSheet,
} from './PersonaResponseBottomSheet';
import { PersonaSelectionToolbar } from './PersonaSelectionToolbar';
import { RichTextEditor, type RichTextEditorRef } from './RichTextEditor';
import { WelcomeScreen } from './WelcomeScreen';

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

  // Store latest content in ref to avoid stale closure issues
  const contentRef = useRef(content);

  // Debug content changes
  React.useEffect(() => {
    console.log('EditorContent - content updated:', content);
    contentRef.current = content; // Keep ref in sync
  }, [content]);

  // Persona management
  const { personas } = usePersonas();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [personaResponses, setPersonaResponses] = useState<PersonaResponse[]>(
    []
  );

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

  const handleTextChange = (text: string) => {
    console.log('EditorContent - handleTextChange called with:', text);
    if (onChangeText) {
      onChangeText(text);
    }
  };

  const handleSelectionChange = (start: number, end: number, text?: string) => {
    // Call parent callback
    if (onSelectionChange) {
      onSelectionChange(start, end, text);
    }
  };

  // Handle persona press - fetch responses from ALL personas and show bottom sheet
  const handlePersonaPress = useCallback(async () => {
    // Get the LATEST content from ref (avoids stale closure)
    const currentContent = contentRef.current;

    console.log('Opening persona analysis...');
    console.log('Current content from ref:', currentContent);
    console.log('Current content length:', currentContent.length);

    // Initialize loading state for all personas
    const initialResponses: PersonaResponse[] = personas.map((p) => ({
      personaId: p.id,
      response: '',
      isLoading: true,
    }));

    setPersonaResponses(initialResponses);
    setShowBottomSheet(true);

    // Check if there's content to analyze
    if (isEmpty(currentContent)) {
      console.log('Content is empty, showing placeholder message');
      setPersonaResponses(
        personas.map((p) => ({
          personaId: p.id,
          response: 'Start typing in the editor to get my analysis!',
          isLoading: false,
        }))
      );
      return;
    }

    // Ensure Cactus is initialized
    try {
      console.log('Checking Cactus initialization...');

      // Initialize if needed (will reuse existing instance if already initialized)
      if (!cactusService.isInitialized()) {
        console.log('Initializing Cactus service...');
        await cactusService.initialize('qwen3-0.6');
        console.log('Cactus service initialized successfully');
      } else {
        console.log('Cactus service already initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Cactus:', error);
      setPersonaResponses(
        personas.map((p) => ({
          personaId: p.id,
          response: `Failed to initialize AI service: ${
            (error as Error).message
          }. The model might not be downloaded.`,
          isLoading: false,
        }))
      );
      return;
    }

    // Fetch responses for ALL personas using their system prompts
    // Process SEQUENTIALLY to avoid concurrency issues with the AI model
    console.log(`Getting analysis from ${personas.length} personas...`);

    (async () => {
      for (const p of personas) {
        try {
          console.log(`Requesting analysis from ${p.name}`);

          // Reset and reinitialize to ensure completely clean context for each persona
          cactusService.reset();
          await cactusService.initialize('qwen3-0.6');
          console.log(`Fresh context initialized for ${p.name}`);

          // Limit content length to avoid overwhelming the model (max ~500 chars)
          const truncatedContent =
            currentContent.length > 500
              ? currentContent.substring(0, 500) + '...'
              : currentContent;

          const userMessage = `${truncatedContent}\n\nWhat do you think?`;

          const result = await cactusService.complete({
            messages: [
              {
                role: 'system',
                content: p.systemPrompt,
              },
              {
                role: 'user',
                content: userMessage,
              },
            ],
            temperature: p.temperature,
            maxTokens: 150, // Keep responses concise and focused
          });

          // Clean up the response - remove all meta-commentary and system artifacts
          let cleanResponse = result.response;

          // Remove <think>...</think> blocks (including multiline)
          cleanResponse = cleanResponse.replace(
            /<think>[\s\S]*?<\/think>/gi,
            ''
          );

          // Remove standalone <think> or </think> tags
          cleanResponse = cleanResponse.replace(/<\/?think>/gi, '');

          // Remove special tokens like <|im_start|>, <|im_end|>, etc.
          cleanResponse = cleanResponse.replace(/<\|[^|]+\|>/g, '');

          // Remove special characters and arrows
          cleanResponse = cleanResponse.replace(/[↑→]/g, '');

          // Remove common meta-phrases that show up in responses
          cleanResponse = cleanResponse.replace(
            /^(Here's my analysis:|Let me analyze:|My thoughts:|My response:)\s*/i,
            ''
          );

          // Remove "As a [persona]" prefixes
          cleanResponse = cleanResponse.replace(/^As (a|an) .+?,\s*/i, '');

          // Clean up extra whitespace and newlines
          cleanResponse = cleanResponse.replace(/\n{3,}/g, '\n\n').trim();

          // If response is too short or empty, provide fallback
          if (cleanResponse.length < 10) {
            cleanResponse = 'Interesting! Tell me more about this.';
          }

          console.log(
            `✓ Received response from ${p.name}:`,
            cleanResponse.substring(0, 100)
          );

          setPersonaResponses((prev) =>
            prev.map((r) =>
              r.personaId === p.id
                ? { ...r, response: cleanResponse, isLoading: false }
                : r
            )
          );
        } catch (error) {
          console.error(`✗ Failed to get response from ${p.name}:`, error);
          setPersonaResponses((prev) =>
            prev.map((r) =>
              r.personaId === p.id
                ? {
                    ...r,
                    response: `Failed to generate response: ${
                      (error as Error).message
                    }`,
                    isLoading: false,
                  }
                : r
            )
          );
        }
      }
    })();
  }, [personas]); // Remove content from dependencies since we use contentRef

  const handleDismissBottomSheet = useCallback(() => {
    setShowBottomSheet(false);
  }, []);

  // Expose methods via ref for toolbar actions
  React.useImperativeHandle(
    externalInputRef,
    () => ({
      toggleBold: () => internalInputRef.current?.toggleBold(),
      toggleItalic: () => internalInputRef.current?.toggleItalic(),
      toggleUnderline: () => internalInputRef.current?.toggleUnderline(),
      toggleStrikeThrough: () =>
        internalInputRef.current?.toggleStrikeThrough(),
      toggleUnorderedList: () =>
        internalInputRef.current?.toggleUnorderedList(),
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
      testID='editor-content-container'
      ref={editorContainerRef}
      style={styles.container}
    >
      <WelcomeScreen
        visible={showWelcome}
        editorStartPosition={editorStartPosition}
        onPress={handleWelcomePress}
      />

      <Animated.View style={[styles.editorWrapper, editorStyle]}>
        {/* Show plain text when not focused */}
        {!hasFocused && content ? (
          <Pressable
            style={[styles.formattedView, { paddingTop: headerHeight + 20 }]}
            onPress={() => {
              setHasFocused(true);
              internalInputRef.current?.focus();
            }}
          >
            <Markdown style={markdownStyles}>{content}</Markdown>
          </Pressable>
        ) : (
          /* Use EnrichedTextInput when editing - shows formatted text while editing */
          <View
            style={[styles.inputContainer, { paddingTop: headerHeight + 20 }]}
          >
            <RichTextEditor
              ref={internalInputRef}
              content={content}
              onChangeText={handleTextChange}
              onChangeState={onChangeState}
              onChangeSelection={handleSelectionChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={styles.input}
              placeholder=''
            />
          </View>
        )}
      </Animated.View>

      {/* Persona Selection Toolbar - Always visible, floating in nav bar area */}
      <PersonaSelectionToolbar
        headerHeight={headerHeight}
        personas={personas}
        onPersonaPress={handlePersonaPress}
      />

      {/* Persona Response Bottom Sheet */}
      <PersonaResponseBottomSheet
        visible={showBottomSheet}
        personas={personas}
        responses={personaResponses}
        onDismiss={handleDismissBottomSheet}
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
