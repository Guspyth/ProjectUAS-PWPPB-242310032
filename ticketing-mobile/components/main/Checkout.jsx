import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTickets } from "../../context/TicketContext";
import { BASE_URL } from "../../constants/Api";
import { FALLBACK_CONCERTS } from "./Home";
import { apiRequest } from "../../utils/api";

export default function Checkout() {
  const router = useRouter();
  const { id, tier, quantity, ticketId, price } = useLocalSearchParams();
  const { addTicket, events, refetchTransactions, user } = useTickets();


  // Find concert details
  const concertObj = events.find((c) => c.event_id === parseInt(id || "0"));
  const concert = concertObj
    ? {
        title: concertObj.event_title,
        date: new Date(concertObj.event_date).toLocaleDateString("id-ID", {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        location: concertObj.event_location,
        image: concertObj.image ? { uri: `${BASE_URL}/uploads/events/${concertObj.image}` } : require("@/assets/images/oasis_concert.png"),
        rawImage: concertObj.image ? `${BASE_URL}/uploads/events/${concertObj.image}` : null,
      }
    : FALLBACK_CONCERTS.find((c) => c.id === parseInt(id || "1")) || FALLBACK_CONCERTS[0];

  // Set pricing details dynamically
  const parsedPrice = price ? parseInt(price) : null;
  const isVip = tier === "VIP";
  const itemPrice = parsedPrice !== null ? parsedPrice : (isVip ? 2000000 : 1000000);
  const quantityNum = parseInt(quantity || "1");
  const subtotal = itemPrice * quantityNum;
  const totalAmount = subtotal;

  // Payment states
  const [selectedPayment, setSelectedPayment] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const paymentMethods = [
    { id: "gopay", name: "GOPAY", icon: "wallet-outline" },
    { id: "ovo", name: "OVO", icon: "card-outline" },
    { id: "dana", name: "DANA", icon: "cash-outline" },
    { id: "bank_transfer", name: "Bank Transfer", icon: "business-outline" },
  ];


  const handleCheckout = async () => {
  if (!selectedPayment) {
    alert("Silakan pilih metode pembayaran terlebih dahulu!");
    return;
  }

  const bookingCode = Math.floor(10000 + Math.random() * 90000).toString();
  const transactionRef = `TKT/${concert.title.substring(0, 3).toUpperCase()}/${Date.now().toString().slice(-5)}`;

  const newTicket = {
    id: `h-${Date.now()}`,
    title: concert.title,
    date: concert.date,
    location: concert.location,
    image: concert.rawImage || null,
    tier: tier || "Regular",
    quantity: quantityNum,
    ticketPrice: itemPrice,
    admFee: 0,
    totalPrice: totalAmount,
    bookingCode,
    transactionRef,
    paymentMethod: selectedPayment,
    orderDate:
      new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " WIB",
  };

  try {
    if (ticketId && user?.user_id) {
      await apiRequest("/transactions/buy", {
        method: "POST",
        body: {
          user_id: user.user_id,
          ticket_id: parseInt(ticketId),
          quantity: quantityNum,
          method: selectedPayment,
        },
      });

      await refetchTransactions();

      alert("Pembayaran berhasil!");
    } else {
      addTicket(newTicket);
      alert("Pembayaran berhasil!");
    }

    router.replace("/(tabs)/history");
  } catch (err) {
    console.log("Checkout gagal:", err);

    // Ambil pesan dari backend
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Pembelian gagal.";

    alert(message);

    // Jangan simpan tiket lokal jika backend menolak transaksi
    return;
  }
};


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ticket Header Label */}
        <Text style={styles.sectionLabel}>Pesanan 1</Text>
        <View style={styles.storeLabelRow}>
          <Ionicons name="business" size={16} color="#6b7280" />
          <Text style={styles.storeLabelText}>{concert.location}</Text>
        </View>

        {/* Item Card */}
        <View style={styles.itemCard}>
          <Image source={concert.image} style={styles.itemImage} />
          
          <View style={styles.itemInfo}>
            <View style={styles.tagWrapper}>
              <Text style={styles.tagText}>{tier || "Regular"}</Text>
            </View>
            
            <Text style={styles.itemTitle} numberOfLines={2}>{concert.title}</Text>
            <Text style={styles.itemQty}>{quantityNum} barang</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.itemPrice}>Rp {subtotal.toLocaleString("id-ID")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.lightDivider} />

        {/* Price Row Summary */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Pesanan</Text>
          <Text style={styles.summaryValue}>Rp {subtotal.toLocaleString("id-ID")}</Text>
        </View>

        {/* Gray Spacing block */}
        <View style={styles.spacingBlock} />

        {/* Payment Method Header */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionLabel}>Metode Pembayaran</Text>
          
          <TouchableOpacity style={styles.selectorBox} onPress={() => setShowPaymentModal(true)}>
            <View style={styles.selectorLeft}>
              <Ionicons
                name={
                  selectedPayment
                    ? paymentMethods.find((p) => p.name === selectedPayment)?.icon || "wallet-outline"
                    : "wallet-outline"
                }
                size={22}
                color="#061d33"
              />
              <Text style={selectedPayment ? styles.selectorTextSelected : styles.selectorText}>
                {selectedPayment || "Pilih Metode Pembayaran"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Buy Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomLabel}>Total Belanja</Text>
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>Rp {totalAmount.toLocaleString("id-ID")}</Text>
            <Ionicons name="chevron-up" size={16} color="#000000" />
          </View>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handleCheckout}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.payBtnText}>Bayar</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Selection Modal */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Pilih Metode Pembayaran</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentItem,
                  selectedPayment === method.name ? styles.paymentItemActive : null,
                ]}
                onPress={() => {
                  setSelectedPayment(method.name);
                  setShowPaymentModal(false);
                }}
              >
                <View style={styles.paymentItemLeft}>
                  <Ionicons name={method.icon} size={24} color="#061d33" />
                  <Text style={styles.paymentItemName}>{method.name}</Text>
                </View>
                {selectedPayment === method.name && (
                  <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  storeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  storeLabelText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  itemCard: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  tagWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "bold",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 2,
  },
  itemQty: {
    fontSize: 12,
    color: "#9ca3af",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
  },
  lightDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
  },
  spacingBlock: {
    height: 8,
    backgroundColor: "#f9fafb",
    width: "100%",
    marginVertical: 12,
  },
  paymentSection: {
    marginTop: 8,
  },
  selectorBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  selectorTextSelected: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  bottomLeft: {
    flexDirection: "column",
  },
  bottomLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  bottomPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  payBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  payBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  paymentItemActive: {
    borderColor: "#22c55e",
    backgroundColor: "#f0fdf4",
  },
  paymentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
});
