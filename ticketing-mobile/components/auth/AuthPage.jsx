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
  const [loading, setLoading] = useState(false);
  // Pesan ditampilkan di layar (bukan alert) supaya tetap terlihat di browser
  // yang memblokir alert(), misalnya browser bawaan VS Code.
  const [message, setMessage] = useState(null); // { type: "error" | "success", text }

  const isNetworkError = (err) =>
    /Network request failed|Failed to fetch|tidak merespons/i.test(err?.message || "");

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setEmail("");
    setPassword("");
    setMessage(null);
  };

  const handleAuth = async () => {
    setMessage(null);

    if (!username || !password) {
      setMessage({ type: "error", text: "Username dan password wajib diisi." });
      return;
    }
    if (!isLogin && !email) {
      setMessage({ type: "error", text: "Email wajib diisi untuk pendaftaran." });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await apiRequest("/auth/login", {
          method: "POST",
          body: { identifier: username, password: password },
        });

        // Simpan data user ke context global
        if (response && response.data) {
          setUser(response.data);
        }
        router.replace("/(tabs)/home");
      } else {
        const response = await apiRequest("/users/register", {
          method: "POST",
          body: { username, email, password },
        });

        setIsLogin(true);
        setPassword("");
        setMessage({
          type: "success",
          text: response.message || "Pendaftaran berhasil! Silakan login.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: isNetworkError(err)
          ? `Tidak dapat terhubung ke server (${BASE_URL}). Pastikan backend aktif di port 3001.`
          : err.message || "Terjadi kesalahan. Periksa kembali data Anda.",
      });
    } finally {
      setLoading(false);
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

            {/* Pesan error / sukses */}
            {message && (
              <View
                style={[
                  styles.messageBox,
                  message.type === "success" ? styles.messageSuccess : styles.messageError,
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Memproses..." : isLogin ? "Login" : "Sign up"}
              </Text>
            </TouchableOpacity>

            {/* Divider Line (Matching mockup style) */}
            {isLogin && <View style={styles.divider} />}

            {/* Toggle Mode Footer */}
            <View style={[styles.footerContainer, styles.footerRow]}>
              <Text style={styles.footerText}>
                {isLogin ? "You don't have account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity
                onPress={toggleMode}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.footerLink}>{isLogin ? "Sign Up" : "Sign In"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  messageBox: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  messageError: {
    backgroundColor: "#fde8e8",
    borderWidth: 1,
    borderColor: "#f05252",
  },
  messageSuccess: {
    backgroundColor: "#e6f6ec",
    borderWidth: 1,
    borderColor: "#31c48d",
  },
  messageText: {
    color: "#1f2937",
    fontSize: 14,
  },
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
