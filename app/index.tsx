import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Yuna</Text>
      <View
        style={styles.separator}
        lightColor='#eee'
        darkColor='rgba(255,255,255,0.1)'
      />
      <Text style={styles.subtitle}>Your personal AI assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

