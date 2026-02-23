import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState("");
  const router = useRouter();

  // ✅ OTP Verify Function
  const handleVerifyOtp = () => {
    if (!otp) {
      Alert.alert("Error ❌", "Please enter OTP");
      return;
    }

    // Temporary OTP Check (Demo)
    if (otp === "1234") {
      Alert.alert("Success ✅", "OTP Verified Successfully!");

      // ✅ Navigate to Tabs Home
      router.replace("/tabs/index");
    } else {
      Alert.alert("Failed ❌", "Invalid OTP");
    }
  };

  return (
    <LinearGradient colors={["#050B1A", "#061A2E"]} style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Verify OTP</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Enter the verification code sent to your phone
      </Text>

      {/* OTP Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        maxLength={4}
      />

      {/* Verify Button */}
      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
        <Text style={styles.buttonText}>Verify</Text>
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#1e90ff",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 25,
    textAlign: "center",
  },

  input: {
    width: "85%",
    backgroundColor: "#111C2F",
    padding: 15,
    borderRadius: 12,
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#0066ff",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 14,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
