import { Palette } from '@/constants/Colors';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AmbientBackground } from './AmbientBackground';

export const AppSplashScreen = ({ onFinish }: { onFinish?: () => void }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    // Optional: Automatically finish after some time if no parent controller does it
    // const timeout = setTimeout(() => {
    //   onFinish?.();
    // }, 3000);
    // return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <View style={styles.content}>
        <Animated.Text style={[styles.title, animatedStyle]}>
          yuna
        </Animated.Text>
        <Animated.Text
          style={[
            styles.subtitle,
            animatedStyle,
            { marginTop: 20, fontSize: 18, opacity: 0.6 },
          ]}
        >
          your thoughts, organized.
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.cream,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 64,
    // Use system serif font to avoid FOUT and match art direction
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    color: Palette.darkCharcoal,
    fontWeight: 'bold',
    letterSpacing: -2,
  },
  subtitle: {
    // Use system serif font
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    color: Palette.darkCharcoal,
    fontStyle: 'italic', // Add italic for a nicer touch
  },
});
