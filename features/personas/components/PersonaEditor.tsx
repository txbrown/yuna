import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Persona } from '../models/persona';
import { AvatarSelector } from './AvatarSelector';
import { PersonaAvatar } from './PersonaAvatar';

export interface PersonaEditorProps {
  persona: Persona | null;
  onSave: (persona: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

/**
 * Editor component for creating/editing personas
 */
export const PersonaEditor: React.FC<PersonaEditorProps> = ({
  persona,
  onSave,
  onCancel,
  mode = persona ? 'edit' : 'create',
}) => {
  const [name, setName] = useState(persona?.name || '');
  const [description, setDescription] = useState(persona?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(persona?.systemPrompt || '');
  const [temperature, setTemperature] = useState(
    persona?.temperature.toString() || '0.7'
  );
  const [maxTokens, setMaxTokens] = useState(
    persona?.maxTokens.toString() || '512'
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    (persona?.avatarConfig?.presetId as string) || 'kid'
  );

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the persona');
      return;
    }

    if (!systemPrompt.trim()) {
      Alert.alert('Error', 'Please enter instructions for the persona');
      return;
    }

    const tempValue = parseFloat(temperature);
    const maxTokensValue = parseInt(maxTokens, 10);

    if (isNaN(tempValue) || tempValue < 0 || tempValue > 2) {
      Alert.alert('Error', 'Temperature must be between 0 and 2');
      return;
    }

    if (isNaN(maxTokensValue) || maxTokensValue <= 0) {
      Alert.alert('Error', 'Max tokens must be a positive number');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
      temperature: tempValue,
      maxTokens: maxTokensValue,
      avatarConfig: { presetId: selectedPresetId },
    });
  };

  // Create temporary persona for avatar preview
  const previewPersona = useMemo(
    () => ({
      id: 'preview_persona',
      name: name || 'Preview',
      description: '',
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 512,
      avatarConfig: { presetId: selectedPresetId },
      createdAt: 0,
      updatedAt: 0,
    }),
    [name, selectedPresetId]
  );

  return (
    <ScrollView style={styles.container}>
      {/* Avatar Selection Section */}
      <View style={styles.avatarSection}>
        <Text style={styles.sectionTitle}>Personalize your Persona</Text>
        <View style={styles.avatarPreviewContainer}>
          <PersonaAvatar persona={previewPersona} size='large' />
          <View style={styles.avatarPreviewInfo}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder='Enter a name'
              placeholderTextColor='#999'
            />
          </View>
        </View>
        <View style={styles.avatarSelectorContainer}>
          <Text style={styles.avatarSelectorLabel}>Choose an avatar</Text>
          <AvatarSelector
            selectedPresetId={selectedPresetId}
            onSelect={setSelectedPresetId}
          />
        </View>
      </View>

      {/* Instructions Section */}
      <View style={styles.section}>
        <View style={styles.instructionsHeader}>
          <Text style={styles.label}>Instructions</Text>
          <Text style={styles.hint}>
            Use instructions to guide the persona's behavior
          </Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={systemPrompt}
          onChangeText={setSystemPrompt}
          placeholder='You are a curious and energetic 12-year-old kid...'
          multiline
          numberOfLines={6}
          textAlignVertical='top'
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder='A brief description of this persona'
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder='A brief description of this persona'
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={styles.label}>Temperature</Text>
          <Text style={styles.hint}>0.0 (deterministic) - 2.0 (creative)</Text>
          <TextInput
            style={styles.input}
            value={temperature}
            onChangeText={setTemperature}
            keyboardType='decimal-pad'
            placeholder='0.7'
          />
        </View>

        <View style={[styles.section, styles.halfWidth]}>
          <Text style={styles.label}>Max Tokens</Text>
          <Text style={styles.hint}>Maximum response length</Text>
          <TextInput
            style={styles.input}
            value={maxTokens}
            onChangeText={setMaxTokens}
            keyboardType='number-pad'
            placeholder='512'
          />
        </View>
      </View>

      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  avatarSection: {
    padding: 24,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPreviewInfo: {
    marginTop: 16,
    width: '100%',
    maxWidth: 200,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#2196f3',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  avatarSelectorContainer: {
    marginTop: 16,
  },
  avatarSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  instructionsHeader: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  halfWidth: {
    flex: 1,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2196f3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
