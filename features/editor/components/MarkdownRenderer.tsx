/**
 * @feature Editor
 * @description Utility functions for rendering markdown as formatted Text components
 */

import React from 'react';
import { Text, TextProps } from 'react-native';

export interface TextSegment {
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  isList?: boolean;
}

/**
 * Parses markdown text into segments for rendering
 */
export function parseMarkdownToSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let i = 0;

  while (i < text.length) {
    // Check for bold (**text**)
    if (text.substring(i, i + 2) === '**') {
      const endIndex = text.indexOf('**', i + 2);
      if (endIndex !== -1) {
        const content = text.substring(i + 2, endIndex);
        segments.push({ text: content, isBold: true });
        i = endIndex + 2;
        continue;
      }
    }

    // Check for italic (*text* but not **text**)
    if (text[i] === '*' && text.substring(i, i + 2) !== '**') {
      const endIndex = text.indexOf('*', i + 1);
      if (endIndex !== -1) {
        const content = text.substring(i + 1, endIndex);
        segments.push({ text: content, isItalic: true });
        i = endIndex + 1;
        continue;
      }
    }

    // Check for list item (- text)
    if (text[i] === '-' && (i === 0 || text[i - 1] === '\n')) {
      const nextNewline = text.indexOf('\n', i + 1);
      const endIndex = nextNewline === -1 ? text.length : nextNewline;
      const content = text.substring(i + 1, endIndex).trim();
      if (content) {
        segments.push({ text: `• ${content}`, isList: true });
        i = endIndex;
        continue;
      }
    }

    // Regular text - find the next markdown marker
    let nextMarker = text.length;
    const boldMarker = text.indexOf('**', i);
    const italicMarker = text.indexOf('*', i);
    const listMarker = text.indexOf('\n-', i);

    if (boldMarker !== -1 && boldMarker < nextMarker) nextMarker = boldMarker;
    if (italicMarker !== -1 && italicMarker < nextMarker && text.substring(italicMarker, italicMarker + 2) !== '**') {
      nextMarker = italicMarker;
    }
    if (listMarker !== -1 && listMarker < nextMarker) nextMarker = listMarker;

    const content = text.substring(i, nextMarker);
    if (content) {
      segments.push({ text: content });
    }
    i = nextMarker;
  }

  return segments;
}

/**
 * Renders markdown segments as nested Text components
 */
export function renderMarkdownText(
  segments: TextSegment[],
  baseStyle?: TextProps['style']
): React.ReactElement {
  return (
    <>
      {segments.map((segment, index) => {
        const style: TextProps['style'] = [baseStyle];
        
        if (segment.isBold) {
          style.push({ fontWeight: 'bold' });
        }
        if (segment.isItalic) {
          style.push({ fontStyle: 'italic' });
        }

        return (
          <Text key={index} style={style}>
            {segment.text}
          </Text>
        );
      })}
    </>
  );
}

