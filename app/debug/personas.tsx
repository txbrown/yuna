import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { cactusService, CactusModel } from '@/features/personas/services/cactus-service';

export default function PersonasDebugScreen() {
  const [selectedModel, setSelectedModel] = useState<CactusModel>('qwen3-0.6');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);

  const availableModels: CactusModel[] = ['qwen3-0.6', 'lfm2-350m', 'qwen3-1.5'];

  const handleDownloadModel = async () => {
    try {
      setIsDownloading(true);
      Alert.alert('Download Started', `Downloading ${selectedModel}... This may take a few minutes.`);

      await cactusService.downloadModel(selectedModel);
      setIsInitialized(true);

      Alert.alert('Success', `Model ${selectedModel} downloaded and ready!`);
    } catch (error) {
      Alert.alert('Error', `Failed to download model: ${(error as Error).message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!isInitialized) {
      Alert.alert('Error', 'Please download a model first');
      return;
    }

    const newMessage = { role: 'user', content: userMessage };
    const updatedConversation = [...conversation, newMessage];
    setConversation(updatedConversation);
    setUserMessage('');

    try {
      setIsGenerating(true);

      const result = await cactusService.complete({
        messages: updatedConversation.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
      });

      setConversation([
        ...updatedConversation,
        { role: 'assistant', content: result.response },
      ]);
    } catch (error) {
      Alert.alert('Error', `Failed to generate response: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearConversation = () => {
    setConversation([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>Personas Debug Screen</Text>
        <Text style={styles.subheader}>Test Cactus AI Integration</Text>
      </View>

      {/* Model Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select Model</Text>
        <View style={styles.modelGrid}>
          {availableModels.map((model) => (
            <TouchableOpacity
              key={model}
              style={[
                styles.modelButton,
                selectedModel === model && styles.modelButtonSelected,
              ]}
              onPress={() => setSelectedModel(model)}
              disabled={isDownloading || isGenerating}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  selectedModel === model && styles.modelButtonTextSelected,
                ]}
              >
                {model}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.downloadButton]}
          onPress={handleDownloadModel}
          disabled={isDownloading || isGenerating}
        >
          <Text style={styles.buttonText}>
            {isDownloading ? 'Downloading...' : isInitialized ? 'Re-download Model' : 'Download Model'}
          </Text>
        </TouchableOpacity>

        {isInitialized && (
          <Text style={styles.successText}>
            ✓ Model {selectedModel} ready
          </Text>
        )}
      </View>

      {/* Chat Interface */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Chat with AI</Text>

        {!isInitialized && (
          <Text style={styles.warningText}>
            Please download a model first to start chatting
          </Text>
        )}

        {/* Conversation History */}
        {conversation.length > 0 && (
          <View style={styles.conversationContainer}>
            {conversation.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageCard,
                  msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <Text style={styles.messageRole}>
                  {msg.role === 'user' ? '👤 You' : '🤖 AI'}
                </Text>
                <Text style={styles.messageContent}>{msg.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={userMessage}
          onChangeText={setUserMessage}
          multiline
          numberOfLines={3}
          editable={!isGenerating}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.sendButton, { flex: 2 }]}
            onPress={handleSendMessage}
            disabled={!isInitialized || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Message</Text>
            )}
          </TouchableOpacity>

          {conversation.length > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.clearButton, { flex: 1 }]}
              onPress={handleClearConversation}
              disabled={isGenerating}
            >
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.infoTitle}>Tips:</Text>
        <Text style={styles.infoText}>• First time: Download the model (may take a few minutes)</Text>
        <Text style={styles.infoText}>• qwen3-0.6 is the smallest/fastest model</Text>
        <Text style={styles.infoText}>• Chat history is maintained for context</Text>
        <Text style={styles.infoText}>• AI runs completely on-device (offline)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  modelButton: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modelButtonSelected: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  modelButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modelButtonTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#4caf50',
  },
  sendButton: {
    backgroundColor: '#2196f3',
  },
  clearButton: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  successText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    color: '#ff9800',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
  conversationContainer: {
    marginBottom: 16,
  },
  messageCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  assistantMessage: {
    backgroundColor: '#f5f5f5',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#666',
  },
  messageContent: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
