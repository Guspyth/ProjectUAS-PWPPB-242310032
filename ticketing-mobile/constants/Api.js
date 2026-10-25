import { Platform } from "react-native";
import Constants from "expo-constants";

// Alamat backend ditentukan otomatis supaya tidak perlu mengedit IP manual:
//  - Web (localhost:8081)     -> localhost
//  - HP fisik (Expo Go)       -> IP komputer yang menjalankan Expo (diambil dari hostUri)
//  - Android Emulator         -> 10.0.2.2
//  - iOS Simulator            -> localhost
// Jika perlu alamat khusus, buat file ticketing-mobile/.env berisi:
//   EXPO_PUBLIC_API_URL=http://192.168.x.x:3001
function resolveHost() {
  if (Platform.OS === "web") return "localhost";

  const hostUri = Constants.expoConfig?.hostUri; // contoh: "192.168.1.11:8081"
  if (hostUri) return hostUri.split(":")[0];

  if (Platform.OS === "android") return "10.0.2.2";
  return "localhost";
}

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${resolveHost()}:3001`;

export const API_URL = `${BASE_URL}/api`;
