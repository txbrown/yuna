import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Persona } from '../models/persona';

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

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the persona');
      return;
    }

    if (!systemPrompt.trim()) {
      Alert.alert('Error', 'Please enter a system prompt');
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
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., 12 Year Old Kid"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="A brief description of this persona"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>System Prompt *</Text>
        <Text style={styles.hint}>
          This defines the persona's personality and behavior
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={systemPrompt}
          onChangeText={setSystemPrompt}
          placeholder="You are a curious and energetic 12-year-old kid..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
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
            keyboardType="decimal-pad"
            placeholder="0.7"
          />
        </View>

        <View style={[styles.section, styles.halfWidth]}>
          <Text style={styles.label}>Max Tokens</Text>
          <Text style={styles.hint}>Maximum response length</Text>
          <TextInput
            style={styles.input}
            value={maxTokens}
            onChangeText={setMaxTokens}
            keyboardType="number-pad"
            placeholder="512"
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
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
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

