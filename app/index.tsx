import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AmbientBackground } from '@/components/AmbientBackground';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true }} />
      <AmbientBackground />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to Yuna</Text>
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
});
