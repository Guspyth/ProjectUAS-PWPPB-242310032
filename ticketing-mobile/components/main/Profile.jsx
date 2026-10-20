import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTickets } from "../../context/TicketContext";

export default function Profile() {
  const router = useRouter();
  const { user, setUser } = useTickets();

  const handleLogout = () => {
    router.replace("/auth/auth");
  };

  return (
    <View style={styles.container}>
      {/* Profile Header Area */}
      <View style={styles.profileHeader}>
        <Image
          source={require("@/assets/images/avatar.png")}
          style={styles.profileAvatar}
        />
        <Text style={styles.profileName}>{user ? user.username : "Guest User"}</Text>
        <Text style={styles.profileEmail}>{user ? user.email : "guest@example.com"}</Text>
      </View>


      {/* Profile Settings Options */}
      <ScrollView contentContainerStyle={styles.profileOptions} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.profileOptionRow}
          onPress={() => {
            if (!user) {
              alert("Anda harus login terlebih dahulu untuk mengedit profil!");
              router.push("/auth/auth");
            } else {
              router.push("/edit-profile");
            }
          }}
        >
          <Ionicons name="person-outline" size={22} color="#061d33" />
          <Text style={styles.profileOptionText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.profileOptionRow}
          onPress={() => router.push("/(tabs)/history")}
        >
          <Ionicons name="ticket-outline" size={22} color="#061d33" />
          <Text style={styles.profileOptionText}>My Tickets</Text>
        </TouchableOpacity>

        
        <TouchableOpacity
          style={styles.profileOptionRow}
          onPress={() => router.push("/wishlist")}
        >
          <Ionicons name="bookmark-outline" size={22} color="#061d33" />
          <Text style={styles.profileOptionText}>Saved Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileOptionRow}>


          <Ionicons name="headset-outline" size={22} color="#061d33" />
          <Text style={styles.profileOptionText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.profileOptionRow}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#061d33" />
          <Text style={styles.profileOptionText}>Privacy & Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.logoutButton, !user ? { backgroundColor: "#061d33" } : null]} 
          onPress={() => {
            if (user) {
              setUser(null); // Clear session
            }
            router.replace("/auth/auth");
          }}
        >
          <Text style={styles.logoutButtonText}>{user ? "Log Out" : "Log In / Register"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebebeb",
  },
  profileHeader: {
    backgroundColor: "#061d33",
    alignItems: "center",
    paddingVertical: 36,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#ffffff",
    marginBottom: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#d1d5db",
  },
  profileOptions: {
    padding: 24,
    gap: 14,
  },
  profileOptionRow: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  profileOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#061d33",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
