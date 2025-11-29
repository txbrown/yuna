import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Tab One</ThemedText>
      <ThemedView
        style={styles.separator}
        lightColor='#eee'
        darkColor='rgba(255,255,255,0.1)'
      />

      <Link href='/debug/notes' asChild>
        <TouchableOpacity style={styles.debugButton}>
          <Text style={styles.debugButtonText}>Open Notes Debug Screen</Text>
        </TouchableOpacity>
      </Link>

      <Link href='/debug/personas' asChild>
        <TouchableOpacity style={[styles.debugButton, styles.personasButton]}>
          <Text style={styles.debugButtonText}>Open Personas Debug Screen</Text>
        </TouchableOpacity>
      </Link>

      <EditScreenInfo path='app/(tabs)/index.tsx' />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  debugButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personasButton: {
    backgroundColor: '#9c27b0',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
