/**
 * @feature Editor
 * @description Utility functions for parsing markdown to React Native Text components
 */

import React from 'react';
import { Text, TextProps } from 'react-native';

export interface ParsedMarkdownNode {
  type: 'text' | 'bold' | 'italic' | 'list';
  content: string;
  children?: ParsedMarkdownNode[];
}

/**
 * Parses markdown text into a structure that can be rendered
 */
export function parseMarkdown(text: string): ParsedMarkdownNode[] {
  const nodes: ParsedMarkdownNode[] = [];
  let i = 0;

  while (i < text.length) {
    // Check for bold (**text**)
    if (text.substring(i, i + 2) === '**') {
      const endIndex = text.indexOf('**', i + 2);
      if (endIndex !== -1) {
        const content = text.substring(i + 2, endIndex);
        nodes.push({ type: 'bold', content });
        i = endIndex + 2;
        continue;
      }
    }

    // Check for italic (*text* but not **text**)
    if (text[i] === '*' && text.substring(i, i + 2) !== '**') {
      const endIndex = text.indexOf('*', i + 1);
      if (endIndex !== -1) {
        const content = text.substring(i + 1, endIndex);
        nodes.push({ type: 'italic', content });
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
        nodes.push({ type: 'list', content });
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
      nodes.push({ type: 'text', content });
    }
    i = nextMarker;
  }

  return nodes;
}

/**
 * Renders parsed markdown nodes as React Native Text components
 */
export function renderMarkdownNodes(
  nodes: ParsedMarkdownNode[],
  baseStyle?: TextProps['style']
): React.ReactElement {
  return (
    <Text style={baseStyle}>
      {nodes.map((node, index) => {
        switch (node.type) {
          case 'bold':
            return (
              <Text key={index} style={[{ fontWeight: 'bold' }, baseStyle]}>
                {node.content}
              </Text>
            );
          case 'italic':
            return (
              <Text key={index} style={[{ fontStyle: 'italic' }, baseStyle]}>
                {node.content}
              </Text>
            );
          case 'list':
            return (
              <Text key={index} style={baseStyle}>
                {'\n• '}
                {node.content}
              </Text>
            );
          default:
            return <Text key={index}>{node.content}</Text>;
        }
      })}
    </Text>
  );
}

