// Mock @shopify/react-native-skia
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: 'Canvas',
  Group: 'Group',
  Path: 'Path',
  Skia: {
    Path: {
      Make: jest.fn(),
    },
  },
  useFont: jest.fn(),
  matchFont: jest.fn(),
  RoundedRect: 'RoundedRect',
  LinearGradient: 'LinearGradient',
  BlurMask: 'BlurMask',
  vec: jest.fn(),
}));

// Mock react-native-reanimated with a simple implementation
jest.mock('react-native-reanimated', () => {
  const { View, Text, Image, ScrollView } = require('react-native');
  
  return {
    default: {
      call: () => {},
      createAnimatedComponent: (comp) => comp,
      View,
      Text,
      Image,
      ScrollView,
    },
    View,
    Text,
    Image,
    ScrollView,
    useAnimatedStyle: () => ({}),
    useSharedValue: (init) => ({ value: init }),
    useDerivedValue: (fn) => ({ value: fn() }),
    withTiming: (value) => value,
    withSpring: (value) => value,
    withDelay: (delay, animation) => animation,
    withSequence: (...animations) => animations[animations.length - 1],
    withRepeat: (animation) => animation,
    interpolate: (value) => value,
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Easing: {
      linear: (t) => t,
      ease: (t) => t,
      in: () => (t) => t,
      out: () => (t) => t,
      inOut: () => (t) => t,
    },
    FadeIn: { duration: () => ({ build: () => ({}) }) },
    FadeOut: { duration: () => ({ build: () => ({}) }) },
    SlideInRight: { duration: () => ({ build: () => ({}) }) },
    SlideOutRight: { duration: () => ({ build: () => ({}) }) },
    Layout: { springify: () => ({}) },
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
  };
});

