import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FAV_DATA = [
  { id: '1', name: 'Mall of India', type: 'Shopping' },
  { id: '2', name: 'Gym Fitness First', type: 'Health' },
  { id: '3', name: 'Green Park', type: 'Leisure' },
  { id: '4', name: 'Central Library', type: 'Education' },
];

export default function FavoritesList() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <FlatList
        data={FAV_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemType}>{item.type}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 60, marginBottom: 30 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginLeft: 20 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 20, borderRadius: 20, marginBottom: 15 },
  itemTextContainer: { flex: 1, marginLeft: 15 },
  itemName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  itemType: { color: '#64748B', fontSize: 12 }
});