import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HistoryScreen() {
  const router = useRouter();

  const transactions = [
    { id: 1, type: 'Ride', desc: 'Cyber City to Sector 44', cost: '₹30', date: 'Yesterday' },
    { id: 2, type: 'Wallet', desc: 'Added Money', cost: '+₹500', date: '20 Mar' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="close" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Activity History</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {transactions.map(item => (
          <View key={item.id} style={styles.item}>
            <View style={styles.iconBox}>
               <MaterialIcons name={item.type === 'Ride' ? 'directions-bus' : 'account-balance-wallet'} size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.desc}>{item.desc}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={[styles.cost, { color: item.cost.includes('+') ? '#10B981' : 'white' }]}>{item.cost}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { marginTop: 60, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#1E293B', pb: 15 },
  iconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  desc: { color: 'white', fontSize: 16, fontWeight: '600' },
  date: { color: '#64748B', fontSize: 12, marginTop: 2 },
  cost: { fontSize: 16, fontWeight: '800' }
});