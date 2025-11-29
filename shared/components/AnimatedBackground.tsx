import {
    Blur,
    Canvas,
    Circle,
    Group,
    LinearGradient,
    Rect,
    vec,
} from '@shopify/react-native-skia';
import React from 'react';
import { LayoutChangeEvent, StyleSheet, View, useWindowDimensions } from 'react-native';
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

  // Cloud positions state - spread out more vertically and horizontally
  const [cloud1X, setCloud1X] = React.useState(canvasWidth * 0.1);
  const [cloud2X, setCloud2X] = React.useState(canvasWidth * 0.5);
  const [cloud3X, setCloud3X] = React.useState(canvasWidth * 0.85);
  
  // Spread clouds vertically across more of the screen (not just top)
  const cloud1Y = canvasHeight * 0.08;
  const cloud2Y = canvasHeight * 0.3;
  const cloud3Y = canvasHeight * 0.18;

  // Easing function for smooth transitions (ease-in-out)
  const easeInOut = (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  // Ping-pong function: converts linear progress to ping-pong (0->1->0)
  const pingPong = (t: number): number => {
    const doubled = t * 2;
    if (doubled <= 1) {
      return easeInOut(doubled);
    } else {
      return easeInOut(2 - doubled);
    }
  };

  // Animate clouds using requestAnimationFrame with smooth ping-pong motion
  React.useEffect(() => {
    let startTime1 = Date.now();
    let startTime2 = Date.now();
    let startTime3 = Date.now();
    
    const animate = () => {
      const now = Date.now();
      
      // Cloud 1 - 8 second ping-pong, moves back and forth smoothly
      const elapsed1 = (now - startTime1) % 8000;
      const progress1 = pingPong(elapsed1 / 8000);
      setCloud1X((canvasWidth * 0.1) + (progress1 * canvasWidth * 0.4));
      
      // Cloud 2 - 10 second ping-pong, moves back and forth smoothly
      const elapsed2 = (now - startTime2) % 10000;
      const progress2 = pingPong(elapsed2 / 10000);
      setCloud2X((canvasWidth * 0.3) + (progress2 * canvasWidth * 0.4));
      
      // Cloud 3 - 12 second ping-pong, moves back and forth smoothly
      const elapsed3 = (now - startTime3) % 12000;
      const progress3 = pingPong(elapsed3 / 12000);
      setCloud3X((canvasWidth * 0.6) + (progress3 * canvasWidth * 0.3));
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [canvasWidth]);

  // Helper function to create a cloud shape using multiple circles
  const CloudShape = ({ x, y, size = 60 }: { x: number; y: number; size?: number }) => {
    const opacity = 0.35;
    const cloudColor = 'rgba(255, 255, 255, 0.5)';
    
    return (
      <Group>
        <Blur blur={25} />
        {/* Main center circles - bigger */}
        <Circle cx={x} cy={y} r={size * 0.8} color={cloudColor} opacity={opacity} />
        <Circle cx={x + size * 0.5} cy={y} r={size * 0.7} color={cloudColor} opacity={opacity} />
        <Circle cx={x - size * 0.5} cy={y} r={size * 0.7} color={cloudColor} opacity={opacity} />
        {/* Top circles */}
        <Circle cx={x + size * 0.3} cy={y - size * 0.4} r={size * 0.6} color={cloudColor} opacity={opacity} />
        <Circle cx={x - size * 0.3} cy={y - size * 0.4} r={size * 0.6} color={cloudColor} opacity={opacity} />
        {/* Side extension circles for more organic shape */}
        <Circle cx={x + size * 0.7} cy={y + size * 0.2} r={size * 0.5} color={cloudColor} opacity={opacity} />
        <Circle cx={x - size * 0.7} cy={y + size * 0.2} r={size * 0.5} color={cloudColor} opacity={opacity} />
      </Group>
    );
  };

  return (
    <View
      testID="animated-background-container"
      style={styles.container}
      onLayout={handleLayout}
    >
      {canvasWidth > 0 && canvasHeight > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          {/* Background gradient */}
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, canvasHeight)}
              colors={gradientColors}
            />
          </Rect>
          
          {/* Animated cloud shapes (only in upper portion) - bigger sizes */}
          <CloudShape x={cloud1X} y={cloud1Y} size={140} />
          <CloudShape x={cloud2X} y={cloud2Y} size={160} />
          <CloudShape x={cloud3X} y={cloud3Y} size={120} />
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

