import { useState, useCallback, useEffect, useRef } from 'react';
import { Persona } from '../models/persona';
import { cactusService, CompletionMessage } from '../services/cactus-service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Hook for chatting with a persona
 */
export const usePersonaChat = (persona: Persona | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousPersonaIdRef = useRef<string | null>(null);

  // Clear chat when persona changes (different persona or persona was updated)
  useEffect(() => {
    if (persona) {
      const currentPersonaId = persona.id;
      if (
        previousPersonaIdRef.current !== null &&
        previousPersonaIdRef.current !== currentPersonaId
      ) {
        // Different persona selected - clear chat
        setMessages([]);
        setError(null);
      }
      previousPersonaIdRef.current = currentPersonaId;
    } else {
      previousPersonaIdRef.current = null;
    }
  }, [persona]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!persona) {
        setError('No persona selected');
        return;
      }

      if (!cactusService.isInitialized()) {
        setError('Cactus model not initialized. Please download a model first.');
        return;
      }

      if (!userMessage.trim()) {
        return;
      }

      // Add user message
      const userMsg: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsGenerating(true);
      setError(null);

      try {
        // Build conversation history with system prompt
        const conversationMessages: CompletionMessage[] = [
          {
            role: 'system',
            content: persona.systemPrompt,
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: userMessage,
          },
        ];

        const result = await cactusService.complete({
          messages: conversationMessages,
          temperature: persona.temperature,
          maxTokens: persona.maxTokens,
        });

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: result.response,
          timestamp: Date.now(),
          usage: result.usage,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate response';
        setError(errorMessage);
        console.error('Chat error:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [persona, messages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isGenerating,
    error,
    sendMessage,
    clearChat,
  };
};

