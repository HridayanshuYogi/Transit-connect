import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function RegisterScreen() {
  const router = useRouter();

  // -------- STATES --------
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  const [role, setRole] = useState("passenger");   // ✅ ADD HERE
  const [showDatePicker, setShowDatePicker] = useState(false); 

  // -------- REGISTER FUNCTION --------
  const handleRegister = async () => {
    if (!phone || !fullName || !email || !password) {
      Alert.alert("Error ❌", "All fields are required!");
      return;
    }

    try {
      const API_URL = "http://192.168.1.34:5002/api/auth/register";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName,
          phone: phone,
          email: email,
          password: password,
          gender: gender,
          dob: dob,
          role: role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success ✅", "Registered Successfully!");

        // Go to Login Screen
        router.replace("/login");
      } else {
        Alert.alert("Failed ❌", data.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Server Error ⚠️", "Backend not reachable!");
      console.log(error);
    }
  };

  return (
    <LinearGradient
      colors={["#050B1A", "#050B1A", "#000"]}
      style={styles.container}
    >
      {/* Logo */}
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        contentFit="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Welcome</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Create account using phone number
      </Text>

      {/* Form */}
      <View style={styles.form}>
        {/* Phone */}
        <View style={styles.inputBox}>
          <Ionicons name="call-outline" size={20} color="#0066ff" />
          <Text style={styles.countryCode}>+91</Text>

          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#555"
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Full Name */}
        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={20} color="#0066ff" />

          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#555"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Email */}
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color="#0066ff" />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#555"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
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

        {/* Continue Button */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleRegister}>
          <LinearGradient
            colors={["#0A74FF", "#005BFF"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

/* -------- STYLES -------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 70,
  },

  logo: {
    width: 230,
    height: 130,
    marginBottom: 10,
  },

  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#1E88FF",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#999",
    marginBottom: 35,
  },

  form: {
    width: "85%",
    gap: 18,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },

  countryCode: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  button: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  loginText: {
    color: "#1E88FF",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },
});
