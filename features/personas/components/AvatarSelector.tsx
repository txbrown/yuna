import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AVATAR_PRESETS, AvatarPreset } from '../constants';
import { Persona } from '../models/persona';
import { PersonaAvatar } from './PersonaAvatar';

export interface AvatarSelectorProps {
  selectedPresetId?: string;
  onSelect: (presetId: string) => void;
  presets?: AvatarPreset[];
}

/**
 * Grid component for selecting avatar presets
 * Renders PersonaAvatar components in a selectable grid
 */
export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedPresetId,
  onSelect,
  presets = AVATAR_PRESETS,
}) => {
  // Memoize temporary persona objects to avoid re-creation on every render
  const tempPersonas = useMemo(() => {
    return presets.reduce((acc, preset) => {
      acc[preset.id] = {
        id: `preview_${preset.id}`,
        name: preset.name,
        description: '',
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 512,
        avatarConfig: { presetId: preset.id },
        createdAt: 0,
        updatedAt: 0,
      } as Persona;
      return acc;
    }, {} as Record<string, Persona>);
  }, [presets]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          const tempPersona = tempPersonas[preset.id];

          return (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.avatarOption,
                isSelected && styles.avatarOptionSelected,
              ]}
              onPress={() => onSelect(preset.id)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <PersonaAvatar persona={tempPersona} size='medium' />
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedCheck}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  avatarOption: {
    width: 64,
    height: 64,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  avatarOptionSelected: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedCheck: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
