import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChatMessage, usePersonaChat } from '../hooks/usePersonaChat';
import { Persona } from '../models/persona';
import { PersonaAvatar } from './PersonaAvatar';

export interface PersonaChatProps {
  persona: Persona | null;
  onClear?: () => void;
}

/**
 * Chat component for interacting with a persona
 */
export const PersonaChat: React.FC<PersonaChatProps> = ({
  persona,
  onClear,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isGenerating, error, sendMessage, clearChat } =
    usePersonaChat(persona);

  const handleSend = async () => {
    if (!inputMessage.trim() || isGenerating) {
      return;
    }

    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleClear = () => {
    clearChat();
    onClear?.();
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View style={styles.messageHeader}>
          <View style={styles.messageRoleContainer}>
            {!isUser && persona && (
              <PersonaAvatar persona={persona} size='small' />
            )}
            <Text style={styles.messageRole}>
              {isUser ? '👤 You' : persona?.name || 'AI'}
            </Text>
          </View>
          {message.usage && (
            <Text style={styles.messageUsage}>
              {message.usage.totalTokens} tokens
            </Text>
          )}
        </View>
        <Text style={styles.messageContent}>{message.content}</Text>
      </View>
    );
  };

  if (!persona) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Select a persona to start chatting</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        ref={(ref) => {
          if (ref && messages.length > 0) {
            setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
          }
        }}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyChatContainer}>
            <PersonaAvatar persona={persona} size='large' />
            <Text style={styles.emptyChatText}>
              Start a conversation with {persona.name}
            </Text>
            <Text style={styles.emptyChatSubtext}>{persona.description}</Text>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Message ${persona.name}...`}
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
          numberOfLines={3}
          editable={!isGenerating}
          onSubmitEditing={handleSend}
        />
        <View style={styles.inputActions}>
          {messages.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              disabled={isGenerating}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.sendButton,
              isGenerating && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputMessage.trim() || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color='#fff' size='small' />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  messageUsage: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  messageContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptyChatContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  sendButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});
