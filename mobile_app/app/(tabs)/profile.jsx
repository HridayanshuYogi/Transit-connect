import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://10.0.2.2:5002/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      }
    } catch (error) {
      console.log("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1E88FF" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#050B1A", "#000"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER SECTION */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={["#1E88FF", "#0052D4"]} style={styles.avatarGradient}>
              <Text style={styles.avatarInitial}>
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraIcon} onPress={() => router.push("/edit-profile")}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.fullName || "User Name"}</Text>
          <Text style={styles.userRole}>{user?.role?.toUpperCase() || "PASSENGER"}</Text>
        </View>

        {/* INFO CARD */}
        <View style={styles.glassCard}>
          <ProfileItem 
            icon="call-outline" 
            label="Phone Number" 
            value={user?.phone} 
          />
          <ProfileItem 
            icon="mail-outline" 
            label="Email Address" 
            value={user?.email || "Not Provided"} 
          />
          <ProfileItem 
            icon="calendar-outline" 
            label="Birth Date" 
            value={user?.dob ? new Date(user.dob).toDateString() : "Not Set"} 
          />
          <ProfileItem 
            icon="person-outline" 
            label="Gender" 
            value={user?.gender || "Not Set"} 
            isLast 
          />
        </View>

        {/* ACTIONS SECTION */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push("/edit-profile")}>
          <View style={[styles.actionIcon, { backgroundColor: "#2ecc7120" }]}>
            <Ionicons name="create-outline" size={22} color="#2ecc71" />
          </View>
          <Text style={styles.actionText}>Edit Profile Details</Text>
          <Ionicons name="chevron-forward" size={20} color="#556789" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={() => router.push("/about")}>
          <View style={[styles.actionIcon, { backgroundColor: "#1E88FF20" }]}>
            <Ionicons name="information-circle-outline" size={22} color="#1E88FF" />
          </View>
          <Text style={styles.actionText}>About SmartBus</Text>
          <Ionicons name="chevron-forward" size={20} color="#556789" />
        </TouchableOpacity>

        {/* MANAGEMENT SECTION (Panels) - Driver Panel Removed */}
        <Text style={styles.sectionTitle}>Management Panels</Text>
        <View style={styles.panelGrid}>
          <PanelButton 
            title="Admin" 
            icon="shield-checkmark" 
            color="#9b59b6" 
            onPress={() => router.push("/admin_Dashboard")} 
          />
          <PanelButton 
            title="Conductor" 
            icon="ticket" 
            color="#e67e22" 
            onPress={() => router.push("/conductor")} 
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Logout Session</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

// Sub-component for Profile Rows
function ProfileItem({ icon, label, value, isLast }) {
  return (
    <View style={[styles.itemRow, !isLast && styles.itemBorder]}>
      <View style={styles.itemIconContainer}>
        <Ionicons name={icon} size={20} color="#1E88FF" />
      </View>
      <View>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value}</Text>
      </View>
    </View>
  );
}

// Sub-component for the Grid Buttons
function PanelButton({ title, icon, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.panelCard, { borderColor: color + "40" }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.panelTitle, { color: color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#050B1A" },
  scrollContent: { paddingBottom: 40 },
  
  profileHeader: { alignItems: "center", marginTop: 60, marginBottom: 30 },
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatarGradient: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#111C2F" },
  avatarInitial: { fontSize: 40, color: "#fff", fontWeight: "bold" },
  cameraIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#1E88FF", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#050B1A" },
  userName: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  userRole: { color: "#556789", fontSize: 13, fontWeight: "bold", marginTop: 4, letterSpacing: 1 },

  glassCard: { backgroundColor: "#111C2F", marginHorizontal: 20, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  itemIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(30,136,255,0.1)", justifyContent: "center", alignItems: "center", marginRight: 15 },
  itemLabel: { color: "#556789", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  itemValue: { color: "#fff", fontSize: 15, fontWeight: "600", marginTop: 2 },

  sectionTitle: { color: "#556789", fontSize: 14, fontWeight: "bold", marginHorizontal: 25, marginTop: 30, marginBottom: 15, textTransform: "uppercase" },
  
  actionRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#111C2F", marginHorizontal: 20, padding: 15, borderRadius: 15, marginBottom: 10 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 15 },
  actionText: { color: "#fff", flex: 1, fontSize: 15, fontWeight: "600" },

  panelGrid: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, gap: 10 },
  panelCard: { flex: 1, backgroundColor: "#111C2F", padding: 15, borderRadius: 15, alignItems: "center", borderWidth: 1 },
  panelTitle: { fontSize: 12, fontWeight: "bold", marginTop: 8 },

  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 40, gap: 10 },
  logoutText: { color: "#FF5252", fontSize: 15, fontWeight: "bold" },
});