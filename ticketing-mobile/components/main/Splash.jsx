import { useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to Home screen with Guest access after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Centered Brand Name Logo */}
      <View style={styles.logoWrapper}>
        <Text style={styles.logoTextTicke}>
          Ticke<Text style={styles.logoTextTing}>Ting</Text>
        </Text>
        <Text style={styles.subtext}>Your Ultimate Concert Ticketing Partner</Text>
      </View>

      {/* Modern Loader indicator */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fbc02d" />
        <Text style={styles.loadingText}>Initializing App...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061d33", // Sleek deep navy matching design tokens
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
  },
  logoWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logoTextTicke: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -1,
  },
  logoTextTing: {
    color: "#fbc02d", // Eye-catching golden yellow
  },
  subtext: {
    fontSize: 14,
    color: "#d1d5db",
    fontWeight: "500",
    marginTop: 4,
  },
  loaderContainer: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
