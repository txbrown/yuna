import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { NotesProvider } from '@/features/notes/providers/NotesProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
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
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
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
              title: 'Home',
              headerRight: () => <SettingsButton />,
            }}
          />
          <Stack.Screen name='settings' options={{ title: 'Settings' }} />
          <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
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
      style={{ marginRight: 15 }}
    >
      {({ pressed }) => (
        <FontAwesome
          name='cog'
          size={25}
          color={Colors[colorScheme ?? 'light'].text}
          style={{ opacity: pressed ? 0.5 : 1 }}
        />
      )}
    </Pressable>
  );
}
