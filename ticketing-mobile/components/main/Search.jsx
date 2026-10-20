import { useState } from "react";
import { StyleSheet, Text, TextInput, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTickets } from "../../context/TicketContext";
import { BASE_URL } from "../../constants/Api";
import { FALLBACK_CONCERTS } from "./Home";

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
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
        eventStatus: (e.event_status || e.status || "ongoing").toLowerCase().trim(), // Map status ke lowercase & trim
      }))
    : FALLBACK_CONCERTS.map(c => ({ ...c, eventStatus: "ongoing" }));

  const filteredConcerts = displayEvents.filter((concert) =>
    concert.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar Container */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredConcerts.length > 0 ? (
          filteredConcerts.map((concert) => {
            const isLiked = wishlist.includes(concert.id);
            const status = concert.eventStatus;

            return (
              <View key={concert.id} style={styles.concertCard}>
                <Image source={concert.image} style={styles.concertCardImage} />
                
                <View style={styles.concertCardBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.concertCardTitle}>{concert.title}</Text>
                    <TouchableOpacity onPress={() => toggleWishlist(concert.id)}>
                      <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={26}
                        color={isLiked ? "#ef4444" : "#061d33"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#061d33" />
                    <Text style={styles.infoText}>{concert.date}</Text>
                  </View>

                  {/* Location Info */}
                  <View style={[styles.infoRow, { marginBottom: 8 }]}>
                    <Ionicons name="pin-outline" size={16} color="#061d33" />
                    <Text style={[styles.infoText, { flex: 1 }]} numberOfLines={2}>
                      {concert.location}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <Ionicons name="information-circle-outline" size={16} color="#061d33" style={{ marginRight: 8 }} />
                    <View style={[
                      styles.statusBadge,
                      status === "upcoming" 
                        ? styles.statusBadgeUpcoming 
                        : status === "done"
                        ? styles.statusBadgeDone
                        : styles.statusBadgeOngoing
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {status === "upcoming" 
                          ? "UPCOMING" 
                          : status === "done" 
                          ? "DONE" 
                          : "ON GOING"}
                      </Text>
                    </View>
                  </View>

                  {/* Buy Button Row */}
                  <View style={styles.buyButtonRow}>
                    <TouchableOpacity
                      style={[
                        styles.buyBtn,
                        (status === "upcoming" || status === "done") ? styles.buyBtnDisabled : null
                      ]}
                      onPress={() => {
                        if (status === "upcoming") {
                          alert("Pemesanan tiket belum dibuka (UPCOMING). Silakan tunggu penjualan dimulai!");
                        } else if (status === "done") {
                          alert("Event ini sudah selesai dilaksanakan (DONE). Tiket tidak dapat dibeli lagi!");
                        } else {
                          router.push({ pathname: "/details", params: { id: concert.id } });
                        }
                      }}
                    >
                      <Ionicons name="ticket" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.buyBtnText}>
                        {status === "upcoming" 
                          ? "Ticket Belum Tersedia" 
                          : status === "done" 
                          ? "Event Selesai" 
                          : "Buy Ticket"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No events found</Text>
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
  searchBarContainer: {
    flexDirection: "row",
    padding: 18,
    backgroundColor: "#ebebeb",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#061d33",
  },
  searchButton: {
    backgroundColor: "#061d33",
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
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
  buyBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  buyBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusBadgeUpcoming: {
    backgroundColor: "#f59e0b", // Yellow/orange for upcoming
  },
  statusBadgeOngoing: {
    backgroundColor: "#22c55e", // Green for ongoing
  },
  statusBadgeDone: {
    backgroundColor: "#ef4444", // Red for done
  },
  statusBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});