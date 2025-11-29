/**
 * @feature Editor
 * @description Hook for managing text selection state and toolbar visibility
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

/**
 * Hook for managing persona selection state
 * Handles selection tracking and text extraction
 * Toolbar stays visible until selection is cleared (no auto-dismiss)
 */
export const usePersonaSelection = (content: string) => {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  /**
   * Set selection from start/end indices
   */
  const setSelectionFromIndices = useCallback(
    (start: number, end: number, text?: string) => {
      // If collapsed selection, clear
      if (start === end) {
        setSelection(null);
        return;
      }

      // Extract text from content if not provided
      const selectedText = text || content.substring(start, end);

      // Set new selection
      setSelection({
        start,
        end,
        text: selectedText,
      });
    },
    [content]
  );

  /**
   * Clear selection manually
   */
  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  return {
    selection,
    setSelectionFromIndices,
    clearSelection,
  };
};

