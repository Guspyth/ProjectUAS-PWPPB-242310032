import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTickets } from "../../context/TicketContext";
import { BASE_URL } from "../../constants/Api";
import { FALLBACK_CONCERTS } from "./Home";
import { apiRequest } from "../../utils/api";

// Limit pembelian tiket per event. Dinonaktifkan sementara (Infinity)
// untuk keperluan testing dynamic pricing, konsisten dengan
// MAX_TICKET_PER_EVENT yang juga di-comment di transactionController.js backend.
// Untuk mengaktifkan kembali, ganti Infinity menjadi 4.
const MAX_TICKET_PER_EVENT = 4;

export default function TicketDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addTicket, events, submitReport, user, tickets } = useTickets();


  // Find concert from global events context
  const concertObj = events.find((c) => c.event_id === parseInt(id || "0"));
  
  // Normalize concert data
  const concert = concertObj
    ? {
        id: concertObj.event_id,
        title: concertObj.event_title,
        date: new Date(concertObj.event_date).toLocaleDateString("id-ID", {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        location: concertObj.event_location,
        image: concertObj.image ? { uri: `${BASE_URL}/uploads/events/${concertObj.image}` } : require("@/assets/images/oasis_concert.png"),
        vipPrice: 2000000, // Default fallback
        regularPrice: 1000000, // Default fallback
        ticketStart: concertObj.ticket_start 
          ? new Date(concertObj.ticket_start).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }) + " WIB"
          : null,
        ticketEnds: concertObj.ticket_ends 
          ? new Date(concertObj.ticket_ends).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }) + " WIB"
          : null,
      }
    : FALLBACK_CONCERTS.find((c) => c.id === parseInt(id || "1")) || FALLBACK_CONCERTS[0];

  // Calculate total tickets bought by user for this concert event
  // `user` bernilai null jika belum login, dan id user di backend bernama `user_id`.
  const boughtTicketsForEvent = user && tickets
    ? tickets
        .filter(
          (t) =>
            t.user_id === user.user_id &&
            t.event_id === concert.id
        )
        .reduce((sum, current) => sum + (current.quantity || 0), 0)
    : 0;

  const isRealEvent = !!concertObj;
  const [selectedTier, setSelectedTier] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [ticketsData, setTicketsData] = useState([]);
  const [loadingTiers, setLoadingTiers] = useState(false);

  // States for reporting event/user
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [complaintType, setComplaintType] = useState("Toxic");
  const [reportText, setReportText] = useState("");
  const [reportTarget, setReportTarget] = useState("");

  // Fetch ticket tiers from API

  useEffect(() => {
    const fetchTiers = async () => {
      setLoadingTiers(true);
      try {
        const response = await apiRequest(`/tickets/event/${id}`);
        if (response && response.success && response.data.length > 0) {
          setTicketsData(response.data);
          setSelectedTier(response.data[0].ticket_category);
        } else {
          if (isRealEvent) {
            setTicketsData([]);
            setSelectedTier("");
          } else {
            // Default mock fallbacks only for mock UI events
            const fallbacks = [
              { ticket_category: "VIP", current_price: 2000000 },
              { ticket_category: "Regular", current_price: 1000000 }
            ];
            setTicketsData(fallbacks);
            setSelectedTier("Regular");
          }
        }
      } catch (err) {
        console.log("Using fallback ticket tiers.");
        if (isRealEvent) {
          setTicketsData([]);
          setSelectedTier("");
        } else {
          const fallbacks = [
            { ticket_category: "VIP", current_price: 2000000 },
            { ticket_category: "Regular", current_price: 1000000 }
          ];
          setTicketsData(fallbacks);
          setSelectedTier("Regular");
        }
      } finally {
        setLoadingTiers(false);
      }
    };

    if (id) {
      fetchTiers();
    }
  }, [id, isRealEvent]);

  const activeTierObj = ticketsData.find((t) => t.ticket_category === selectedTier) || ticketsData[0];
  const activePrice = activeTierObj ? activeTierObj.current_price : 0;
  const totalAmount = activePrice * quantity;


  const handleBuyTicket = () => {
    // Guest protection: redirect to authentication page if user is not logged in
    if (!user) {
      alert("Anda harus login terlebih dahulu untuk melakukan pemesanan tiket!");
      router.push("/auth/auth");
      return;
    }

    router.push({
      pathname: "/checkout",
      params: {
        id: id,
        tier: selectedTier,
        quantity: quantity,
        ticketId: activeTierObj?.ticket_id,
        price: activePrice,
      }
    });
  };


  const handleSendReport = async () => {
    if (!reportText.trim()) {
      alert("Silakan isi rincian laporan.");
      return;
    }

    try {
      const response = await apiRequest("/reports", {
        method: "POST",
        body: JSON.stringify({
          reported_user_id: concertObj.user_id,
          event_id: concertObj.event_id,
          complaint_type: complaintType,
          description: reportText
        })
      });

      if (response.success) {
        alert("Laporan berhasil dikirim.");

        setReportText("");
        setComplaintType("Toxic");
        setShowReportModal(false);
      } else {
        alert(response.message);
      }
    } catch (err) {
      console.log(err);
      alert("Gagal mengirim laporan.");
    }
  };


  return (
    <View style={styles.container}>
      {/* Back Header */}
      <View style={styles.backHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowOptionsModal(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>


      <ScrollView contentContainerStyle={styles.detailsScroll} showsVerticalScrollIndicator={false}>
        {/* Concert Image */}
        <Image source={concert.image} style={styles.detailBannerImage} />

        <Text style={styles.detailTitle}>{concert.title}</Text>

        {/* Schedule Card */}
        <View style={styles.detailCard}>
          <Text style={styles.detailCardHeading}>Schedule</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#061d33" />
            <Text style={styles.infoRowText}>{concert.date}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="pin-outline" size={18} color="#061d33" />
            <Text style={styles.infoRowText}>{concert.location}</Text>
          </View>

          {/* Durasi Penjualan Tiket */}
          {concert.ticketStart && concert.ticketEnds && (
            <View style={[styles.infoRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 10 }]}>
              <Ionicons name="time-outline" size={18} color="#f59e0b" />
              <View style={{ marginLeft: 4 }}>
                <Text style={[styles.infoRowText, { fontWeight: "bold", color: "#f59e0b" }]}>Durasi Penjualan:</Text>
                <Text style={[styles.infoRowText, { fontSize: 13, color: "#4b5563" }]}>
                  {concert.ticketStart} s/d {concert.ticketEnds}
                </Text>
              </View>
            </View>
          )}

          {/* Ticket Tiers */}
          {loadingTiers ? (
            <ActivityIndicator size="small" color="#061d33" style={{ marginVertical: 12 }} />
          ) : ticketsData.length > 0 ? (
            ticketsData.map((tier, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.tierSelector,
                  selectedTier === tier.ticket_category ? styles.tierSelectorActive : null,
                ]}
                onPress={() => setSelectedTier(tier.ticket_category)}
              >
                <Text style={styles.tierName}>{tier.ticket_category}</Text>
                <Text style={styles.tierPrice}>
                  Rp {tier.current_price.toLocaleString("id-ID")}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noTicketsContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
              <Text style={styles.noTicketsText}>Tiket belum tersedia untuk konser ini</Text>
            </View>
          )}

          {/* Total */}
          {ticketsData.length > 0 && (
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                Rp {totalAmount.toLocaleString("id-ID")}
              </Text>
            </View>
          )}

          {/* Quantity Selector */}
          {ticketsData.length > 0 && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={24} color="#061d33" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => {
                  if (boughtTicketsForEvent >= MAX_TICKET_PER_EVENT) {
                    alert(`Anda sudah membeli batas maksimal ${MAX_TICKET_PER_EVENT} tiket untuk konser ini.`);
                  } else if (quantity + boughtTicketsForEvent >= MAX_TICKET_PER_EVENT) {
                    alert(`Total pembelian Anda tidak boleh melebihi batas ${MAX_TICKET_PER_EVENT} tiket!`);
                  } else {
                    setQuantity(quantity + 1);
                  }
                }}
                disabled={boughtTicketsForEvent >= MAX_TICKET_PER_EVENT}
              >
                <Ionicons name="add" size={24} color={boughtTicketsForEvent >= MAX_TICKET_PER_EVENT ? "#9ca3af" : "#061d33"} />
              </TouchableOpacity>
            </View>
          )}

          {/* Warning teks disembunyikan sementara selama limit dinonaktifkan (testing) */}
          {ticketsData.length > 0 && Number.isFinite(MAX_TICKET_PER_EVENT) && (
            <Text style={styles.warningText}>
              {boughtTicketsForEvent > 0 
                ? `Anda telah membeli ${boughtTicketsForEvent} tiket. Sisa batas: ${MAX_TICKET_PER_EVENT - boughtTicketsForEvent} tiket.` 
                : `Maksimal ${MAX_TICKET_PER_EVENT} tiket per pengguna!`}
            </Text>
          )}
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            (ticketsData.length === 0 || boughtTicketsForEvent >= MAX_TICKET_PER_EVENT) ? styles.checkoutBtnDisabled : null
          ]}
          onPress={handleBuyTicket}
          disabled={ticketsData.length === 0 || boughtTicketsForEvent >= MAX_TICKET_PER_EVENT}
        >
          <Text style={styles.checkoutBtnText}>
            {ticketsData.length === 0 
              ? "Tiket Tidak Tersedia" 
              : boughtTicketsForEvent >= MAX_TICKET_PER_EVENT 
              ? "Batas Pembelian Tercapai" 
              : "Buy Ticket"}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Options Menu Modal */}
      <Modal visible={showOptionsModal} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsContent}>
            <TouchableOpacity
              style={styles.optionsItem}
              onPress={() => {
                setShowOptionsModal(false);
                setShowReportModal(true);
              }}
            >
              <Ionicons name="flag-outline" size={20} color="#ef4444" style={{ marginRight: 12 }} />
              <Text style={styles.optionsItemText}>Laporkan Konser / Akun</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionsItem, { borderBottomWidth: 0 }]}
              onPress={() => setShowOptionsModal(false)}
            >
              <Ionicons name="close-outline" size={20} color="#000000" style={{ marginRight: 12 }} />
              <Text style={styles.optionsItemText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Form Modal */}
      <Modal visible={showReportModal} animationType="slide" transparent>
        <View style={styles.reportModalOverlay}>
          <View style={styles.reportModalContent}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Laporkan Masalah</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>




            {/* Complaint Type Segmented */}
            <Text style={styles.reportFormLabel}>Kategori Keluhan</Text>
            <View style={styles.segmentedContainer}>
              {["Toxic", "Scam", "Spam", "Other"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.segmentedItem,
                    complaintType === type ? styles.segmentedItemActive : null,
                  ]}
                  onPress={() => setComplaintType(type)}
                >
                  <Text
                    style={[
                      styles.segmentedText,
                      complaintType === type ? styles.segmentedTextActive : null,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description Input */}
            <Text style={styles.reportFormLabel}>Detail Laporan</Text>
            <TextInput
              style={[styles.reportTextInput, { height: 100, textAlignVertical: "top" }]}
              placeholder="Jelaskan detail laporan secara rinci..."
              placeholderTextColor="#9ca3af"
              multiline
              value={reportText}
              onChangeText={setReportText}
            />

            {/* Action Buttons */}
            <View style={styles.reportActionRow}>
              <TouchableOpacity
                style={styles.reportCancelBtn}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={styles.reportCancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reportSubmitBtn} onPress={handleSendReport}>
                <Text style={styles.reportSubmitBtnText}>Kirim Laporan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebebeb",
  },
  backHeader: {
    backgroundColor: "#061d33",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  detailBannerImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    resizeMode: "cover",
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#061d33",
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  detailCardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#061d33",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoRowText: {
    fontSize: 14,
    color: "#374151",
  },
  tierSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
  },
  tierSelectorActive: {
    borderColor: "#22c55e",
  },
  tierName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#061d33",
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginTop: 8,
  },
  quantityBtn: {
    backgroundColor: "#fbc02d",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#061d33",
    width: 32,
    textAlign: "center",
  },
  warningText: {
    fontSize: 12,
    color: "#ef4444",
    textAlign: "center",
  },
  checkoutBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  checkoutBtnText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  noTicketsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fca5a5",
    gap: 8,
  },
  noTicketsText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  optionsContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  optionsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionsItemText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
    marginLeft: 12,
  },
  reportModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 24,
  },
  reportModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  reportFormLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4b5563",
    marginTop: 12,
    marginBottom: 6,
  },
  reportTextInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#000000",
    backgroundColor: "#f9fafb",
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 3,
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentedItemActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentedText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  segmentedTextActive: {
    color: "#000000",
  },
  reportActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  reportCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  reportCancelBtnText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "bold",
  },
  reportSubmitBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  reportSubmitBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});