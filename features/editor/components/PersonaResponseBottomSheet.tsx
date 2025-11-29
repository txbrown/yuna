/**
 * @feature Editor
 * @description Bottom sheet that displays persona responses to the editor content
 */

import {
  AVATAR_PRESETS,
  PersonaAvatar,
  getAvatarPreset,
} from '@/features/personas';
import { Persona } from '@/features/personas/models/persona';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface PersonaResponse {
  personaId: string;
  response: string;
  isLoading: boolean;
}

export interface PersonaResponseBottomSheetProps {
  visible: boolean;
  personas: Persona[];
  responses: PersonaResponse[];
  onDismiss: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7; // 70% of screen height

/**
 * Bottom sheet showing persona responses to editor content
 */
export const PersonaResponseBottomSheet: React.FC<
  PersonaResponseBottomSheetProps
> = ({ visible, personas, responses, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 25,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='none'
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.backdrop,
              { opacity: backdropOpacity },
            ]}
          />
        </TouchableOpacity>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: SHEET_HEIGHT,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Persona Analysis</Text>
            <Text style={styles.subtitle}>
              Each persona analyzes your content from their unique perspective
            </Text>
          </View>

          {/* Responses */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {personas.map((persona) => {
              const response = responses.find(
                (r) => r.personaId === persona.id
              );
              const isLoading = response?.isLoading ?? true;
              const responseText = response?.response ?? '';

              // Get persona color from avatar preset
              const presetId =
                (persona.avatarConfig?.presetId as string) ||
                AVATAR_PRESETS[0].id;
              const preset = getAvatarPreset(presetId) || AVATAR_PRESETS[0];
              const personaColor = preset.borderColor;

              return (
                <View key={persona.id} style={styles.responseCard}>
                  {/* Persona Header */}
                  <View style={styles.personaHeader}>
                    <PersonaAvatar persona={persona} size='medium' />
                    <View style={styles.personaInfo}>
                      <Text style={styles.personaName}>{persona.name}</Text>
                      <Text style={styles.personaRole} numberOfLines={1}>
                        {persona.description}
                      </Text>
                    </View>
                  </View>

                  {/* Response Content */}
                  <View
                    style={[
                      styles.responseContent,
                      { borderLeftColor: personaColor },
                    ]}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size='small' color={personaColor} />
                        <Text style={styles.loadingText}>Analyzing...</Text>
                      </View>
                    ) : (
                      <Text style={styles.responseText}>{responseText}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'SpaceMono-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'SpaceMono',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  responseCard: {
    marginBottom: 16,
  },
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  personaInfo: {
    marginLeft: 12,
    flex: 1,
  },
  personaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'SpaceMono-Bold',
  },
  personaRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'SpaceMono',
  },
  responseContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'SpaceMono',
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'SpaceMono',
  },
});
