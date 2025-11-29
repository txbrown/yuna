/**
 * @feature Editor
 * @description Rich text editor wrapper around EnrichedTextInput that handles HTML ↔ Markdown conversion
 */

import { Palette } from '@/constants/Colors';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { ViewStyle } from 'react-native';
import {
  EnrichedTextInput,
  type EnrichedTextInputInstance,
} from 'react-native-enriched';
import { htmlToMarkdown, markdownToHtml } from '../utils/htmlMarkdownConverter';

export interface RichTextEditorProps {
  content: string; // Markdown content
  onChangeText: (markdown: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeState?: (state: any) => void;
  onChangeSelection?: (start: number, end: number, text?: string) => void;
  style?: ViewStyle;
  placeholder?: string;
  cursorColor?: string;
  selectionColor?: string;
}

export interface RichTextEditorRef {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrikeThrough: () => void;
  toggleUnorderedList: () => void;
  focus: () => void;
}

export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(
  (
    {
      content,
      onChangeText,
      onFocus,
      onBlur,
      onChangeState,
      onChangeSelection,
      style,
      placeholder = '',
      cursorColor = '#000', // Black cursor
      selectionColor = Palette.accentPeach, // Peach selection highlight for visibility
    },
    ref
  ) => {
    const inputRef = useRef<EnrichedTextInputInstance>(null);
    const lastContentRef = useRef(content);

    // Sync content prop changes to EnrichedTextInput using setValue
    useEffect(() => {
      if (content !== lastContentRef.current && inputRef.current) {
        const html = markdownToHtml(content);
        // Use setValue to update the editor content
        inputRef.current.setValue(html);
        lastContentRef.current = content;
      }
    }, [content]);

    const handleHtmlChange = (event: any) => {
      const html = event.nativeEvent.html || '';
      // Convert HTML to markdown for storage
      const markdown = htmlToMarkdown(html);
      lastContentRef.current = markdown;
      onChangeText(markdown);
    };

    const handleTextChange = (event: any) => {
      // Text change is handled via HTML change
      // This is just for compatibility
    };

    const handleStateChange = (event: any) => {
      const state = event.nativeEvent;
      if (onChangeState) {
        onChangeState(state);
      }
    };

    const handleSelectionChange = (event: any) => {
      const { start, end, text } = event.nativeEvent;
      if (onChangeSelection) {
        // Extract text from event if available, otherwise extract from content
        const selectedText = text || content.substring(start, end);
        onChangeSelection(start, end, selectedText);
      }
    };

    // Expose methods via ref for toolbar actions
    useImperativeHandle(
      ref,
      () => ({
        toggleBold: () => {
          if (inputRef.current) {
            inputRef.current.focus();
            requestAnimationFrame(() => {
              inputRef.current?.toggleBold();
            });
          }
        },
        toggleItalic: () => {
          if (inputRef.current) {
            inputRef.current.focus();
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                inputRef.current?.toggleItalic();
              });
            });
          }
        },
        toggleUnderline: () => {
          if (inputRef.current) {
            inputRef.current.focus();
            requestAnimationFrame(() => {
              inputRef.current?.toggleUnderline();
            });
          }
        },
        toggleStrikeThrough: () => {
          if (inputRef.current) {
            inputRef.current.focus();
            requestAnimationFrame(() => {
              inputRef.current?.toggleStrikeThrough();
            });
          }
        },
        toggleUnorderedList: () => {
          if (inputRef.current) {
            inputRef.current.focus();
            requestAnimationFrame(() => {
              inputRef.current?.toggleUnorderedList();
            });
          }
        },
        focus: () => inputRef.current?.focus(),
      }),
      []
    );

    return (
      <EnrichedTextInput
        ref={inputRef}
        onChangeHtml={handleHtmlChange}
        onChangeText={handleTextChange}
        onChangeState={handleStateChange}
        onChangeSelection={handleSelectionChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
        placeholder={placeholder}
        cursorColor={cursorColor}
        selectionColor={selectionColor}
      />
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
