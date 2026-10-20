import { createContext, useState, useContext, useEffect } from "react";
import { apiRequest } from "../utils/api";
import { BASE_URL } from "../constants/Api";

const TicketContext = createContext();

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState([
    {
      id: "h1",
      title: "Oasis - Concert",
      date: "Sat, June 15, 2026",
      location: "Kota Bogor, Jawa Barat",
      image: null,
      tier: "Regular",
      quantity: 1,
      ticketPrice: 150000,
      admFee: 0,
      totalPrice: 150000,
      bookingCode: "17063",
      transactionRef: "TKT/OAS/48060",
      paymentMethod: "GOPAY",
      orderDate: "30-04-2026 08:33 WIB",
    },
    {
      id: "h2",
      title: "Oasis - Concert",
      date: "Sat, June 15, 2026",
      location: "Kota Bogor, Jawa Barat",
      image: null,
      tier: "VIP",
      quantity: 2,
      ticketPrice: 300000,
      admFee: 0,
      totalPrice: 600000,
      bookingCode: "35412",
      transactionRef: "TKT/OAS/51294",
      paymentMethod: "GOPAY",
      orderDate: "02-05-2026 12:15 WIB",
    },
  ]);

  const [wishlist, setWishlist] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [reports, setReports] = useState([
    {
      id: "r1",
      from: "User 1",
      complaint: "Toxic",
      to: "User 2",
      event: "Radiohead...",
      date: "02 - 10 - 2015",
      type: "user",
    },
    {
      id: "r2",
      from: "User 2",
      complaint: "Toxic",
      to: "User 3",
      event: "Oasis - Concert",
      date: "02 - 10 - 2015",
      type: "user",
    },
    {
      id: "r3",
      from: "User 3",
      complaint: "Toxic",
      to: "Organizer 3",
      event: "Oasis - Concert",
      date: "02 - 10 - 2015",
      type: "user",
    },
    {
      id: "r4",
      from: "User 4",
      complaint: "Toxic",
      to: "Organizer 4",
      event: "Oasis - Concert",
      date: "02 - 10 - 2015",
      type: "user",
    },
    {
      id: "r5",
      from: "User 5",
      complaint: "Toxic",
      to: "User 5",
      event: "Paramore - Concert",
      date: "02 - 10 - 2015",
      type: "user",
    },
  ]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("/events");
      if (response && response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat events dari API:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!user?.user_id) return;
      const response = await apiRequest(`/transactions/my?user_id=${user.user_id}`);
      if (response && response.success && response.data.length > 0) {
        const mapped = response.data.map((tx) => ({
          id: tx.transaction_id.toString(),
          title: tx.ticket?.event?.event_title || "Konser",
          date: tx.ticket?.event?.event_date
            ? new Date(tx.ticket.event.event_date).toLocaleDateString("id-ID", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Sat, June 15, 2026",
          location: tx.ticket?.event?.event_location || "Kota Bogor",
          image: tx.ticket?.event?.image ? `${BASE_URL}/uploads/events/${tx.ticket.event.image}` : null,
          tier: tx.ticket?.ticket_category || "Regular",
          quantity: tx.quantity,
          ticketPrice: tx.ticket?.current_price || tx.total_prices / tx.quantity,
          admFee: 0,
          totalPrice: tx.total_prices,
          bookingCode: (tx.transaction_id + 10000).toString(),
          transactionRef: `TKT/TX/${tx.transaction_id}`,
          paymentMethod: "GOPAY",
          orderDate: new Date(tx.order_date).toLocaleString("id-ID") + " WIB",
        }));
        setTickets(mapped);
      }
    } catch (error) {
      console.log("Rute transaksi backend belum di-mount. Menggunakan data lokal.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      fetchTransactions();
    }
  }, [user]);

  const addTicket = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const toggleWishlist = (concertId) => {
    setWishlist((prev) =>
      prev.includes(concertId)
        ? prev.filter((id) => id !== concertId)
        : [...prev, concertId]
    );
  };

  const submitReport = (report) => {
    const newReport = {
      id: `r-${Date.now()}`,
      date: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, " - "),
      ...report,
    };
    setReports((prev) => [newReport, ...prev]);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        addTicket,
        wishlist,
        toggleWishlist,
        events,
        loading,
        refetchEvents: fetchEvents,
        user,
        setUser,
        reports,
        submitReport,
        refetchTransactions: fetchTransactions,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketContext);
}
