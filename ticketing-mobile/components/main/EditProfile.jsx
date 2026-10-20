import { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTickets } from "../../context/TicketContext";
import { apiRequest } from "../../utils/api";

export default function EditProfile() {
  const router = useRouter();
  const { user, setUser } = useTickets();
  
  // Local profile states
  const [name, setName] = useState(user ? user.username : "Guest User");
  const [email, setEmail] = useState(user ? user.email : "guest@example.com");
  const [phone, setPhone] = useState(user?.number ? user.number.toString() : "");

  const handleSave = async () => {
    if (!name || !email) {
      alert("Nama dan Email wajib diisi!");
      return;
    }

    try {
      // Panggil backend API PATCH /users/users/:id
      const response = await apiRequest(`/users/users/${user.user_id}`, {
        method: "PATCH", // Menggunakan PATCH sesuai rute userRoutes.js
        body: {
          username: name,
          email: email,
          number: phone ? parseInt(phone, 10) : null
        }
      });

      if (response && response.data) {
        // Update data user di global context
        setUser(response.data);
        alert(response.message || "Profil berhasil diperbarui!");
        router.back();
      }
    } catch (err) {
      alert(err.message || "Gagal memperbarui profil.");
    }
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} /> {/* Spacer to center the title */}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require("@/assets/images/avatar.png")}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarSubText}>Tap to change avatar</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebebeb",
  },
  header: {
    backgroundColor: "#061d33",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 8,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#fbc02d",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarSubText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#061d33",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#374151",
    backgroundColor: "#f9fafb",
  },
  saveBtn: {
    backgroundColor: "#061d33",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
