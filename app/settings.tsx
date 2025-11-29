import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Settings</ThemedText>

        <ThemedView
          style={styles.section}
          lightColor='#f5f5f5'
          darkColor='rgba(255,255,255,0.05)'
        >
          <ThemedText style={styles.sectionTitle}>Debug Tools</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Access debugging screens for development and testing
          </ThemedText>

          <Link href='/debug/notes' asChild>
            <TouchableOpacity style={styles.debugButton}>
              <FontAwesome name='sticky-note' size={20} color='#fff' />
              <Text style={styles.debugButtonText}>Notes Debug</Text>
            </TouchableOpacity>
          </Link>

          <Link href='/debug/personas' asChild>
            <TouchableOpacity
              style={[styles.debugButton, styles.personasButton]}
            >
              <FontAwesome name='user' size={20} />
              <Text style={styles.debugButtonText}>Personas Debug</Text>
            </TouchableOpacity>
          </Link>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  debugButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  personasButton: {
    backgroundColor: '#9c27b0',
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
