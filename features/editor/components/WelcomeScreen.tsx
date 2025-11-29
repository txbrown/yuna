import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

export interface WelcomeScreenProps {
  /** Callback when user taps to start editing */
  onPress: (editorStartPosition: { x: number; y: number }) => void;
  /** Editor start position for cursor animation */
  editorStartPosition: { x: number; y: number };
  /** Whether the welcome screen is visible */
  visible: boolean;
}

/**
 * @description Welcome screen component with animated cursor that transitions to editor
 * @example
 * <WelcomeScreen
 *   visible={showWelcome}
 *   editorStartPosition={{ x: 20, y: 100 }}
 *   onPress={handleStartEditing}
 * />
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onPress,
  editorStartPosition,
  visible,
}) => {
  const [subtitlePosition, setSubtitlePosition] = React.useState<{ x: number; y: number } | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Cursor animation values
  const cursorOpacity = useSharedValue(0);
  const cursorX = useSharedValue(0);
  const cursorY = useSharedValue(0);
  const blinkOpacity = useSharedValue(1);
  const welcomeOpacity = useSharedValue(visible ? 1 : 0);

  // Animate welcome screen opacity
  React.useEffect(() => {
    if (visible) {
      welcomeOpacity.value = withTiming(1, { duration: 300 });
    } else {
      welcomeOpacity.value = withTiming(0, { duration: 300 });
      // Hide cursor when welcome screen is hidden
      cursorOpacity.value = 0;
    }
  }, [visible, welcomeOpacity, cursorOpacity]);

  const handleSubtitleLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    // Position cursor at the start of the text
    // The layout coordinates are relative to the welcome container (which is absolutely positioned at 0,0)
    // So these are effectively screen coordinates
    // y + height/2 - 10 centers the cursor vertically on the text line (cursor height is 20)
    const position = {
      x: Math.max(0, x - 2), // Offset slightly left to appear before text, ensure non-negative
      y: y + height / 2 - 10, // Center vertically on text baseline
    };
    
    setSubtitlePosition(position);
    
    // Start cursor animation immediately when layout is measured (if visible)
    if (visible) {
      cursorOpacity.value = 1;
      cursorX.value = position.x;
      cursorY.value = position.y;
      
      // Start blinking animation
      blinkOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 500, easing: Easing.ease }),
          withTiming(1, { duration: 500, easing: Easing.ease })
        ),
        -1,
        false
      );
    }
  };

  const handlePress = () => {
    if (!subtitlePosition || isAnimating) return;

    setIsAnimating(true);

    // Ensure cursor starts at subtitle position
    const startX = subtitlePosition.x;
    const startY = subtitlePosition.y;

    cursorX.value = startX;
    cursorY.value = startY;

    // Direct diagonal animation from subtitle position to editor start position
    cursorX.value = withTiming(editorStartPosition.x, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    cursorY.value = withTiming(editorStartPosition.y, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });

    // After animation completes, fade out cursor and call onPress
    setTimeout(() => {
      cursorOpacity.value = withTiming(0, { duration: 200 });
      onPress(editorStartPosition);
      // Clean up after fade completes
      setTimeout(() => {
        setIsAnimating(false);
        blinkOpacity.value = 1; // Reset blink opacity
      }, 200);
    }, 900);
  };

  const welcomeStyle = useAnimatedStyle(() => {
    return {
      opacity: welcomeOpacity.value,
      transform: [
        {
          translateY: interpolate(welcomeOpacity.value, [0, 1], [20, 0]),
        },
      ],
    };
  });

  const cursorStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: cursorX.value,
      top: cursorY.value,
      opacity: cursorOpacity.value * blinkOpacity.value,
      width: 2,
      height: 20,
      backgroundColor: '#000',
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <>
      <Animated.View
        testID="welcome-screen"
        style={[styles.container, welcomeStyle]}
      >
        <Text style={styles.title}>ITS A GOOD DAY TO YUNA</Text>
        <Text
          style={styles.subtitle}
          onLayout={handleSubtitleLayout}
        >
          tap to get started
        </Text>
      </Animated.View>

      {/* Blinking cursor animation */}
      {subtitlePosition && (
        <Animated.View testID="cursor-animation" style={cursorStyle} />
      )}

      {/* Invisible pressable overlay for tap handling */}
      <Pressable
        style={styles.pressableOverlay}
        onPress={handlePress}
        testID="welcome-screen-pressable"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    fontFamily: 'SpaceMono-Bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'SpaceMono',
    color: '#666',
    textAlign: 'center',
  },
  pressableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

