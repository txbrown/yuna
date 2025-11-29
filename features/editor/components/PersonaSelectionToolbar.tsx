/**
 * @feature Editor
 * @description Horizontal toolbar that appears at the top when text is selected, allowing persona tagging
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { PersonaAvatar } from '@/features/personas';
import { Persona } from '@/features/personas/models/persona';
import { TextSelection } from './usePersonaSelection';

export interface PersonaSelectionToolbarProps {
  visible: boolean;
  selection: TextSelection | null;
  headerHeight: number; // Header height for positioning in nav bar area
  personas: Persona[];
  onPersonaSelect: (persona: Persona, selection: TextSelection) => void;
  onDismiss: () => void;
}

/**
 * Horizontal toolbar for persona selection - positioned in nav bar area on the right
 */
export const PersonaSelectionToolbar: React.FC<PersonaSelectionToolbarProps> = ({
  visible,
  selection,
  headerHeight,
  personas,
  onPersonaSelect,
  onDismiss,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current; // Slide in from right

  // Calculate position: center vertically in header content area
  // headerHeight = safeAreaTop + 8 (paddingTop) + 44 (content) + 12 (paddingBottom)
  // Content area starts at: safeAreaTop + 8, height is 44px
  // To center toolbar (height ~40) in content area:
  // Center of content: safeAreaTop + 8 + 22 = headerHeight - 12 - 22 = headerHeight - 34
  // Center toolbar: headerHeight - 34 - 20 = headerHeight - 54
  const toolbarHeight = 40; // Approximate toolbar height
  const headerContentHeight = 44;
  const headerPaddingBottom = 12;
  const toolbarTop = headerHeight - headerPaddingBottom - (headerContentHeight / 2) - (toolbarHeight / 2);

  // Handle visibility and animations - no auto-dismiss, only dismiss on selection change
  useEffect(() => {
    if (visible && selection) {
      // Animate in (slide in from right and fade in)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out immediately when not visible (slide out to right and fade out)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, selection, fadeAnim, slideAnim]);

  const handlePersonaPress = (persona: Persona) => {
    if (!selection) return;

    // Call callback
    onPersonaSelect(persona, selection);

    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible || !selection) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.toolbar,
        {
          top: toolbarTop,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.toolbarContent}>
        {personas.map((persona, index) => (
          <TouchableOpacity
            key={persona.id}
            style={[
              styles.personaButton,
              index > 0 && styles.personaButtonSpacing,
            ]}
            onPress={() => handlePersonaPress(persona)}
            activeOpacity={0.7}
          >
            <PersonaAvatar persona={persona} size="small" />
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

