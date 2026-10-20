import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { apiRequest } from "../../utils/api";
import { BASE_URL } from "../../constants/Api";
import { useTickets } from "../../context/TicketContext";

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useTickets();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    if (!username || !password) {
      alert("Username dan password wajib diisi.");
      return;
    }

    if (isLogin) {
      try {
        const response = await apiRequest("/auth/login", {
          method: "POST",
          body: { identifier: username, password: password }
        });
        
        // Save user details to global context
        if (response && response.data) {
          setUser(response.data);
        }
        
        alert(response.message || "Login berhasil!");
        router.replace("/(tabs)/home");
      } catch (err) {

        if (err.message && err.message.includes("Network request failed")) {
          alert(
            "Gagal terhubung ke backend server!\n\n" +
            "1. Pastikan server backend Anda aktif di port 3001.\n" +
            "2. Jika Anda menggunakan HP fisik (Expo Go), Anda harus mengganti 'localhost' di constants/Api.js dengan IP lokal komputer Anda (misal: 192.168.x.x)."
          );
        } else {
          alert(err.message || "Gagal login. Periksa kembali kredensial Anda.");
        }
      }
    } else {
      if (!email) {
        alert("Email wajib diisi untuk pendaftaran.");
        return;
      }
      
      try {
        const response = await apiRequest("/users/register", {
          method: "POST",
          body: { username, email, password }
        });

        alert(response.message || "Pendaftaran berhasil! Silakan login.");
        setIsLogin(true);
      } catch (err) {
        if (err.message && err.message.includes("Network request failed")) {
          alert(
            "Gagal terhubung ke backend server saat mendaftar!\n\n" +
            "Pastikan backend server aktif di port 3001."
          );
        } else {
          alert(err.message || "Gagal melakukan pendaftaran.");
        }
      }
    }
  };






  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Area with Logo */}
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextTicke}>
            Ticke<Text style={styles.logoTextTing}>Ting</Text>
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formKeyboardAvoiding}
      >

        <View style={styles.formWrapper}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Username Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>

            {/* Email Field (Only visible on Sign Up screen) */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
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
            )}

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <Text style={styles.buttonText}>
                {isLogin ? "Login" : "Sign up"}
              </Text>
            </TouchableOpacity>

            {/* Divider Line (Matching mockup style) */}
            {isLogin && <View style={styles.divider} />}

            {/* Toggle Mode Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {isLogin ? "You don't have account? " : "Already have an account? "}
                <Text
                  style={styles.footerLink}
                  onPress={() => {
                    setIsLogin(!isLogin);
                    // Clear fields when toggling
                    setUsername("");
                    setEmail("");
                    setPassword("");
                  }}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </Text>
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061d33", // Deep navy blue matching mockup
  },
  headerContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#061d33",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextTicke: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -1,
  },
  logoTextTing: {
    color: "#fbc02d", // Golden yellow matching mockup
  },
  formKeyboardAvoiding: {
    flex: 1,
  },

  formWrapper: {
    flex: 1,
    backgroundColor: "#ebebeb", // Light grey container
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#061d33",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#061d33",
    borderWidth: 0,
  },
  button: {
    backgroundColor: "#061d33",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 2,
    backgroundColor: "#061d33",
    width: "100%",
    alignSelf: "center",
    marginBottom: 24,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#000000",
  },
  footerLink: {
    color: "#fbc02d",
    fontWeight: "bold",
  },
});
