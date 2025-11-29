import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Persona } from '../models/persona';

export interface PersonaCardProps {
  persona: Persona;
  isSelected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Card component for displaying a persona
 */
export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  isSelected = false,
  onPress,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{persona.name}</Text>
        {isSelected && <Text style={styles.selectedBadge}>● Active</Text>}
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {persona.description}
      </Text>
      <View style={styles.metadata}>
        <Text style={styles.metadataText}>
          Temp: {persona.temperature} | Max: {persona.maxTokens} tokens
        </Text>
      </View>
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  selectedBadge: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  metadata: {
    marginTop: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#f44336',
  },
});
