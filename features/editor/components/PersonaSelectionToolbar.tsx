/**
 * @feature Editor
 * @description Floating toolbar that displays personas and triggers bottom sheet on press
 */

import { PersonaAvatar } from '@/features/personas';
import { Persona } from '@/features/personas/models/persona';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface PersonaSelectionToolbarProps {
  headerHeight: number; // Header height for positioning in nav bar area
  personas: Persona[];
  onPersonaPress: () => void; // Opens bottom sheet with ALL persona analyses
}

/**
 * Always-visible floating toolbar for persona selection - positioned in nav bar area on the right
 */
export const PersonaSelectionToolbar: React.FC<
  PersonaSelectionToolbarProps
> = ({ headerHeight, personas, onPersonaPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Calculate position: center vertically in header content area
  const toolbarHeight = 40;
  const headerContentHeight = 44;
  const headerPaddingBottom = 12;
  const toolbarTop =
    headerHeight -
    headerPaddingBottom -
    headerContentHeight / 2 -
    toolbarHeight / 2;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (personas.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.toolbar,
        {
          top: toolbarTop,
          opacity: fadeAnim,
        },
      ]}
      pointerEvents='box-none'
    >
      <View style={styles.toolbarContent}>
        {personas.map((persona, index) => (
          <TouchableOpacity
            key={persona.id}
            style={[
              styles.personaButton,
              index > 0 && styles.personaButtonSpacing,
            ]}
            onPress={onPersonaPress}
            activeOpacity={0.7}
          >
            <PersonaAvatar persona={persona} size='small' />
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    right: 20, // Right padding (matches header padding)
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  toolbarContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  personaButton: {
    marginHorizontal: 2,
  },
  personaButtonSpacing: {
    // Additional spacing handled by gap
  },
});
