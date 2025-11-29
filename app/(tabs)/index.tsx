import { StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Link href="/debug/notes" asChild>
        <TouchableOpacity style={styles.debugButton}>
          <Text style={styles.debugButtonText}>Open Notes Debug Screen</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/debug/personas" asChild>
        <TouchableOpacity style={[styles.debugButton, styles.personasButton]}>
          <Text style={styles.debugButtonText}>Open Personas Debug Screen</Text>
        </TouchableOpacity>
      </Link>

      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
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
  },
  personasButton: {
    backgroundColor: '#9c27b0',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
