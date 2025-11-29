import { router, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AmbientBackground } from '@/components/AmbientBackground';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true }} />
      <AmbientBackground />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to Yuna</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/editor')}
        >
          <Text style={styles.buttonText}>Open Editor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor is handled by AmbientBackground, but fallback is good
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
