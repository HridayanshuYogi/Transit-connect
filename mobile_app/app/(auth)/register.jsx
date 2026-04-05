import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
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
  const [role, setRole] = useState("passenger");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRegister = async () => {
    if (!phone || !fullName || !email || !password) {
      Alert.alert("Error ❌", "Basic info is required!");
      return;
    }

    try {
      const API_URL = "http://10.0.2.2:5002/api/auth/register";
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, password, gender, dob, role }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success ✅", "Account created!");
        router.replace("/login");
      } else {
        Alert.alert("Failed ❌", data.message || "Try again");
      }
    } catch (error) {
      Alert.alert("Server Error ⚠️", "Backend not reachable!");
    }
  };

  return (
    <LinearGradient colors={["#050B1A", "#050B1A", "#000"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} contentFit="contain" />
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the SmartBus community today</Text>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={20} color="#1E88FF" />
              <TextInput 
                placeholder="Full Name" 
                placeholderTextColor="#556789" 
                style={styles.input} 
                value={fullName} 
                onChangeText={setFullName} 
              />
            </View>

            {/* Phone */}
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

            {/* Email */}
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#1E88FF" />
              <TextInput 
                placeholder="Email Address" 
                placeholderTextColor="#556789" 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
              />
            </View>

            {/* Password */}
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

            {/* Role & Gender (Side by Side) */}
            <View style={styles.row}>
              <View style={[styles.inputBox, { flex: 1, marginRight: 10 }]}>
                <Picker
                  selectedValue={role}
                  onValueChange={(v) => setRole(v)}
                  style={styles.picker}
                  dropdownIconColor="#1E88FF"
                >
                  <Picker.Item label="Passenger" value="passenger" />
                  <Picker.Item label="Driver" value="driver" />
                  <Picker.Item label="Conductor" value="conductor" />
                </Picker>
              </View>
              <View style={[styles.inputBox, { flex: 1 }]}>
                <Picker
                  selectedValue={gender}
                  onValueChange={(v) => setGender(v)}
                  style={styles.picker}
                  dropdownIconColor="#1E88FF"
                >
                  <Picker.Item label="Gender" value="" color="#556789" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                </Picker>
              </View>
            </View>

            {/* Date of Birth */}
            <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#1E88FF" />
              <Text style={[styles.input, { color: dob ? "#fff" : "#556789", paddingTop: 12 }]}>
                {dob ? dob : "Date of Birth"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={(e, date) => {
                  setShowDatePicker(false);
                  if (date) setDob(date.toISOString().split("T")[0]);
                }}
              />
            )}

            <TouchableOpacity activeOpacity={0.8} onPress={handleRegister} style={styles.buttonContainer}>
              <LinearGradient colors={["#1E88FF", "#0052D4"]} style={styles.button}>
                <Text style={styles.buttonText}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={{ fontWeight: "bold" }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { alignItems: "center", paddingTop: 60, paddingBottom: 40 },
  logo: { width: 180, height: 100, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#556789", marginBottom: 30 },
  form: { width: "88%" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 60,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: "#fff" },
  countryCode: { marginLeft: 10, fontSize: 15, fontWeight: "bold", color: "#1E88FF" },
  picker: { flex: 1, color: "#fff", marginLeft: -10 },
  buttonContainer: { marginTop: 10, borderRadius: 16, overflow: "hidden", elevation: 8 },
  button: { paddingVertical: 18, alignItems: "center" },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff", letterSpacing: 0.5 },
  loginText: { color: "#556789", textAlign: "center", marginTop: 20, fontSize: 14 },
});