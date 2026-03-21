import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

export default function EliteHomeScreen() {
  const router = useRouter();
  const mapRef = useRef(null);

  // --- STATES ---
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const userName = "Siddharth"; // Dynamic Name for Initials
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Mock Bus Data
  const [buses, setBuses] = useState([
    { id: "B1", number: "24B", lat: 28.4595, lng: 77.0266, load: "65%", status: "On Time", destination: "Gurgaon" },
    { id: "B2", number: "10A", lat: 28.4700, lng: 77.0300, load: "20%", status: "Delayed", destination: "Cyber Hub" },
  ]);

  const upcomingBuses = [
    { id: 1, from: "Sohna", to: "Gurgaon", time: "12 min", type: "AC Deluxe", icon: "snowflake" },
    { id: 2, from: "Sector 54", to: "Cyber Hub", time: "5 min", type: "Electric", icon: "flash" },
    { id: 3, from: "Old City", to: "Airport", time: "45 min", type: "Express", icon: "bus" },
  ];

  // --- LOGIC ---
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
      setLoadingLocation(false);
    })();

    // Live Bus Movement Simulation (Now smoother)
    const interval = setInterval(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setBuses(prev => prev.map(bus => ({
        ...bus,
        lat: bus.lat + (Math.random() - 0.5) * 0.0006,
        lng: bus.lng + (Math.random() - 0.5) * 0.0006,
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredBuses = useMemo(() => {
    return upcomingBuses.filter(b => 
      b.to.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.from.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleBusPress = (bus) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedBus(bus);
    mapRef.current?.animateToRegion({
      latitude: bus.lat,
      longitude: bus.lng,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 1200);
  };

  return (
    <LinearGradient colors={["#050B1A", "#000814"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* FIXED TOP NAV BAR */}
      <View style={styles.topNav}>
        <View style={styles.locationChip}>
          <Feather name="map-pin" size={14} color="#1E88FF" />
          <Text style={styles.locationChipText}>{loadingLocation ? 'Locating...' : 'NCR, India'}</Text>
        </View>
        
        {/* AVATAR REMOVED: Now a Sleek Gradient Circle with Initials */}
        <TouchableOpacity style={styles.initialsAvatar} onPress={() => router.push("/profile")}>
          <LinearGradient colors={["#38BDF8", "#1E88FF"]} style={styles.initialsGradient}>
            <Text style={styles.avatarInitialsText}>{userInitials}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* GREETING SECTION */}
        <View style={styles.greetingHeader}>
          <Text style={styles.greetingText}>Good Morning, {userName} 👋</Text>
          <Text style={styles.heroTitle}>Where are we<Text style={styles.heroHighlight}> going</Text>?</Text>
        </View>

        {/* INTERACTIVE MAP COMPONENT (Refined) */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={mapDarkStyle}
            initialRegion={{
              latitude: 28.4595, longitude: 77.0266,
              latitudeDelta: 0.05, longitudeDelta: 0.05,
            }}
          >
            {location && <Marker coordinate={location}><View style={styles.userMarker} /></Marker>}
            {buses.map(bus => (
              <Marker key={bus.id} coordinate={{ latitude: bus.lat, longitude: bus.lng }} onPress={() => handleBusPress(bus)}>
                <View style={[styles.busMarker, selectedBus?.id === bus.id && styles.selectedBusMarker]}>
                  <MaterialCommunityIcons name="bus" size={16} color="#fff" />
                </View>
              </Marker>
            ))}
          </MapView>
          
          <View style={styles.mapOverlayHeader}>
            <View style={styles.liveTag}>
              <View style={styles.pulse} />
              <Text style={styles.liveTagText}>FLEET RADAR</Text>
            </View>
            {selectedBus && (
               <TouchableOpacity onPress={() => setSelectedBus(null)} style={styles.clearMap}>
                 <Ionicons name="refresh" size={12} color="#fff" />
                 <Text style={styles.clearMapText}>Reset View</Text>
               </TouchableOpacity>
            )}
          </View>
        </View>

        {/* QUICK SERVICES - Now a Horizontal Pill List */}
        <Text style={[styles.sectionTitle, {marginLeft: 25}]}>Transit Hub</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubScroll}>
          <HubPill icon="search" label="Plan Trip" color="#38BDF8" />
          <HubPill icon="star" label="Favorites" color="#10B981" />
          <HubPill icon="bell" label="Alerts" color="#F59E0B" badge="2" onPress={() => setActiveModal("alerts")} />
          <HubPill icon="credit-card" label="Wallet" color="#A855F7" />
          <HubPill icon="settings" label="Settings" color="#94A3B8" />
        </ScrollView>

        {/* SEARCH & FILTER SECTION (Now static, simpler) */}
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#556789" />
            <TextInput 
              placeholder="Search destinations (e.g., Gurgaon)" 
              placeholderTextColor="#556789"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
        </View>

        {/* UPCOMING BUSES LIST (Glassmorphism Refinement) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Buses</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>View All</Text></TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
          {filteredBuses.map((bus) => (
            <TouchableOpacity key={bus.id} onPress={() => router.push(`/booking/${bus.id}`)}>
              <LinearGradient colors={["rgba(30, 41, 59, 0.4)", "rgba(15, 23, 42, 0.1)"]} style={styles.routeCard}>
                <View style={styles.routeTop}>
                  <Text style={styles.routeTime}>{bus.time}</Text>
                  <MaterialCommunityIcons name={bus.type === 'Electric' ? 'flash' : 'snowflake'} size={18} color="#1E88FF" />
                </View>
                <Text style={styles.routePathBold}>{bus.to}</Text>
                <Text style={styles.routePath}>From {bus.from}</Text>
                <View style={[styles.typeBadge, {backgroundColor: bus.type === 'Electric' ? 'rgba(16,185,129,0.1)' : 'rgba(30,136,255,0.1)'}]}>
                  <Text style={[styles.typeText, {color: bus.type === 'Electric' ? '#10B981' : '#1E88FF'}]}>{bus.type.toUpperCase()}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* ALERTS MODAL */}
      <Modal visible={activeModal === "alerts"} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setActiveModal(null)} activeOpacity={1}>
            <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>Operational Notifications</Text>
                <AlertItem type="delay" msg="Route 24B (Gurgaon) delayed by 5m due to congestion at IFFCO Chowk." time="1m ago" />
                <AlertItem type="info" msg="New Electric Buses added to Sector 54 route." time="2h ago" />
                <TouchableOpacity style={styles.closeAlert} onPress={() => setActiveModal(null)}>
                    <Text style={styles.closeAlertText}>Dismiss</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

    </LinearGradient>
  );
}

// --- INTERNAL COMPONENTS (Substantially redesigned) ---

function HubPill({ icon, label, color, badge, onPress }) {
  return (
    <TouchableOpacity style={styles.hubPill} onPress={onPress}>
      <Feather name={icon} size={20} color={color} />
      <Text style={styles.hubText}>{label}</Text>
      {badge && <View style={styles.hubBadge}><Text style={styles.hubBadgeText}>{badge}</Text></View>}
    </TouchableOpacity>
  );
}

const AlertItem = ({ type, msg, time }) => {
    const isDelay = type === 'delay';
    return (
        <View style={[styles.alertItem, {borderColor: isDelay ? '#EF4444' : '#1E88FF'}]}>
            <Ionicons name={isDelay ? "warning" : "information-circle"} size={22} color={isDelay ? "#FF4444" : "#1E88FF"} />
            <View style={{flex:1, marginLeft: 15}}>
                <Text style={styles.alertMsg}>{msg}</Text>
                <Text style={styles.alertTime}>{time}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 25, 
    paddingTop: 60,
    marginBottom: 15 
  },
  locationChip: { backgroundColor: '#111C2F', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, flexDirection: 'row', alignItems: 'center', borderSize: 1, borderColor: '#1E293B' },
  locationChipText: { color: '#CBD5E1', fontSize: 11, fontWeight: '700', marginLeft: 6 },
  
  // Advanced Initials Avatar
  initialsAvatar: { width: 44, height: 44, borderRadius: 14, overflow: 'hidden', elevation: 10, shadowColor: '#1E88FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  initialsGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarInitialsText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -1 },

  greetingHeader: { paddingHorizontal: 25, marginBottom: 25 },
  greetingText: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },
  heroTitle: { color: "#fff", fontSize: 32, fontWeight: "900", letterSpacing: -1, lineHeight: 36, marginTop: 4 },
  heroHighlight: { color: '#1E88FF' },

  mapContainer: { height: 260, marginHorizontal: 20, borderRadius: 30, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#1E293B' },
  map: { width: '100%', height: '100%' },
  mapOverlayHeader: { position: 'absolute', top: 15, left: 15, right: 15, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
  liveTag: { backgroundColor: 'rgba(5, 11, 26, 0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  liveTagText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  clearMap: { backgroundColor: '#1E88FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  clearMapText: { color: '#fff', fontSize: 10, fontWeight: '800', marginLeft: 4 },

  userMarker: { width: 18, height: 18, backgroundColor: '#1E88FF', borderRadius: 9, borderWidth: 3, borderColor: '#fff' },
  busMarker: { backgroundColor: '#1E293B', padding: 6, borderRadius: 10, borderWidth: 1, borderColor: '#1E88FF' },
  selectedBusMarker: { backgroundColor: '#1E88FF', transform: [{scale: 1.2}], shadowColor: '#fff', shadowOpacity: 0.5, shadowRadius: 10 },

  hubScroll: { paddingLeft: 20, marginBottom: 20 },
  hubPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, marginRight: 10, borderSize: 1, borderColor: 'rgba(255,255,255,0.05)' },
  hubText: { color: '#CBD5E1', fontSize: 13, fontWeight: '600', marginLeft: 10 },
  hubBadge: { backgroundColor: '#F59E0B', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  hubBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  searchBar: { marginHorizontal: 25, backgroundColor: '#111C2F', height: 55, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 30, borderWidth: 1, borderColor: '#1E293B' },
  searchInput: { flex: 1, marginLeft: 10, color: '#fff', fontWeight: '600', fontSize: 14 },

  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 15 },
  seeAllText: { color: '#1E88FF', fontWeight: 'bold', fontSize: 12 },

  routeCard: { width: 180, padding: 20, borderRadius: 28, marginRight: 15, borderSize: 1, borderColor: 'rgba(255,255,255,0.05)' },
  routeTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  routeTime: { color: '#1E88FF', fontSize: 24, fontWeight: '900' },
  routePathBold: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  routePath: { color: '#94A3B8', fontSize: 12, fontWeight: '500', marginBottom: 15 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  typeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  alertBox: { backgroundColor: '#111C2F', padding: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35, minHeight: '60%' },
  alertTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 25 },
  alertItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#050B1A', padding: 18, borderRadius: 20, borderWidth: 1 },
  alertMsg: { color: '#F1F5F9', fontSize: 14, fontWeight: '500', lineHeight: 20 },
  alertTime: { color: '#556789', fontSize: 11, marginTop: 4, fontWeight: '600' },
  closeAlert: { backgroundColor: '#1E88FF', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 15 },
  closeAlertText: { color: '#fff', fontWeight: '900', fontSize: 16 }
});

const mapDarkStyle = [/* Professional Dark Map Style Array (as before) */];