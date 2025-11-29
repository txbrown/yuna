import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { AVATAR_PRESETS, getAvatarPreset } from '../constants';
import { Persona } from '../models/persona';
import { SkiaPersonaAvatar } from './SkiaPersonaAvatar';

export interface PersonaAvatarProps {
  persona: Persona;
  size?: 'small' | 'medium' | 'large';
  variant?: string;
  onPress?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
  showCrown?: boolean;
}

const SIZE_MAP = {
  small: 32,
  medium: 48,
  large: 80,
};

const CROWN_SIZE_MAP = {
  small: 12,
  medium: 16,
  large: 24,
};

/**
 * Rich, composable component for displaying a persona as a circular avatar
 */
export const PersonaAvatar: React.FC<PersonaAvatarProps> = ({
  persona,
  size = 'medium',
  variant,
  onPress,
  style,
  children,
  showCrown = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Get avatar configuration
  const presetId =
    (persona.avatarConfig?.presetId as string) || AVATAR_PRESETS[0].id;
  const preset = getAvatarPreset(presetId) || AVATAR_PRESETS[0];

  const avatarSize = SIZE_MAP[size];
  const crownSize = CROWN_SIZE_MAP[size];

  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: isPressed ? 0.7 : 1,
    transform: [{ scale: isPressed ? 0.95 : 1 }],
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <View
      style={[styles.wrapper, style]}
      pointerEvents={onPress ? 'auto' : 'none'}
    >
      <Wrapper
        style={containerStyle}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={1}
      >
        <SkiaPersonaAvatar preset={preset} size={avatarSize} />
        {showCrown && (
          <View style={[styles.crown, { top: -crownSize / 2 }]}>
            <Text style={[styles.crownEmoji, { fontSize: crownSize }]}>👑</Text>
          </View>
        )}
      </Wrapper>
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  crown: {
    position: 'absolute',
    alignSelf: 'center',
  },
  crownEmoji: {
    textAlign: 'center',
  },
  childrenContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
});
