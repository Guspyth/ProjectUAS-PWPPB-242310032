import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTickets } from "../../context/TicketContext";

export default function History() {
  const router = useRouter();
  const { tickets, refetchEvents, loading } = useTickets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.appHeader}>
        <Text style={styles.logoTextTicke}>
          Ticke<Text style={styles.logoTextTing}>Ting</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconButton} onPress={refetchEvents}>
            <Ionicons name="refresh-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Image
            source={require("@/assets/images/avatar.png")}
            style={styles.headerAvatar}
          />
        </View>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#061d33" />
          <Text style={styles.loadingText}>Memuat riwayat...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.historyCard}
              onPress={() => router.push({ pathname: "/history-details", params: { id: ticket.id } })}
            >
              <View style={styles.moneyIconContainer}>
                <Ionicons name="cash-outline" size={28} color="#22c55e" />
              </View>
              <View style={styles.historyCardInfo}>
                <Text style={styles.historyCardTitle}>{ticket.title}</Text>
                <Text style={styles.historyCardDetails}>
                  {ticket.quantity}x {ticket.tier} Ticket • Rp {ticket.totalPrice.toLocaleString("id-ID")}
                </Text>
                <Text style={styles.historyCardSubDetails}>{ticket.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebebeb",
  },
  appHeader: {
    backgroundColor: "#061d33",
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoTextTicke: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  logoTextTing: {
    color: "#fbc02d",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  moneyIconContainer: {
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 8,
  },
  historyCardInfo: {
    flex: 1,
  },
  historyCardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#061d33",
    marginBottom: 2,
  },
  historyCardDetails: {
    fontSize: 12,
    color: "#4b5563",
  },
  historyCardSubDetails: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "600",
  },
});

