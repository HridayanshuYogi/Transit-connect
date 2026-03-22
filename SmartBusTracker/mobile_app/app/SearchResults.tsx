import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SearchResults() {
  const { q } = useLocalSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  const dummyResults = [
    { id: '1', busNo: 'A-44', from: 'Sector 21', to: q || 'Destination', time: '10 mins', price: '₹45', type: 'AC Deluxe', seats: '12 Left', color: '#3B82F6' },
    { id: '2', busNo: 'E-12', from: 'Cyber Hub', to: q || 'Destination', time: '14 mins', price: '₹30', type: 'Electric', seats: '4 Left', color: '#10B981' },
    { id: '3', busNo: 'X-99', from: 'Railway Stn', to: q || 'Destination', time: '22 mins', price: '₹120', type: 'Express', seats: 'Filling Fast', color: '#F59E0B' },
  ];

  const filters = ['All', 'Fastest', 'Cheapest', 'AC Only'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#080C14", "#000000"]} style={StyleSheet.absoluteFill} />

      {/* --- HEADER SECTION --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchSummary}>
          <Text style={styles.summaryLabel}>Arriving at</Text>
          <Text style={styles.summaryValue}>{q || "Current Location"}</Text>
        </View>
        <TouchableOpacity style={styles.mapToggle}>
          <Feather name="map" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* --- FILTER CHIPS --- */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {filters.map((item) => (
            <TouchableOpacity 
              key={item} 
              onPress={() => setFilter(item)}
              style={[styles.chip, filter === item && styles.activeChip]}
            >
              <Text style={[styles.chipText, filter === item && styles.activeChipText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- RESULTS LIST --- */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>{dummyResults.length} buses found for your route</Text>
        
        {dummyResults.map((bus) => (
          <TouchableOpacity 
            key={bus.id} 
            style={styles.cardWrapper} 
            onPress={() => router.push(`/BusDetail/${bus.id}`)}
          >
            <LinearGradient colors={["rgba(30, 41, 59, 0.4)", "rgba(15, 23, 42, 0.6)"]} style={styles.busCard}>
              <View style={styles.cardTop}>
                <View style={[styles.busBadge, { backgroundColor: bus.color + '20' }]}>
                  <Text style={[styles.busBadgeText, { color: bus.color }]}>{bus.busNo}</Text>
                </View>
                <View style={styles.typeRow}>
                  <MaterialCommunityIcons name={bus.type === 'Electric' ? 'flash' : 'snowflake'} size={14} color="#94A3B8" />
                  <Text style={styles.typeText}>{bus.type}</Text>
                </View>
                <Text style={styles.priceText}>{bus.price}</Text>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routeDots}>
                  <View style={styles.dot} />
                  <View style={styles.line} />
                  <Ionicons name="location" size={16} color="#3B82F6" />
                </View>
                <View style={styles.routeInfo}>
                  <Text style={styles.stationText}>{bus.from}</Text>
                  <Text style={styles.stationText}>{bus.to}</Text>
                </View>
                <View style={styles.etaInfo}>
                  <Text style={styles.etaTime}>{bus.time}</Text>
                  <Text style={styles.etaLabel}>Away</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.seatInfo}>
                  <Ionicons name="people-outline" size={16} color="#64748B" />
                  <Text style={[styles.seatText, bus.seats === '4 Left' && { color: '#EF4444' }]}>{bus.seats}</Text>
                </View>
                <TouchableOpacity style={styles.bookBtn}>
                  <Text style={styles.bookBtnText}>Track</Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  backButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  searchSummary: { flex: 1, marginLeft: 15 },
  summaryLabel: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  summaryValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  mapToggle: { width: 45, height: 45, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', justifyContent: 'center', alignItems: 'center' },
  
  filterScroll: { marginBottom: 20 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeChip: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  chipText: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
  activeChipText: { color: '#fff' },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  resultsCount: { color: '#64748B', fontSize: 14, marginBottom: 20, fontWeight: '600' },
  cardWrapper: { marginBottom: 16 },
  busCard: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  busBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  busBadgeText: { fontWeight: '900', fontSize: 12 },
  typeRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, flex: 1 },
  typeText: { color: '#94A3B8', fontSize: 12, marginLeft: 4, fontWeight: '600' },
  priceText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  routeContainer: { flexDirection: 'row', marginBottom: 20 },
  routeDots: { alignItems: 'center', width: 20, justifyContent: 'space-between', paddingVertical: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#64748B' },
  line: { width: 1, flex: 1, backgroundColor: 'rgba(100, 116, 139, 0.3)', marginVertical: 4 },
  routeInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  stationText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  etaInfo: { alignItems: 'flex-end', justifyContent: 'center' },
  etaTime: { color: '#3B82F6', fontSize: 20, fontWeight: '900' },
  etaLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  seatInfo: { flexDirection: 'row', alignItems: 'center' },
  seatText: { color: '#64748B', fontSize: 12, marginLeft: 6, fontWeight: '700' },
  bookBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  bookBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, marginRight: 5 }
});