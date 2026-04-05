import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ScheduleScreen() {
  const router = useRouter();
  const schedules = [
    { id: '1', route: 'Route 44', time: '08:30 AM', status: 'On Time' },
    { id: '2', route: 'Route 12', time: '09:15 AM', status: 'Delayed' },
    { id: '3', route: 'Express 1', time: '10:00 AM', status: 'On Time' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Transit Schedule</Text>
      </View>

      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.routeText}>{item.route}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <Text style={[styles.status, { color: item.status === 'On Time' ? '#10B981' : '#F59E0B' }]}>
              {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 20 },
  header: { marginTop: 60, flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '800', marginLeft: 20 },
  card: { backgroundColor: '#0F172A', padding: 20, borderRadius: 18, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeText: { color: 'white', fontSize: 18, fontWeight: '700' },
  timeText: { color: '#64748B', marginTop: 4 },
  status: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' }
});