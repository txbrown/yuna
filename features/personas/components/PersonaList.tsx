import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Persona } from '../models/persona';
import { PersonaCard, PersonaCardProps } from './PersonaCard';

export interface PersonaListProps {
  personas: Persona[];
  selectedPersonaId?: string;
  isLoading?: boolean;
  onSelectPersona?: (persona: Persona) => void;
  onEditPersona?: (persona: Persona) => void;
  onDeletePersona?: (persona: Persona) => void;
  emptyMessage?: string;
}

/**
 * List component for displaying multiple personas
 */
export const PersonaList: React.FC<PersonaListProps> = ({
  personas,
  selectedPersonaId,
  isLoading = false,
  onSelectPersona,
  onEditPersona,
  onDeletePersona,
  emptyMessage = 'No personas available',
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Loading personas...</Text>
      </View>
    );
  }

  if (personas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const renderPersona = ({ item }: { item: Persona }) => {
    const isSelected = item.id === selectedPersonaId;
    return (
      <PersonaCard
        persona={item}
        isSelected={isSelected}
        onPress={() => onSelectPersona?.(item)}
        onEdit={onEditPersona ? () => onEditPersona(item) : undefined}
        onDelete={onDeletePersona ? () => onDeletePersona(item) : undefined}
      />
    );
  };

  return (
    <FlatList
      data={personas}
      renderItem={renderPersona}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
});

