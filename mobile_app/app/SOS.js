import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SOSScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
      </TouchableOpacity>

      <View style={styles.alertCircle}>
        <MaterialCommunityIcons name="shield-alert" size={80} color="#EF4444" />
      </View>

      <Text style={styles.title}>Emergency Assistance</Text>
      <Text style={styles.sub}>Press the button below to alert emergency services and share your live location.</Text>

      <TouchableOpacity style={styles.sosButton} activeOpacity={0.7}>
        <Text style={styles.sosText}>SEND SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 30 },
  back: { position: 'absolute', top: 50, left: 20 },
  alertCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  title: { color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 10 },
  sub: { color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  sosButton: { width: '100%', height: 70, backgroundColor: '#EF4444', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  sosText: { color: 'white', fontSize: 20, fontWeight: '900' }
});