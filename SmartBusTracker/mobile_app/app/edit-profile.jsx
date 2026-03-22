import React, { useState, useCallback } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function EditProfile() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState("passenger");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch("http://10.0.2.2:5002/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setFullName(data.user.fullName || "");
        setEmail(data.user.email || "");
        setGender(data.user.gender || "");
        setDob(data.user.dob ? data.user.dob.split("T")[0] : "");
        setRole(data.user.role || "passenger");
      }
    } catch (error) {
      console.log("Load Profile Error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch("http://10.0.2.2:5002/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, email, gender, dob, role }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success 🚀", "Profile updated successfully!");
        router.back();
      } else {
        Alert.alert("Update Failed", data.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
    }
  };

  return (
    <LinearGradient colors={["#050B1A", "#000"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={{ width: 24 }} /> 
          </View>

          <View style={styles.form}>
            {/* NAME INPUT */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#1E88FF" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor="#556789"
              />
            </View>

            {/* EMAIL INPUT */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#1E88FF" style={styles.icon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#556789"
                keyboardType="email-address"
              />
            </View>

            {/* GENDER PICKER */}
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerWrapper}>
              <Ionicons name="transgender-outline" size={20} color="#1E88FF" style={styles.icon} />
              <Picker
                selectedValue={gender}
                style={styles.picker}
                dropdownIconColor="#1E88FF"
                onValueChange={(val) => setGender(val)}
              >
                <Picker.Item label="Select Gender" value="" color="#556789" />
                <Picker.Item label="Male" value="male" color="#000" />
                <Picker.Item label="Female" value="female" color="#000" />
              </Picker>
            </View>

            {/* ROLE PICKER */}
            <Text style={styles.label}>Your Role</Text>
            <View style={styles.pickerWrapper}>
              <MaterialCommunityIcons name="account-cog-outline" size={20} color="#1E88FF" style={styles.icon} />
              <Picker
                selectedValue={role}
                style={styles.picker}
                dropdownIconColor="#1E88FF"
                onValueChange={(val) => setRole(val)}
              >
                <Picker.Item label="Passenger" value="passenger" color="#000" />
                <Picker.Item label="Admin" value="admin" color="#000" />
                <Picker.Item label="Conductor" value="conductor" color="#000" />
              </Picker>
            </View>

            {/* DATE PICKER */}
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#1E88FF" style={styles.icon} />
              <Text style={[styles.input, { paddingTop: 12, color: dob ? "#fff" : "#556789" }]}>
                {dob ? dob : "Select Date"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dob ? new Date(dob) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDob(selectedDate.toISOString().split("T")[0]);
                  }
                }}
              />
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
              <LinearGradient
                colors={["#1E88FF", "#0052D4"]}
                style={styles.gradientBtn}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backBtn: {
    backgroundColor: "#111C2F",
    padding: 8,
    borderRadius: 12,
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  form: { paddingHorizontal: 25 },
  label: {
    color: "#1E88FF",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 5,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111C2F",
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111C2F",
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: 'hidden'
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 15,
    fontSize: 15,
  },
  picker: {
    flex: 1,
    color: "#fff",
    height: 55,
    marginLeft: -10, // Adjusting for picker internal padding
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});