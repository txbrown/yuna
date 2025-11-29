import { Palette } from '@/constants/Colors';
import { BlurMask, Canvas, Circle, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const AmbientBackground = () => {
  // Position animations (0 to 1)
  const t1 = useSharedValue(0);
  const t2 = useSharedValue(0);
  const t3 = useSharedValue(0);

  // Radius/scale animations
  const r1 = useSharedValue(1);
  const r2 = useSharedValue(1);
  const r3 = useSharedValue(1);

  useEffect(() => {
    // Start animations immediately
    t1.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    t2.value = withRepeat(
      withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    t3.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    r1.value = withRepeat(
      withTiming(1.4, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    r2.value = withRepeat(
      withTiming(1.5, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    r3.value = withRepeat(
      withTiming(1.3, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [t1, t2, t3, r1, r2, r3]);

  // Orb 1 - Peach: Moves diagonally
  const cx1 = useDerivedValue(() => width * 0.15 + width * 0.5 * t1.value);
  const cy1 = useDerivedValue(() => height * 0.2 + height * 0.4 * t2.value);
  const radius1 = useDerivedValue(() => width * 0.4 * r1.value);

  // Orb 2 - Orange: Moves in opposite direction
  const cx2 = useDerivedValue(() => width * 0.85 - width * 0.5 * t2.value);
  const cy2 = useDerivedValue(() => height * 0.7 - height * 0.4 * t1.value);
  const radius2 = useDerivedValue(() => width * 0.5 * r2.value);

  // Orb 3 - Yellow: Circular motion
  const cx3 = useDerivedValue(() => {
    const angle = t3.value * Math.PI * 2;
    return width * 0.5 + width * 0.3 * Math.cos(angle);
  });
  const cy3 = useDerivedValue(() => {
    const angle = t3.value * Math.PI * 2;
    return height * 0.5 + height * 0.3 * Math.sin(angle);
  });
  const radius3 = useDerivedValue(() => width * 0.35 * r3.value);

  // Gradient centers
  const center1 = useDerivedValue(() => vec(cx1.value, cy1.value));
  const center2 = useDerivedValue(() => vec(cx2.value, cy2.value));
  const center3 = useDerivedValue(() => vec(cx3.value, cy3.value));

  return (
    <View style={styles.container} pointerEvents='none'>
      <Canvas style={{ flex: 1 }}>
        {/* Base Background - simpler, no gradient for now */}
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={Math.max(width, height)}
          color={Palette.cream}
        />

        {/* Fluid Orb 1 - Peach */}
        <Circle
          cx={cx1}
          cy={cy1}
          r={radius1}
          opacity={0.7}
          color={Palette.accentPeach}
        >
          <BlurMask blur={60} style='normal' />
        </Circle>

        {/* Fluid Orb 2 - Orange */}
        <Circle
          cx={cx2}
          cy={cy2}
          r={radius2}
          opacity={0.6}
          color={Palette.accentOrange}
        >
          <BlurMask blur={80} style='normal' />
        </Circle>

        {/* Fluid Orb 3 - Yellow */}
        <Circle
          cx={cx3}
          cy={cy3}
          r={radius3}
          opacity={0.5}
          color={Palette.softYellow}
        >
          <BlurMask blur={50} style='normal' />
        </Circle>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    backgroundColor: Palette.cream,
  },
});
