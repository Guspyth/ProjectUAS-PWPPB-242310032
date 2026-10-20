import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTickets } from "../../context/TicketContext";
import { BASE_URL } from "../../constants/Api";
import { FALLBACK_CONCERTS } from "./Home";

export default function Wishlist() {
  const router = useRouter();
  const { wishlist, toggleWishlist, events } = useTickets();

  // Normalize list
  const displayEvents = events && events.length > 0
    ? events.map((e) => ({
        id: e.event_id,
        title: e.event_title,
        date: new Date(e.event_date).toLocaleDateString("id-ID", {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        location: e.event_location,
        image: e.image ? { uri: `${BASE_URL}/uploads/events/${e.image}` } : require("@/assets/images/oasis_concert.png"),
      }))
    : FALLBACK_CONCERTS;

  // Filter concerts that are liked
  const likedConcerts = displayEvents.filter((concert) => wishlist.includes(concert.id));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {likedConcerts.length > 0 ? (
          likedConcerts.map((concert) => (
            <View key={concert.id} style={styles.concertCard}>
              <Image source={concert.image} style={styles.concertCardImage} />
              
              <View style={styles.concertCardBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.concertCardTitle}>{concert.title}</Text>
                  <TouchableOpacity onPress={() => toggleWishlist(concert.id)}>
                    <Ionicons name="heart" size={26} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#061d33" />
                  <Text style={styles.infoText}>{concert.date}</Text>
                </View>

                  {/* Location Info */}
                  <View style={[styles.infoRow, { marginBottom: 12 }]}>
                    <Ionicons name="pin-outline" size={16} color="#061d33" />
                    <Text style={[styles.infoText, { flex: 1 }]} numberOfLines={2}>
                      {concert.location}
                    </Text>
                  </View>

                  {/* Buy Button Row */}
                  <View style={styles.buyButtonRow}>
                    <TouchableOpacity
                      style={styles.buyBtn}
                      onPress={() => router.push({ pathname: "/details", params: { id: concert.id } })}
                    >
                      <Ionicons name="ticket" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.buyBtnText}>Buy Ticket</Text>
                    </TouchableOpacity>
                  </View>
                </View>

            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 20,
  },
  concertCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    padding: 12,
  },
  concertCardImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    resizeMode: "cover",
  },
  concertCardBody: {
    paddingTop: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  concertCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#061d33",
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#061d33",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  buyButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },

  buyBtn: {
    backgroundColor: "#22c55e",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
});
