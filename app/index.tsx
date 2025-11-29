import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AmbientBackground } from '@/components/AmbientBackground';
import { Text as ThemedText } from '@/components/Themed';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AmbientBackground />

      <View style={styles.contentContainer}>
        <ThemedText style={styles.title}>Welcome to Yuna</ThemedText>
        <View
          style={styles.separator}
          lightColor='#eee'
          darkColor='rgba(255,255,255,0.1)'
        />
        <ThemedText style={styles.subtitle}>Your personal AI assistant</ThemedText>
        
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  button: {
    marginTop: 40,
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
