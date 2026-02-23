import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Auto refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        "http://192.168.1.34:5002/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Profile 👤</Text>

        {user && (
          <View style={styles.card}>
            <ProfileItem label="Full Name" value={user.fullName} />
            <ProfileItem label="Phone" value={user.phone} />
            <ProfileItem label="Email" value={user.email || "Not Provided"} />

            {/* ✅ Fixed Gender Display */}
            <ProfileItem
              label="Gender"
              value={user.gender ? user.gender : "Not Set"}
            />

            {/* ✅ Fixed DOB Display */}
            <ProfileItem
              label="Date of Birth"
              value={
                user.dob
                  ? new Date(user.dob).toDateString()
                  : "Not Set"
              }
            />

            <ProfileItem
              label="Role"
              value={user.role ? user.role.toUpperCase() : "PASSENGER"}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/edit-profile")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.extraBtn}
          onPress={() => router.push("/about")}
        >
          <Text style={styles.extraText}>About</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.extraBtn}
          onPress={() => router.push("/driver")}
        >
          <Text style={styles.extraText}>Driver Panel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.extraBtn}
          onPress={() => router.push("/conductor")}
        >
          <Text style={styles.extraText}>Conductor Panel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

function ProfileItem({ label, value }) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050B1A",
  },
  title: {
    fontSize: 28,
    color: "#1E88FF",
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#111C2F",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  item: {
    marginBottom: 15,
  },
  label: {
    color: "#888",
    fontSize: 12,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: "#1E88FF",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editBtn: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  extraBtn: {
    backgroundColor: "#34495e",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  extraText: {
    color: "#fff",
    fontWeight: "bold",
  },
});