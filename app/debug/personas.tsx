import {
  Persona,
  PersonaAvatar,
  PersonaChat,
  PersonaEditor,
  PersonaList,
  usePersonas,
} from '@/features/personas';
import {
  CactusModel,
  cactusService,
} from '@/features/personas/services/cactus-service';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Tab = 'model' | 'personas' | 'chat';

export default function PersonasDebugScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('model');
  const [selectedModel, setSelectedModel] = useState<CactusModel>('qwen3-0.6');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [modelStatuses, setModelStatuses] = useState<
    Record<CactusModel, { downloaded: boolean; initialized: boolean }>
  >({
    'qwen3-0.6': { downloaded: false, initialized: false },
    'lfm2-350m': { downloaded: false, initialized: false },
    'qwen3-1.5': { downloaded: false, initialized: false },
  });

  // Persona management
  const {
    personas,
    isLoading: isLoadingPersonas,
    createPersona,
    updatePersona,
    deletePersona,
    resetToDefaults,
    getPersona,
  } = usePersonas();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  // Auto-select first persona if none selected
  useEffect(() => {
    if (personas.length > 0 && !selectedPersona) {
      setSelectedPersona(personas[0]);
    }
  }, [personas, selectedPersona]);

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
    if (isDownloading) {
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
            checkModelStatuses();
            Alert.alert('Success', 'Service reset successfully.');
          },
        },
      ]
    );
  };

  // Persona handlers
  const handleCreatePersona = () => {
    setIsCreating(true);
    setEditingPersona(null);
    setShowEditor(true);
  };

  const handleEditPersona = (persona: Persona) => {
    setIsCreating(false);
    setEditingPersona(persona);
    setShowEditor(true);
  };

  const handleDeletePersona = (persona: Persona) => {
    Alert.alert(
      'Delete Persona',
      `Are you sure you want to delete "${persona.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePersona(persona.id);
            if (selectedPersona?.id === persona.id) {
              const remaining = personas.filter((p) => p.id !== persona.id);
              setSelectedPersona(remaining[0] || null);
            }
          },
        },
      ]
    );
  };

  const handleSavePersona = (
    data: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (isCreating) {
        const newPersona = createPersona(data);
        setSelectedPersona(newPersona);
      } else if (editingPersona) {
        const updated = updatePersona(editingPersona.id, data);
        // Update selectedPersona if it's the one being edited
        // Use the updated persona from the repository to ensure we have the latest reference
        if (updated && selectedPersona?.id === editingPersona.id) {
          // Get fresh reference from repository to ensure consistency
          const freshPersona = getPersona(editingPersona.id);
          if (freshPersona) {
            setSelectedPersona(freshPersona);
          } else {
            setSelectedPersona(updated);
          }
        }
      }
      setShowEditor(false);
      setEditingPersona(null);
      setIsCreating(false);
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to save persona: ${(error as Error).message}`
      );
    }
  };

  const handleResetPersonas = () => {
    Alert.alert(
      'Reset Personas',
      'This will reset all personas to defaults. Custom personas will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToDefaults();
            const defaults = personas.filter((p) =>
              ['12 Year Old Kid', 'Engineer', 'Scientist'].includes(p.name)
            );
            setSelectedPersona(defaults[0] || null);
          },
        },
      ]
    );
  };

  const renderModelSetup = () => (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>Model Setup</Text>
        <Text style={styles.subheader}>Configure Cactus AI Model</Text>
      </View>

      {/* Model Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Model</Text>
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
                disabled={isDownloading}
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
            disabled={isDownloading}
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
              disabled={isDownloading}
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
          disabled={isDownloading}
        >
          <Text style={styles.buttonText}>Reset Service</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPersonas = () => (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.header}>Personas</Text>
            <Text style={styles.subheader}>Manage AI personas</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreatePersona}
          >
            <Text style={styles.buttonText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <PersonaList
        personas={personas}
        selectedPersonaId={selectedPersona?.id}
        isLoading={isLoadingPersonas}
        onSelectPersona={(persona) => {
          setSelectedPersona(persona);
        }}
        onEditPersona={handleEditPersona}
        onDeletePersona={handleDeletePersona}
      />

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleResetPersonas}
        >
          <Text style={styles.buttonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showEditor}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => {
          setShowEditor(false);
          setEditingPersona(null);
          setIsCreating(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isCreating ? 'Create Persona' : 'Edit Persona'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowEditor(false);
                setEditingPersona(null);
                setIsCreating(false);
              }}
            >
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <PersonaEditor
            persona={editingPersona}
            onSave={handleSavePersona}
            onCancel={() => {
              setShowEditor(false);
              setEditingPersona(null);
              setIsCreating(false);
            }}
            mode={isCreating ? 'create' : 'edit'}
          />
        </View>
      </Modal>
    </View>
  );

  const renderChat = () => (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.chatHeader}>
          <Text style={styles.header}>Chat</Text>
          {selectedPersona && (
            <View style={styles.chatPersonaInfo}>
              <PersonaAvatar persona={selectedPersona} size='medium' />
              <Text style={styles.subheader}>
                Chatting with {selectedPersona.name}
              </Text>
            </View>
          )}
          {!selectedPersona && (
            <Text style={styles.subheader}>
              Select a persona to start chatting
            </Text>
          )}
        </View>
      </View>

      {!isInitialized && (
        <View style={styles.section}>
          <Text style={styles.warningText}>
            Please download a model first in the Model Setup tab
          </Text>
        </View>
      )}

      <View style={styles.chatContainer}>
        <PersonaChat persona={selectedPersona} />
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'model' && styles.tabActive]}
          onPress={() => setActiveTab('model')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'model' && styles.tabTextActive,
            ]}
          >
            Model
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personas' && styles.tabActive]}
          onPress={() => setActiveTab('personas')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'personas' && styles.tabTextActive,
            ]}
          >
            Personas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'chat' && styles.tabTextActive,
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'model' && renderModelSetup()}
      {activeTab === 'personas' && renderPersonas()}
      {activeTab === 'chat' && renderChat()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2196f3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2196f3',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    gap: 12,
  },
  chatPersonaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  createButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
