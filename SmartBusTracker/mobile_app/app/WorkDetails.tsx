import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WorkDetails() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
        <Ionicons name="briefcase" size={60} color="#8B5CF6" />
      </View>
      
      <Text style={styles.title}>Office Commute</Text>
      <Text style={styles.subtitle}>DLF Cyber City</Text>
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>View Live Shuttle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  iconContainer: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 16 },
  button: { backgroundColor: '#8B5CF6', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, marginTop: 40 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});