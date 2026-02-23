import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error ❌", "Enter phone and password");
      return;
    }

    try {
      setLoading(true);

      const API_URL = "http://192.168.1.34:5002/api/auth/login";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Save token
        await AsyncStorage.setItem("token", data.token);

        // ✅ Navigate to Tabs
        router.replace("/(tabs)");
      } else {
        Alert.alert("Failed ❌", data.message);
      }
    } catch (error) {
      Alert.alert("Server Error ⚠️", "Backend not reachable!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#050B1A", "#000"]} style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Phone */}
      <View style={styles.inputBox}>
        <Ionicons name="call-outline" size={20} color="#0066ff" />
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#555"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Password */}
      <View style={styles.inputBox}>
        <Ionicons name="lock-closed-outline" size={20} color="#0066ff" />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#555"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={{ color: "#1E88FF", marginTop: 20 }}>
          New user? Register
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#1E88FF",
    marginBottom: 40,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "85%",
    padding: 10,
    borderRadius: 14,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },

  button: {
    backgroundColor: "#0066ff",
    paddingVertical: 18,
    width: "85%",
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});