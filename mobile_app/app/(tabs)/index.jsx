import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function EliteHomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const userName = "Sumit";

  // Navigation handler for search
  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      router.push({
        pathname: "/SearchResults",
        params: { q: searchQuery }
      });
    }
  };

  const upcomingBuses = [
    { id: 1, from: "Sohna", to: "Gurgaon", time: "12m", type: "AC Deluxe", icon: "snowflake", price: "45", seat: "12 Left" },
    { id: 2, from: "Sector 54", to: "Cyber Hub", time: "5m", type: "Electric", icon: "flash", price: "30", seat: "4 Left" },
    { id: 3, from: "Old City", to: "Airport", time: "45m", type: "Express", icon: "bus", price: "120", seat: "Filling Fast" },
  ];

  const savedPlaces = [
    { id: 1, label: "Home", sub: "Sec 44", icon: "home-outline", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", route: "/HomeDetails" },
    { id: 2, label: "Work", sub: "Cyber City", icon: "briefcase-outline", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)", route: "/WorkDetails" },
    { id: 3, label: "Favorites", sub: "12 Saved", icon: "star-outline", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", route: "/FavoritesList" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#080C14", "#020408", "#000000"]} style={StyleSheet.absoluteFill} />

      {/* --- FIXED TOP SECTION --- */}
      <View style={styles.fixedTopContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>Monday, 22nd March</Text>
            <View style={styles.nameRow}>
              <Text style={styles.greetingText}>Hello, {userName}</Text>
              <View style={styles.premiumBadge}>
                <MaterialCommunityIcons name="crown" size={14} color="#F59E0B" />
                <Text style={styles.premiumText}>GOLD</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBell}>
            <Feather name="bell" size={22} color="#fff" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR - ICON ON RIGHT SIDE */}
        <View style={styles.searchContainer}>
          <LinearGradient colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]} style={styles.searchInner}>
            <TextInput
              placeholder="Search destination..."
              placeholderTextColor="#475569"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchIconBtn}>
              <Feather name="search" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      {/* --- SCROLLABLE CONTENT --- */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SAVED PLACES */}
        <Text style={styles.sectionTitle}>Saved Places</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedScroll}>
          {savedPlaces.map((place) => (
            <TouchableOpacity 
              key={place.id} 
              style={styles.placeCard}
              onPress={() => router.push(place.route)} 
              activeOpacity={0.7}
            >
              <View style={[styles.placeIconBtn, { backgroundColor: place.bg }]}>
                <Ionicons name={place.icon} size={24} color={place.color} />
              </View>
              <Text style={styles.placeLabel}>{place.label}</Text>
              <Text style={styles.placeSub}>{place.sub}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DYNAMIC ADVISORY */}
        <View style={styles.advisoryContainer}>
          <LinearGradient colors={["#1E293B", "#0F172A"]} style={styles.advisoryCard}>
            <View style={styles.advisoryIcon}>
              <Ionicons name="cloud-outline" size={22} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.advisoryTitle}>Light Rain Expected</Text>
              <Text style={styles.advisorySub}>Expect 5-10 min delays on Route 44.</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ACTION HUB */}
        <View style={styles.actionHub}>
          <QuickAction icon="calendar" label="Schedule" color="#F59E0B" route="/Schedule" />
          <QuickAction icon="map" label="Live Map" color="#10B981" route="/LiveMap" />
          <QuickAction icon="shield" label="SOS" color="#EF4444" route="/SOS" />
          <QuickAction icon="layers" label="History" color="#8B5CF6" route="/History" />
        </View>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <StatCard icon="leaf" label="CO2 Saved" value="12kg" color="#10B981" type="material" />
          <StatCard icon="zap" label="Points" value="2,450" color="#F59E0B" type="feather" />
          <StatCard icon="credit-card" label="Wallet" value="₹840" color="#3B82F6" type="feather" />
        </View>

        {/* CURRENT TRIP */}
        <Text style={styles.sectionTitle}>Current Trip</Text>
        <TouchableOpacity style={styles.liveActivityCard}>
          <View style={styles.liveHeader}>
            <View style={styles.liveBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveBadgeText}>ONGOING</Text>
            </View>
            <Text style={styles.liveTime}>Arrival: 10:45 AM</Text>
          </View>
          <Text style={styles.liveRoute}>Cyber City → Sector 44</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '65%' }]} />
          </View>
        </TouchableOpacity>

        {/* TRANSIT LIST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Transit</Text>
          <TouchableOpacity><Text style={styles.viewAll}>See All</Text></TouchableOpacity>
        </View>

        {upcomingBuses.map((bus) => (
          <TouchableOpacity key={bus.id} style={styles.busCardWrapper} onPress={() => router.push(`/BusDetail/${bus.id}`)}>
            <LinearGradient colors={["rgba(30, 41, 59, 0.5)", "rgba(15, 23, 42, 0.2)"]} style={styles.busCard}>
              <View style={styles.busCardTop}>
                <View>
                  <Text style={styles.destText}>{bus.to}</Text>
                  <Text style={styles.origText}>From {bus.from}</Text>
                </View>
                <View style={styles.etaContainer}>
                  <Text style={styles.etaText}>{bus.time}</Text>
                  <Text style={styles.etaLabel}>Arriving</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* SCAN BUTTON */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => router.push("/Scanner")}>
          <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.fabGradient}>
            <MaterialCommunityIcons name="qrcode-scan" size={26} color="#fff" />
            <Text style={styles.fabText}>Scan to Board</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Sub-components
const StatCard = ({ icon, label, value, color, type }) => (
  <View style={styles.statCard}>
    {type === 'material' ? <MaterialCommunityIcons name={icon} size={18} color={color} /> : <Feather name={icon} size={18} color={color} />}
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({ icon, label, color, route }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => router.push(route)}>
      <View style={styles.actionCircle}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fixedTopContainer: { paddingTop: 60, paddingHorizontal: 20, zIndex: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dateText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  greetingText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  premiumBadge: { flexDirection: 'row', backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 10 },
  premiumText: { color: '#F59E0B', fontSize: 10, fontWeight: '900' },
  notificationBell: { width: 50, height: 50, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: 15, right: 15, width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  searchContainer: { marginBottom: 25 },
  searchInner: { 
    height: 60, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    justifyContent: 'space-between' 
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  searchIconBtn: { paddingLeft: 10 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 15 },
  savedScroll: { flexDirection: 'row', marginBottom: 30 },
  placeCard: { width: 110, backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  placeIconBtn: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  placeLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  placeSub: { color: '#475569', fontSize: 11 },
  advisoryContainer: { marginBottom: 25 },
  advisoryCard: { flexDirection: 'row', padding: 16, borderRadius: 22, alignItems: 'center' },
  advisoryIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  advisoryTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  advisorySub: { color: '#94A3B8', fontSize: 12 },
  actionHub: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionCircle: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { width: (width - 60) / 3, backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 15, borderRadius: 20, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 5 },
  statLabel: { color: '#64748B', fontSize: 10 },
  liveActivityCard: { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: 25, padding: 20, marginBottom: 35 },
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  liveBadgeText: { color: '#10B981', fontSize: 9, fontWeight: '900' },
  liveTime: { color: '#94A3B8', fontSize: 12 },
  liveRoute: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 15 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#3B82F6', borderRadius: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  viewAll: { color: '#3B82F6', fontWeight: '800' },
  busCardWrapper: { marginBottom: 18 },
  busCard: { padding: 20, borderRadius: 28 },
  busCardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  destText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  origText: { color: '#64748B', fontSize: 13 },
  etaContainer: { alignItems: 'flex-end' },
  etaText: { color: '#3B82F6', fontSize: 22, fontWeight: '900' },
  etaLabel: { color: '#3B82F6', fontSize: 9, fontWeight: '900' },
  fabContainer: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  fab: { width: width * 0.85, height: 65, borderRadius: 22 },
  fabGradient: { flex: 1, borderRadius: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 18, fontWeight: '900', marginLeft: 12 }
});