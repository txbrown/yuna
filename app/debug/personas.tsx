import {
  CactusModel,
  cactusService,
} from '@/features/personas/services/cactus-service';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PersonasDebugScreen() {
  const [selectedModel, setSelectedModel] = useState<CactusModel>('qwen3-0.6');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [modelStatuses, setModelStatuses] = useState<
    Record<CactusModel, { downloaded: boolean; initialized: boolean }>
  >({
    'qwen3-0.6': { downloaded: false, initialized: false },
    'lfm2-350m': { downloaded: false, initialized: false },
    'qwen3-1.5': { downloaded: false, initialized: false },
  });

  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<
    Array<{
      role: string;
      content: string;
      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }>
  >([]);
  const [temperature, setTemperature] = useState<string>('0.7');
  const [maxTokens, setMaxTokens] = useState<string>('512');
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);

  const availableModels: CactusModel[] = [
    'qwen3-0.6',
    'lfm2-350m',
    'qwen3-1.5',
  ];

  useEffect(() => {
    checkModelStatuses();
    // Check if service is already initialized
    if (cactusService.isInitialized()) {
      const currentModel = cactusService.getCurrentModel();
      if (currentModel) {
        setIsInitialized(true);
        setSelectedModel(currentModel);
      }
    }
  }, []);

  const checkModelStatuses = async () => {
    const statuses: Record<
      CactusModel,
      { downloaded: boolean; initialized: boolean }
    > = {
      'qwen3-0.6': { downloaded: false, initialized: false },
      'lfm2-350m': { downloaded: false, initialized: false },
      'qwen3-1.5': { downloaded: false, initialized: false },
    };

    for (const model of availableModels) {
      try {
        const status = await cactusService.checkModelStatus(model);
        statuses[model] = {
          downloaded: status.downloaded,
          initialized: status.initialized,
        };
      } catch (error) {
        console.error(`Error checking status for ${model}:`, error);
      }
    }

    setModelStatuses(statuses);
  };

  const handleDownloadModel = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      Alert.alert(
        'Download Started',
        `Downloading ${selectedModel}... This may take a few minutes.`
      );

      await cactusService.downloadModel(selectedModel, (progress) => {
        setDownloadProgress(progress);
      });

      setIsInitialized(true);
      await checkModelStatuses();

      Alert.alert('Success', `Model ${selectedModel} downloaded and ready!`);
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to download model: ${(error as Error).message}`
      );
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleSwitchModel = async () => {
    if (isDownloading || isGenerating) {
      return;
    }

    try {
      await cactusService.switchModel(selectedModel);
      setIsInitialized(cactusService.isInitialized());
      await checkModelStatuses();

      if (cactusService.isInitialized()) {
        Alert.alert('Success', `Switched to model ${selectedModel}`);
      } else {
        Alert.alert(
          'Info',
          `Model ${selectedModel} needs to be downloaded first.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to switch model: ${(error as Error).message}`
      );
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Service',
      'This will reset the Cactus service. You will need to re-download models.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            cactusService.reset();
            setIsInitialized(false);
            setConversation([]);
            setTotalTokensUsed(0);
            checkModelStatuses();
            Alert.alert('Success', 'Service reset successfully.');
          },
        },
      ]
    );
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

      const tempValue = parseFloat(temperature);
      const maxTokensValue = parseInt(maxTokens, 10);

      const result = await cactusService.complete({
        messages: updatedConversation.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        temperature: isNaN(tempValue) ? undefined : tempValue,
        maxTokens: isNaN(maxTokensValue) ? undefined : maxTokensValue,
      });

      const assistantMessage = {
        role: 'assistant' as const,
        content: result.response,
        usage: result.usage,
      };

      setConversation([...updatedConversation, assistantMessage]);

      if (result.usage) {
        setTotalTokensUsed((prev) => prev + result.usage!.totalTokens);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to generate response: ${(error as Error).message}`
      );
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
          {availableModels.map((model) => {
            const status = modelStatuses[model];
            const modelInfo = cactusService.getModelInfo(model);
            const isSelected = selectedModel === model;
            const isCurrent =
              cactusService.getCurrentModel() === model && isInitialized;

            return (
              <TouchableOpacity
                key={model}
                style={[
                  styles.modelButton,
                  isSelected && styles.modelButtonSelected,
                  isCurrent && styles.modelButtonCurrent,
                ]}
                onPress={() => setSelectedModel(model)}
                disabled={isDownloading || isGenerating}
              >
                <Text
                  style={[
                    styles.modelButtonText,
                    isSelected && styles.modelButtonTextSelected,
                  ]}
                >
                  {model}
                </Text>
                <Text style={styles.modelButtonSubtext}>{modelInfo.size}</Text>
                {isCurrent && (
                  <Text style={styles.modelButtonStatus}>● Active</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isDownloading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${downloadProgress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(downloadProgress * 100)}%
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.downloadButton, { flex: 1 }]}
            onPress={handleDownloadModel}
            disabled={isDownloading || isGenerating}
          >
            <Text style={styles.buttonText}>
              {isDownloading
                ? 'Downloading...'
                : isInitialized &&
                  cactusService.getCurrentModel() === selectedModel
                ? 'Re-download'
                : 'Download Model'}
            </Text>
          </TouchableOpacity>

          {cactusService.getCurrentModel() !== selectedModel && (
            <TouchableOpacity
              style={[styles.button, styles.switchButton, { flex: 1 }]}
              onPress={handleSwitchModel}
              disabled={isDownloading || isGenerating}
            >
              <Text style={styles.buttonText}>Switch</Text>
            </TouchableOpacity>
          )}
        </View>

        {isInitialized && cactusService.getCurrentModel() === selectedModel && (
          <Text style={styles.successText}>✓ Model {selectedModel} ready</Text>
        )}

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
          disabled={isDownloading || isGenerating}
        >
          <Text style={styles.buttonText}>Reset Service</Text>
        </TouchableOpacity>
      </View>

      {/* Generation Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Generation Settings</Text>

        <View style={styles.settingsRow}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Temperature: {temperature}</Text>
            <TextInput
              style={styles.settingInput}
              value={temperature}
              onChangeText={setTemperature}
              keyboardType='decimal-pad'
              placeholder='0.7'
              editable={!isGenerating}
            />
            <Text style={styles.settingHint}>
              0.0 (deterministic) - 2.0 (creative)
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Max Tokens: {maxTokens}</Text>
            <TextInput
              style={styles.settingInput}
              value={maxTokens}
              onChangeText={setMaxTokens}
              keyboardType='number-pad'
              placeholder='512'
              editable={!isGenerating}
            />
            <Text style={styles.settingHint}>Maximum response length</Text>
          </View>
        </View>

        {totalTokensUsed > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Total Tokens Used: {totalTokensUsed.toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Chat Interface */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Chat with AI</Text>

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
                  msg.role === 'user'
                    ? styles.userMessage
                    : styles.assistantMessage,
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.messageRole}>
                    {msg.role === 'user' ? '👤 You' : '🤖 AI'}
                  </Text>
                  {msg.usage && (
                    <Text style={styles.messageUsage}>
                      {msg.usage.totalTokens} tokens
                    </Text>
                  )}
                </View>
                <Text style={styles.messageContent}>{msg.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder='Type your message...'
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
              <ActivityIndicator color='#fff' />
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
        <Text style={styles.infoText}>
          • First time: Download the model (may take a few minutes)
        </Text>
        <Text style={styles.infoText}>
          • qwen3-0.6 is the smallest/fastest model (~600MB)
        </Text>
        <Text style={styles.infoText}>
          • Chat history is maintained for context
        </Text>
        <Text style={styles.infoText}>
          • AI runs completely on-device (offline)
        </Text>
        <Text style={styles.infoText}>
          • Lower temperature = more focused, Higher = more creative
        </Text>
        <Text style={styles.infoText}>
          • Adjust max tokens to control response length
        </Text>
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
  modelButtonCurrent: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  modelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  modelButtonTextSelected: {
    color: '#2196f3',
    fontWeight: '700',
  },
  modelButtonSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  modelButtonStatus: {
    fontSize: 10,
    color: '#4caf50',
    marginTop: 4,
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
  switchButton: {
    backgroundColor: '#ff9800',
  },
  resetButton: {
    backgroundColor: '#f44336',
    marginTop: 8,
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
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  settingsRow: {
    gap: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  statsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});
