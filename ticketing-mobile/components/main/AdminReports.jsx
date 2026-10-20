import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTickets } from "../../context/TicketContext";

export default function AdminReports() {
  const router = useRouter();
  const { reports } = useTickets();
  const [activeTab, setActiveTab] = useState("user"); // "organizer" or "user"
  const [searchQuery, setSearchQuery] = useState("");

  // Filter reports based on segment tab and search query
  const filteredReports = reports.filter((report) => {
    const matchesTab = report.type === activeTab;
    const matchesSearch =
      report.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.complaint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Web Header Row */}
      <View style={styles.webHeader}>
        <View style={styles.logoAndNav}>
          <Text style={styles.logoTextTicke}>
            Ticke<Text style={styles.logoTextTing}>Ting</Text>
          </Text>
          
          <View style={styles.webNav}>
            <Text style={styles.navItem}>Dashboard</Text>
            <Text style={styles.navItem}>Organizers</Text>
            <Text style={styles.navItem}>Events</Text>
            <Text style={styles.navItem}>Orders</Text>
            <Text style={styles.navItem}>Customers</Text>
            <View style={styles.activeNavWrapper}>
              <Text style={styles.navItemActive}>Reports</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
          <Image
            source={require("@/assets/images/avatar.png")}
            style={styles.avatarImage}
          />
        </View>
      </View>

      {/* Main Body Area */}
      <View style={styles.bodyWrapper}>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="#061d33" />
          <Text style={styles.backLinkText}>Kembali ke Profil</Text>
        </TouchableOpacity>

        {/* Search and Filters */}
        <View style={styles.controlsRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Buttons Segment */}
        <View style={styles.segmentedWrapper}>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              activeTab === "organizer" ? styles.segmentItemActive : null,
            ]}
            onPress={() => setActiveTab("organizer")}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === "organizer" ? styles.segmentTextActive : null,
              ]}
            >
              Event organizer Account report
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              activeTab === "user" ? styles.segmentItemActive : null,
            ]}
            onPress={() => setActiveTab("user")}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === "user" ? styles.segmentTextActive : null,
              ]}
            >
              User Account report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table View (Scrollable horizontally and vertically) */}
        <ScrollView style={styles.tableScrollView} horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableBox}>
            {/* Table Header Row */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.columnHeader, { width: 120 }]}>From</Text>
              <Text style={[styles.columnHeader, { width: 140 }]}>Complaint</Text>
              <Text style={[styles.columnHeader, { width: 120 }]}>To</Text>
              <Text style={[styles.columnHeader, { width: 180 }]}>Event</Text>
              <Text style={[styles.columnHeader, { width: 120 }]}>Date</Text>
            </View>

            {/* Table Rows List */}
            <FlatList
              data={filteredReports}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.cellText, { width: 120 }]}>{item.from}</Text>
                  <Text style={[styles.cellText, { width: 140, color: "#1e3a8a", fontWeight: "600" }]}>
                    {item.complaint}
                  </Text>
                  <Text style={[styles.cellText, { width: 120 }]}>{item.to}</Text>
                  <Text style={[styles.cellText, { width: 180 }]}>{item.event}</Text>
                  <Text style={[styles.cellText, { width: 120, color: "#4b5563" }]}>{item.date}</Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyTable}>
                  <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyText}>Tidak ada laporan untuk ditampilkan</Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e7eb",
  },
  webHeader: {
    height: 70,
    backgroundColor: "#061d33",
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoAndNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 36,
  },
  logoTextTicke: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
  },
  logoTextTing: {
    color: "#fbc02d",
  },
  webNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  navItem: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  activeNavWrapper: {
    borderBottomWidth: 2,
    borderBottomColor: "#ffffff",
    paddingBottom: 4,
  },
  navItemActive: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  adminBadge: {
    backgroundColor: "#fbc02d",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  adminBadgeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  bodyWrapper: {
    flex: 1,
    padding: 24,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backLinkText: {
    color: "#061d33",
    fontSize: 14,
    fontWeight: "600",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#000000",
  },
  filterBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 24,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterBtnText: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "600",
  },
  segmentedWrapper: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 6,
    marginBottom: 24,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentItemActive: {
    backgroundColor: "#061d33",
  },
  segmentText: {
    color: "#061d33",
    fontSize: 14,
    fontWeight: "bold",
  },
  segmentTextActive: {
    color: "#ffffff",
  },
  tableScrollView: {
    flex: 1,
  },
  tableBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#3b82f6",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#061d33",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  columnHeader: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  cellText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
  },
  emptyTable: {
    padding: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },
});
