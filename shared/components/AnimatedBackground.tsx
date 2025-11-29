import React from 'react';
import { StyleSheet, View, useWindowDimensions, LayoutChangeEvent } from 'react-native';
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { GRADIENT_PRESETS, type GradientPreset } from './AnimatedBackground.constants';

export interface AnimatedBackgroundProps {
  preset?: GradientPreset;
  colors?: string[];
  children?: React.ReactNode;
}

/**
 * @description Full-screen animated gradient background component using Skia
 * @example
 * <AnimatedBackground preset="sunny">
 *   <YourContent />
 * </AnimatedBackground>
 */
export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  preset,
  colors,
  children,
}) => {
  const windowDimensions = useWindowDimensions();
  const [dimensions, setDimensions] = React.useState({
    width: windowDimensions.width,
    height: windowDimensions.height,
  });
  const animationValue = useSharedValue(0);

  // Start animation loop
  React.useEffect(() => {
    animationValue.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, [animationValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animationValue.value, [0, 1], [0.95, 1]),
    };
  });

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setDimensions({ width, height });
    }
  }, []);

  // Determine gradient colors
  const gradientColors = React.useMemo(() => {
    if (colors) {
      return colors;
    }
    if (preset) {
      return GRADIENT_PRESETS[preset];
    }
    return GRADIENT_PRESETS.sunny; // default
  }, [colors, preset]);

  // Ensure we have valid dimensions
  const canvasWidth = dimensions.width > 0 ? dimensions.width : windowDimensions.width;
  const canvasHeight = dimensions.height > 0 ? dimensions.height : windowDimensions.height;

  return (
    <View
      testID="animated-background-container"
      style={[styles.container, animatedStyle]}
      onLayout={handleLayout}
    >
      {canvasWidth > 0 && canvasHeight > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, canvasHeight)}
              colors={gradientColors}
            />
          </Rect>
        </Canvas>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

