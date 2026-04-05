import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeDetails() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.iconContainer}>
        <Ionicons name="home" size={60} color="#3B82F6" />
      </View>
      
      <Text style={styles.title}>Heading Home</Text>
      <Text style={styles.subtitle}>Sector 44, Gurgaon</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Next bus in: <Text style={styles.highlight}>8 mins</Text></Text>
        <Text style={styles.infoText}>Traffic: <Text style={styles.lowTraffic}>Moderate</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 16, marginTop: 5 },
  infoCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, width: '100%', marginTop: 30 },
  infoText: { color: '#fff', fontSize: 16, marginVertical: 5 },
  highlight: { color: '#3B82F6', fontWeight: 'bold' },
  lowTraffic: { color: '#F59E0B', fontWeight: 'bold' }
});