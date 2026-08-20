import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import {
  FaChartLine, FaHourglassHalf, FaCheckCircle, FaHotel,
  FaArrowRight, FaClock, FaCheck, FaUsers, FaCompass, FaRupeeSign,
  FaClipboardList, FaTimesCircle, FaSuitcaseRolling, FaSyncAlt
} from "react-icons/fa";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalDestinations: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  const fetchDashboardOverview = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/overview");
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn("Error loading admin dashboard stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleQuickApprove = async (bookingId, bType) => {
    try {
      if (bType === "hotel") {
        await axios.post(`http://127.0.0.1:5000/api/admin/bookings/confirm-hotel/${bookingId}`);
      } else {
        await axios.post(`http://127.0.0.1:5000/api/admin/bookings/confirm/${bType || "trip"}/${bookingId}`);
      }
      alert("Booking approved and confirmed successfully!");
      fetchDashboardOverview();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to approve booking.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        color: "#0F172A",
        padding: "100px 36px 60px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>

          {/* Header Banner */}
          <div style={{
            marginBottom: 32, display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 16
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                color: "#2563EB", fontSize: 13, fontWeight: 800, marginBottom: 6
              }}>
                <FaChartLine /> SYSTEM METRICS &amp; PLATFORM OVERVIEW
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#0F172A" }}>
                Admin Management Console
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Real-time control over user accounts, hotel inventories, destination trip packages, and bookings.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={fetchDashboardOverview}
                disabled={refreshing}
                style={{
                  padding: "10px 16px", borderRadius: 10,
                  background: "#FFFFFF", border: "1px solid #E2E8F0",
                  color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}
              >
                <FaSyncAlt className={refreshing ? "spin-icon" : ""} /> {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>

              <button
                onClick={() => navigate("/admin/hotels")}
                style={{
                  padding: "10px 18px", borderRadius: 10,
                  background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                  color: "#FFFFFF", fontWeight: 800, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, fontSize: 13,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
                }}
              >
                <FaHotel /> Hotel Inventory
              </button>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32
          }}>
            {/* Total Users */}
            <div
              onClick={() => navigate("/admin/users")}
              style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18,
                padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Registered Users</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaUsers size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0F172A" }}>{stats.totalUsers || 0}</div>
              <div style={{ fontSize: 12, color: "#2563EB", fontWeight: 600, marginTop: 4 }}>Manage users &rarr;</div>
            </div>

            {/* Total Hotels */}
            <div
              onClick={() => navigate("/admin/hotels")}
              style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18,
                padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Hotels Listed</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaHotel size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0F172A" }}>{stats.totalHotels || 0}</div>
              <div style={{ fontSize: 12, color: "#16A34A", fontWeight: 600, marginTop: 4 }}>Manage inventory &rarr;</div>
            </div>

            {/* Total Destinations */}
            <div
              onClick={() => navigate("/admin/destinations")}
              style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18,
                padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Destinations</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FAF5FF", color: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaCompass size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0F172A" }}>{stats.totalDestinations || 8}</div>
              <div style={{ fontSize: 12, color: "#9333EA", fontWeight: 600, marginTop: 4 }}>View packages &rarr;</div>
            </div>

            {/* Total Bookings */}
            <div
              onClick={() => navigate("/admin/bookings")}
              style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18,
                padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Total Bookings</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaClipboardList size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0F172A" }}>{stats.totalBookings || 0}</div>
              <div style={{ fontSize: 12, color: "#D97706", fontWeight: 600, marginTop: 4 }}>
                {stats.pendingBookings || 0} pending review
              </div>
            </div>

            {/* Confirmed Revenue */}
            <div
              style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18,
                padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Confirmed Revenue</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaRupeeSign size={16} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#059669" }}>
                ₹{Number(stats.totalRevenue || 0).toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{stats.confirmedBookings || 0} confirmed reservations</div>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20,
            padding: "22px 28px", marginBottom: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 16px" }}>
              Admin Fast Access Hub
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {[
                { title: "Manage Users", desc: "View registered users & roles", path: "/admin/users", icon: <FaUsers color="#2563EB" /> },
                { title: "Destinations", desc: "Trip packages & itineraries", path: "/admin/destinations", icon: <FaCompass color="#9333EA" /> },
                { title: "Hotel Inventory", desc: "Manage hotels, pricing & rooms", path: "/admin/hotels", icon: <FaHotel color="#16A34A" /> },
                { title: "Activities & Tours", desc: "Sightseeing experiences & tours", path: "/admin/activities", icon: <FaSuitcaseRolling color="#EA580C" /> },
                { title: "Master Bookings", desc: "Review all reservations & statuses", path: "/admin/bookings", icon: <FaClipboardList color="#D97706" /> },
              ].map(item => (
                <div
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  style={{
                    padding: "14px 18px", borderRadius: 14, background: "#F8FAFC",
                    border: "1px solid #E2E8F0", cursor: "pointer", display: "flex",
                    alignItems: "center", gap: 14, transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#93C5FD"; e.currentTarget.style.background = "#EFF6FF"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                >
                  <div style={{ fontSize: 22 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reservations Feed */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16,
            padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Recent System Bookings &amp; Reservation Requests
                </h3>
                <p style={{ color: "#64748B", fontSize: 12, margin: "2px 0 0" }}>
                  Live feed of newly created hotel stays and destination trips.
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/bookings")}
                style={{
                  background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#2563EB",
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                }}
              >
                View Master Log <FaArrowRight size={10} />
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Loading recent bookings...</div>
            ) : (!stats.recentBookings || stats.recentBookings.length === 0) ? (
              <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>No booking records found in database.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Type</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Booking ID</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Customer Name</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Item / Service</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Stay / Travel Dates</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Amount</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b) => {
                      const isPending = (b.status || "Pending") === "Pending";
                      const isConfirmed = b.status === "Confirmed";
                      const isCancelled = b.status === "Cancelled";
                      const bType = b.bookingType || (b.destinationName ? "trip" : "hotel");
                      const itemName = b.destinationName || b.hotelName || "Reservation";

                      return (
                        <tr key={b._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800,
                              background: bType === "hotel" ? "#EFF6FF" : "#F0FDF4",
                              color: bType === "hotel" ? "#2563EB" : "#16A34A",
                              display: "inline-flex", alignItems: "center", gap: 4
                            }}>
                              {bType === "hotel" ? <FaHotel size={10} /> : <FaSuitcaseRolling size={10} />}
                              {bType.toUpperCase()}
                            </span>
                          </td>

                          <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>
                            #{String(b._id).slice(-8)}
                          </td>

                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0F172A" }}>
                            {b.customerName || b.userEmail || "Customer"}
                          </td>

                          <td style={{ padding: "14px 16px", color: "#334155", fontWeight: 600 }}>
                            {itemName}
                          </td>

                          <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 12 }}>
                            {b.checkIn ? `${b.checkIn} → ${b.checkOut}` : (b.departureDate || b.travelDate || "Scheduled")}
                          </td>

                          <td style={{ padding: "14px 16px", fontWeight: 800, color: "#16A34A" }}>
                            {b.price || `₹${Number(b.totalAmount || 0).toLocaleString("en-IN")}`}
                          </td>

                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 800,
                              background: isConfirmed ? "#DCFCE7" : isPending ? "#FEF3C7" : "#FEE2E2",
                              color: isConfirmed ? "#15803D" : isPending ? "#B45309" : "#DC2626",
                              border: isConfirmed ? "1px solid #86EFAC" : isPending ? "1px solid #FCD34D" : "1px solid #FCA5A5",
                              display: "inline-flex", alignItems: "center", gap: 5
                            }}>
                              {isConfirmed ? <FaCheckCircle size={10} /> : isPending ? <FaClock size={10} /> : <FaTimesCircle size={10} />}
                              {b.status || "Pending"}
                            </span>
                          </td>

                          <td style={{ padding: "14px 16px", textAlign: "center" }}>
                            {isPending ? (
                              <button
                                onClick={() => handleQuickApprove(b._id, bType)}
                                style={{
                                  background: "linear-gradient(135deg, #10B981, #059669)",
                                  border: "none", color: "#FFFFFF", padding: "6px 12px",
                                  borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer",
                                  display: "inline-flex", alignItems: "center", gap: 4
                                }}
                              >
                                <FaCheck size={9} /> Approve
                              </button>
                            ) : (
                              <span style={{ color: "#64748B", fontSize: 11 }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
