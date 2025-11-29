import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import 'react-native-reanimated';

import { AppSplashScreen } from '@/components/AppSplashScreen';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { NotesProvider } from '@/features/notes/providers/NotesProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Italic': require('../assets/fonts/SpaceMono-Italic.ttf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
    'SpaceMono-BoldItalic': require('../assets/fonts/SpaceMono-BoldItalic.ttf'),
    ...FontAwesome.font,
  });
  const [isSplashReady, setSplashReady] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Hide the native splash screen immediately
      SplashScreen.hideAsync();
      // Keep our custom splash screen for a moment
      const timer = setTimeout(() => {
        setSplashReady(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded || !isSplashReady) {
    return <AppSplashScreen />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <NotesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name='index'
            options={{
              title: '',
              headerTransparent: true,
              headerRight: () => <SettingsButton />,
            }}
          />
          <Stack.Screen
            name='editor/index'
            options={{
              title: 'Editor',
              headerShown: false,
            }}
          />
          <Stack.Screen name='settings' options={{ title: 'Settings' }} />
          <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
          <Stack.Screen name='debug/index' options={{ title: 'Debug Menu' }} />
          <Stack.Screen name='debug/notes' options={{ title: 'Notes Debug' }} />
          <Stack.Screen
            name='debug/personas'
            options={{ title: 'Personas Debug' }}
          />
        </Stack>
      </ThemeProvider>
    </NotesProvider>
  );
}

function SettingsButton() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/settings' as any)}
      style={({ pressed }) => ({
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
      })}
    >
      <FontAwesome
        name='cog'
        size={24}
        color={Colors[colorScheme ?? 'light'].text}
      />
    </Pressable>
  );
}
