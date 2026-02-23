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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [role, setRole] = useState("passenger");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadProfile = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(
      "http://192.168.1.34:5002/api/users/profile",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (res.ok) {
      setFullName(data.user.fullName || "");
      setEmail(data.user.email || "");
      setGender(data.user.gender || "");
      setDob(data.user.dob ? data.user.dob.split("T")[0] : "");
      setRole(data.user.role || "passenger");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(
      "http://192.168.1.34:5002/api/users/profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          email,
          gender,
          dob,
          role,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      Alert.alert("Success", "Profile Updated");
      router.back();
    } else {
      Alert.alert("Error", data.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />

      <View style={styles.pickerBox}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>
      </View>

      <View style={styles.pickerBox}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Select Role" value="" />
          <Picker.Item label="Passenger" value="passenger" />
          <Picker.Item label="Driver" value="driver" />
          <Picker.Item label="Conductor" value="conductor" />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>
          {dob ? dob : "Select Date of Birth"}
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

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Save Changes
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, marginBottom: 20, fontWeight: "bold" },
  input: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1E88FF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  pickerBox: {
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 15,
  },
});