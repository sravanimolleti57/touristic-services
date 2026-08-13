import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import {
  FaChartLine, FaHourglassHalf, FaCheckCircle, FaHotel, FaPlane,
  FaArrowRight, FaClock, FaCheck, FaExclamationCircle, FaUser
} from "react-icons/fa";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    hotelBookings: 0,
    flightBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/bookings/all");
      if (res.data) {
        setStats(res.data.stats || {});
        setRecentBookings((res.data.bookings || []).slice(0, 6));
      }
    } catch (err) {
      console.warn("Error loading admin dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #090d16 0%, #0f172a 100%)",
        color: "#ffffff",
        padding: "110px 40px 60px",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Dashboard Header */}
          <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#a855f7", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                <FaChartLine /> System Control & Analytics
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#ffffff" }}>
                Admin Management Hub
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Review real-time hotel & flight reservation requests and approve pending bookings.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => navigate("/admin/hotels")}
                style={{
                  padding: "12px 20px", borderRadius: 12,
                  background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                  color: "#ffffff", fontWeight: 700, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 14
                }}
              >
                <FaHotel /> Hotel Approvals
              </button>
              <button
                onClick={() => navigate("/admin/flights")}
                style={{
                  padding: "12px 20px", borderRadius: 12,
                  background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)",
                  color: "#ffffff", fontWeight: 700, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 14
                }}
              >
                <FaPlane /> Flight Approvals
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 20,
            marginBottom: 36
          }}>
            {/* Card 1: Total Bookings */}
            <div style={{
              background: "rgba(30, 41, 59, 0.6)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 18, padding: "24px 20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Total Bookings</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaChartLine />
                </div>
              </div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#ffffff" }}>{stats.totalBookings || 0}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>System reservation requests</div>
            </div>

            {/* Card 2: Pending Approvals */}
            <div style={{
              background: "rgba(30, 41, 59, 0.6)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: 18, padding: "24px 20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>Pending Approval</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaHourglassHalf />
                </div>
              </div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#f59e0b" }}>{stats.pendingBookings || 0}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Awaiting admin confirmation</div>
            </div>

            {/* Card 3: Confirmed Bookings */}
            <div style={{
              background: "rgba(30, 41, 59, 0.6)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: 18, padding: "24px 20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Confirmed Bookings</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaCheckCircle />
                </div>
              </div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#10b981" }}>{stats.confirmedBookings || 0}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Confirmed & emails dispatched</div>
            </div>

            {/* Card 4: Hotel Bookings */}
            <div style={{
              background: "rgba(30, 41, 59, 0.6)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: 18, padding: "24px 20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#3b82f6", fontWeight: 600 }}>Hotel Bookings</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaHotel />
                </div>
              </div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#3b82f6" }}>{stats.hotelBookings || 0}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Hotel stays reserved</div>
            </div>

            {/* Card 5: Flight Bookings */}
            <div style={{
              background: "rgba(30, 41, 59, 0.6)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: 18, padding: "24px 20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#a855f7", fontWeight: 600 }}>Flight Bookings</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaPlane />
                </div>
              </div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#a855f7" }}>{stats.flightBookings || 0}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Flight tickets requested</div>
            </div>
          </div>

          {/* Recent Reservations Feed */}
          <div style={{
            background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 24, padding: "28px 32px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Recent Booking Activity</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Latest customer reservation submissions</p>
              </div>
              <button
                onClick={() => navigate("/admin/bookings")}
                style={{
                  background: "none", border: "none", color: "#a855f7", cursor: "pointer",
                  fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6
                }}
              >
                View All Bookings <FaArrowRight />
              </button>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading dashboard overview...</div>
            ) : recentBookings.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                <FaExclamationCircle size={32} style={{ marginBottom: 8 }} />
                <div>No recent bookings found. Make a booking as a User to test the admin approval flow!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recentBookings.map((b) => {
                  const isPending = b.status === "Pending";
                  const isHotel = b.bookingType === "hotel";
                  const itemName = b.hotelName || b.flightName || "Reservation";

                  return (
                    <div
                      key={b._id}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)", borderRadius: 14,
                        padding: "16px 20px", border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        flexWrap: "wrap", gap: 16
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 12,
                          background: isHotel ? "rgba(59, 130, 246, 0.15)" : "rgba(168, 85, 247, 0.15)",
                          color: isHotel ? "#3b82f6" : "#a855f7",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                        }}>
                          {isHotel ? <FaHotel /> : <FaPlane />}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>{itemName}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                            <span><FaUser size={10} /> {b.customerName || b.userEmail}</span>
                            <span>•</span>
                            <span>{isHotel ? `Check-in: ${b.checkIn}` : `Date: ${b.departureDate || b.travelDate}`}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#38bdf8" }}>{b.price}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>ID: {String(b._id).slice(-8)}</div>
                        </div>

                        <span style={{
                          padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800,
                          background: isPending ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          color: isPending ? "#f59e0b" : "#10b981",
                          border: isPending ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                          display: "inline-flex", alignItems: "center", gap: 6
                        }}>
                          {isPending ? <FaClock size={11} /> : <FaCheck size={11} />}
                          {b.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
