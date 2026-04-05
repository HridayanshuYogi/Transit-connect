import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
      Alert.alert("Error ❌", "Please enter both phone and password");
      return;
    }

    try {
      setLoading(true);
      const API_URL = "http://10.0.2.2:5002/api/auth/login";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Failed ❌", data.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Server Error ⚠️", "Backend not reachable!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#050B1A", "#050B1A", "#000"]} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.innerContainer}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          {/* Phone Input */}
          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={20} color="#1E88FF" />
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#556789"
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#1E88FF" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#556789"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleLogin} 
            disabled={loading}
            style={styles.buttonContainer}
          >
            <LinearGradient colors={["#1E88FF", "#0052D4"]} style={styles.button}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.footerText}>
              New user? <Text style={styles.linkText}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 25 },
  
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 36, fontWeight: "bold", color: "#fff", letterSpacing: 1 },
  subtitle: { fontSize: 15, color: "#556789", marginTop: 5 },

  form: { width: "100%", maxWidth: 400 },
  
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 65,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#fff" },
  countryCode: { marginLeft: 10, fontSize: 16, fontWeight: "bold", color: "#1E88FF" },

  forgotBtn: { alignSelf: "flex-end", marginBottom: 25 },
  forgotText: { color: "#556789", fontSize: 13 },

  buttonContainer: { borderRadius: 18, overflow: "hidden", elevation: 5 },
  button: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff", letterSpacing: 0.5 },

  footerText: { color: "#556789", textAlign: "center", marginTop: 25, fontSize: 14 },
  linkText: { color: "#1E88FF", fontWeight: "bold" },
});