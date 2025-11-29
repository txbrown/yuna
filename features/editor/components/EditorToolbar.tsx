import React from 'react';
import { Keyboard, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import type { EditorToolbarProps } from '../types';

const DEFAULT_BOTTOM = 30;
const KEYBOARD_OFFSET = 20; // Space above keyboard

/**
 * @description Formatting toolbar component for the editor with keyboard-aware animation
 * @example
 * <EditorToolbar
 *   isBoldActive={isBold}
 *   isItalicActive={isItalic}
 *   isListActive={isList}
 *   onToggleBold={handleToggleBold}
 *   onToggleItalic={handleToggleItalic}
 *   onToggleList={handleToggleList}
 * />
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isBoldActive,
  isItalicActive,
  isUnderlineActive,
  isStrikeThroughActive,
  isListActive,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrikeThrough,
  onToggleList,
  isVisible = true,
  showItalic = true, // SpaceMono supports italics
}) => {
  const bottomPosition = useSharedValue(DEFAULT_BOTTOM);
  const opacity = useSharedValue(isVisible ? 1 : 0);
  const scale = useSharedValue(isVisible ? 1 : 0.8);

  React.useEffect(() => {
    opacity.value = withTiming(isVisible ? 1 : 0, { duration: 300 });
    scale.value = withTiming(isVisible ? 1 : 0.8, { duration: 300 });
  }, [isVisible, opacity, scale]);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      bottomPosition.value = withTiming(e.endCoordinates.height + KEYBOARD_OFFSET, {
        duration: 250,
      });
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      bottomPosition.value = withTiming(DEFAULT_BOTTOM, {
        duration: 250,
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [bottomPosition]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      bottom: bottomPosition.value,
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View testID="editor-toolbar" style={[styles.container, animatedStyle]}>
      <Pressable
        testID="toolbar-button-bold"
        style={[styles.button, isBoldActive && styles.buttonActive]}
        onPress={onToggleBold}
      >
        <Text style={[styles.buttonText, isBoldActive && styles.buttonTextActive]}>
          B
        </Text>
      </Pressable>

      {showItalic && (
        <Pressable
          testID="toolbar-button-italic"
          style={[styles.button, isItalicActive && styles.buttonActive]}
          onPress={onToggleItalic}
        >
          <Text style={[styles.buttonText, isItalicActive && styles.buttonTextActive]}>
            I
          </Text>
        </Pressable>
      )}

      <Pressable
        testID="toolbar-button-underline"
        style={[styles.button, isUnderlineActive && styles.buttonActive]}
        onPress={onToggleUnderline}
      >
        <Text style={[styles.buttonText, isUnderlineActive && styles.buttonTextActive]}>
          U
        </Text>
      </Pressable>

      <Pressable
        testID="toolbar-button-strikethrough"
        style={[styles.button, isStrikeThroughActive && styles.buttonActive]}
        onPress={onToggleStrikeThrough}
      >
        <Text style={[styles.buttonText, isStrikeThroughActive && styles.buttonTextActive]}>
          S
        </Text>
      </Pressable>

      <Pressable
        testID="toolbar-button-list"
        style={[styles.button, isListActive && styles.buttonActive]}
        onPress={onToggleList}
      >
        <Text style={[styles.buttonText, isListActive && styles.buttonTextActive]}>
          •
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexWrap: 'wrap',
    maxWidth: '95%',
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 40,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#2C2C2C',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono-Bold',
    color: '#333',
  },
  buttonTextActive: {
    color: '#fff',
  },
});

