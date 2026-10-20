import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTickets } from "../../context/TicketContext";
import { BASE_URL } from "../../constants/Api";

export default function HistoryDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tickets } = useTickets();

  // Find the selected ticket transaction
  const ticket = tickets.find((t) => t.id === id) || tickets[0];

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaksi tidak ditemukan.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get image source
  const imageSource = ticket.image
    ? { uri: ticket.image }
    : require("@/assets/images/oasis_concert.png");

  return (
    <View style={styles.container}>
      {/* Back Button Header */}
      <View style={styles.backHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Detail Transaction Title & Date stamp */}
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptHeaderTitle}>Detail Transaction</Text>
          <Text style={styles.receiptHeaderDate}>{ticket.orderDate || "30-04-2026 08:33 WIB"}</Text>
        </View>

        {/* Divider */}
        <View style={styles.lightDivider} />

        {/* Top Concert Info Card */}
        <View style={styles.concertCard}>
          <Image source={imageSource} style={styles.concertImage} />
          
          <View style={styles.concertInfo}>
            <Text style={styles.concertTitle} numberOfLines={2}>
              {ticket.title}
            </Text>
            <Text style={styles.concertLocation} numberOfLines={1}>
              {ticket.location}
            </Text>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date: </Text>
              <Text style={styles.metaVal}>{ticket.date}</Text>
            </View>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Time: </Text>
              <Text style={styles.metaVal}>19:00 WIB</Text>
            </View>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Booking Code: </Text>
              <Text style={[styles.metaVal, { fontWeight: "bold", color: "#061d33" }]}>
                {ticket.bookingCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.gridRow}>
            <Text style={styles.gridKey}>Transaction Ref</Text>
            <Text style={styles.gridValue}>{ticket.transactionRef}</Text>
          </View>

          <View style={styles.gridRow}>
            <Text style={styles.gridKey}>Category / Tier</Text>
            <Text style={[styles.gridValue, { fontWeight: "bold", color: "#000000" }]}>
              {ticket.tier}
            </Text>
          </View>

          <View style={styles.gridRow}>
            <Text style={styles.gridKey}>Total Tickets</Text>
            <Text style={styles.gridValue}>{ticket.quantity}</Text>
          </View>

          <View style={styles.gridRow}>
            <Text style={styles.gridKey}>Ticket Price</Text>
            <Text style={styles.gridValue}>
              Rp {ticket.ticketPrice ? ticket.ticketPrice.toLocaleString("id-ID") : "150.000"}
            </Text>
          </View>

          <View style={styles.gridRow}>
            <Text style={styles.gridKey}>Total Order</Text>
            <Text style={styles.gridValue}>
              Rp {(ticket.ticketPrice * ticket.quantity).toLocaleString("id-ID")}
            </Text>
          </View>

          <View style={styles.gridRow}>
            <Text style={styles.gridKey}>Payment</Text>
            <Text style={[styles.gridValue, { fontWeight: "600" }]}>{ticket.paymentMethod}</Text>
          </View>
        </View>

        {/* Heavy Divider */}
        <View style={styles.thickDivider} />

        {/* Total Payment Bar */}
        <View style={styles.totalPaymentRow}>
          <Text style={styles.totalPaymentLabel}>Total Payment</Text>
          <Text style={styles.totalPaymentValue}>
            Rp {ticket.totalPrice ? ticket.totalPrice.toLocaleString("id-ID") : "150.000"}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  backHeader: {
    backgroundColor: "#061d33",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  receiptHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  receiptHeaderDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  lightDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 20,
  },
  concertCard: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  concertImage: {
    width: 90,
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  concertInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  concertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  concertLocation: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 13,
    color: "#4b5563",
  },
  metaVal: {
    fontSize: 13,
    color: "#000000",
  },
  detailsGrid: {
    gap: 14,
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridKey: {
    fontSize: 14,
    color: "#6b7280",
  },
  gridValue: {
    fontSize: 14,
    color: "#000000",
  },
  thickDivider: {
    height: 1.5,
    backgroundColor: "#000000",
    marginBottom: 16,
  },
  totalPaymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  totalPaymentLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4b5563",
  },
  totalPaymentValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
  },
  backBtn: {
    backgroundColor: "#061d33",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
