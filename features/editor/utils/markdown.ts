/**
 * @feature Editor
 * @description Utility functions for markdown text manipulation
 */

export interface CursorPosition {
  start: number;
  end: number;
}

/**
 * Inserts markdown syntax for bold text at the cursor position
 */
export function insertBoldMarkdown(
  text: string,
  cursorStart: number,
  cursorEnd: number
): { newText: string; newCursorStart: number; newCursorEnd: number } {
  const selectedText = text.substring(cursorStart, cursorEnd);
  
  // If text is selected, wrap it in bold markers
  if (selectedText.length > 0) {
    const newText = 
      text.substring(0, cursorStart) +
      `**${selectedText}**` +
      text.substring(cursorEnd);
    return {
      newText,
      newCursorStart: cursorStart + selectedText.length + 4,
      newCursorEnd: cursorStart + selectedText.length + 4,
    };
  }
  
  // If no text selected, insert bold markers and place cursor between them
  const newText = 
    text.substring(0, cursorStart) +
    `****` +
    text.substring(cursorEnd);
  return {
    newText,
    newCursorStart: cursorStart + 2,
    newCursorEnd: cursorStart + 2,
  };
}

/**
 * Inserts markdown syntax for italic text at the cursor position
 */
export function insertItalicMarkdown(
  text: string,
  cursorStart: number,
  cursorEnd: number
): { newText: string; newCursorStart: number; newCursorEnd: number } {
  const selectedText = text.substring(cursorStart, cursorEnd);
  
  // If text is selected, wrap it in italic markers
  if (selectedText.length > 0) {
    const newText = 
      text.substring(0, cursorStart) +
      `*${selectedText}*` +
      text.substring(cursorEnd);
    return {
      newText,
      newCursorStart: cursorStart + selectedText.length + 2,
      newCursorEnd: cursorStart + selectedText.length + 2,
    };
  }
  
  // If no text selected, insert italic markers and place cursor between them
  const newText = 
    text.substring(0, cursorStart) +
    `**` +
    text.substring(cursorEnd);
  return {
    newText,
    newCursorStart: cursorStart + 1,
    newCursorEnd: cursorStart + 1,
  };
}

/**
 * Inserts markdown syntax for list item at the cursor position
 */
export function insertListMarkdown(
  text: string,
  cursorStart: number,
  cursorEnd: number
): { newText: string; newCursorStart: number; newCursorEnd: number } {
  const selectedText = text.substring(cursorStart, cursorEnd);
  
  // Check if we're at the start of a line or if there's a newline before cursor
  const textBeforeCursor = text.substring(0, cursorStart);
  const isStartOfLine = cursorStart === 0 || textBeforeCursor.endsWith('\n');
  
  // If text is selected, convert it to a list item
  if (selectedText.length > 0) {
    const lines = selectedText.split('\n');
    const listItems = lines.map(line => line.trim() ? `- ${line.trim()}` : '').join('\n');
    const newText = 
      text.substring(0, cursorStart) +
      listItems +
      text.substring(cursorEnd);
    return {
      newText,
      newCursorStart: cursorStart + listItems.length,
      newCursorEnd: cursorStart + listItems.length,
    };
  }
  
  // If no text selected, insert list marker
  const prefix = isStartOfLine ? '' : '\n';
  const newText = 
    text.substring(0, cursorStart) +
    `${prefix}- ` +
    text.substring(cursorEnd);
  return {
    newText,
    newCursorStart: cursorStart + prefix.length + 2,
    newCursorEnd: cursorStart + prefix.length + 2,
  };
}

/**
 * Checks if text at cursor position is wrapped in bold markdown
 */
export function isBoldAtCursor(
  text: string,
  cursorStart: number,
  cursorEnd: number
): boolean {
  // Check if cursor is within **text** markers
  const beforeCursor = text.substring(0, cursorStart);
  const afterCursor = text.substring(cursorEnd);
  
  // Look for ** before cursor and ** after cursor
  const lastBoldStart = beforeCursor.lastIndexOf('**');
  if (lastBoldStart === -1) return false;
  
  const nextBoldEnd = afterCursor.indexOf('**');
  if (nextBoldEnd === -1) return false;
  
  // Check if there's no ** between the start and end markers
  const textBetween = text.substring(lastBoldStart + 2, cursorStart + nextBoldEnd);
  return !textBetween.includes('**');
}

/**
 * Checks if text at cursor position is wrapped in italic markdown
 */
export function isItalicAtCursor(
  text: string,
  cursorStart: number,
  cursorEnd: number
): boolean {
  // Check if cursor is within *text* markers (but not **text**)
  const beforeCursor = text.substring(0, cursorStart);
  const afterCursor = text.substring(cursorEnd);
  
  // Look for * before cursor and * after cursor, but not **
  const lastItalicStart = beforeCursor.lastIndexOf('*');
  if (lastItalicStart === -1) return false;
  
  // Check if it's not part of **
  if (lastItalicStart > 0 && beforeCursor[lastItalicStart - 1] === '*') {
    return false;
  }
  
  const nextItalicEnd = afterCursor.indexOf('*');
  if (nextItalicEnd === -1) return false;
  
  // Check if it's not part of **
  if (nextItalicEnd < afterCursor.length - 1 && afterCursor[nextItalicEnd + 1] === '*') {
    return false;
  }
  
  // Check if there's no * between the start and end markers
  const textBetween = text.substring(lastItalicStart + 1, cursorStart + nextItalicEnd);
  return !textBetween.includes('*');
}

/**
 * Checks if cursor is at a list item line
 */
export function isListAtCursor(
  text: string,
  cursorStart: number
): boolean {
  const textBeforeCursor = text.substring(0, cursorStart);
  const lastNewline = textBeforeCursor.lastIndexOf('\n');
  const lineStart = lastNewline + 1;
  const line = text.substring(lineStart, cursorStart);
  return line.trim().startsWith('- ');
}

