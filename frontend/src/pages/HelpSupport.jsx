import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import { useUser, DEFAULT_AVATAR } from "../context/UserContext";
import "../styles/helpSupport.css";
import {
  FaQuestionCircle, FaComments, FaPhoneAlt, FaEnvelope,
  FaShieldAlt, FaTicketAlt, FaCreditCard, FaHotel, FaPlane,
  FaPaperPlane, FaRobot, FaUser, FaArrowLeft, FaChevronDown,
  FaChevronUp, FaHeadset, FaSync, FaCheckCircle,
  FaTimes, FaUndo, FaSuitcase, FaUserEdit, FaStar, FaInfoCircle,
  FaArrowRight, FaClock, FaExchangeAlt
} from "react-icons/fa";

const API_BASE = "http://localhost:5000";

const FAQ_CATEGORIES = [
  { id: "all", name: "All", icon: "🌐" },
  { id: "bookings", name: "Bookings", icon: "📋" },
  { id: "hotels", name: "Hotels", icon: "🏨" },
  { id: "flights", name: "Flights & Tours", icon: "✈️" },
  { id: "payments", name: "Payments", icon: "💳" },
  { id: "tickets", name: "Tickets", icon: "🎟️" },
  { id: "cancellations", name: "Refunds", icon: "🔄" },
  { id: "profile", name: "Account", icon: "👤" }
];

// Curated 10 most useful travel FAQs
const ALL_FAQS = [
  {
    id: "b-1",
    category: "bookings",
    categoryLabel: "Bookings",
    q: "How do I check my booking status?",
    a: "You can check the live status of all reservations anytime under 'My Bookings' from your profile menu. Statuses include Confirmed, Upcoming, In Progress, Completed, or Cancelled."
  },
  {
    id: "b-2",
    category: "bookings",
    categoryLabel: "Bookings",
    q: "Can I modify my travel dates or destination?",
    a: "To request a date adjustment or destination change, submit a support ticket below with your Booking ID, or ask our 24/7 AI Support Assistant for instant live guidance."
  },
  {
    id: "h-1",
    category: "hotels",
    categoryLabel: "Hotels",
    q: "How do I view hotel check-in times & amenities?",
    a: "Standard check-in is at 2:00 PM and check-out is at 11:00 AM. Room preferences, complimentary breakfast, and amenities are detailed on your booking card under 'My Bookings'."
  },
  {
    id: "f-1",
    category: "flights",
    categoryLabel: "Flights & Tours",
    q: "What is included in a tour package?",
    a: "Packages include full flight/hotel itineraries, verified transportation passes, digital QR tickets, and 24/7 travel assistance. View details anytime in 'My Tickets'."
  },
  {
    id: "p-1",
    category: "payments",
    categoryLabel: "Payments",
    q: "Which payment methods are supported?",
    a: "We support Credit/Debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), and Net Banking across 50+ banks via Razorpay's 100% secure payment gateway."
  },
  {
    id: "p-2",
    category: "payments",
    categoryLabel: "Payments",
    q: "Where can I download my payment invoice?",
    a: "Go to 'My Bookings', click 'Payment Details' on any reservation, and download your official printable invoice and Razorpay transaction receipt."
  },
  {
    id: "t-1",
    category: "tickets",
    categoryLabel: "Tickets",
    q: "How do I download my digital QR ticket pass?",
    a: "Navigate to 'My Tickets' from your profile menu to download your PDF boarding pass with scannable QR verification code. No physical printout is required."
  },
  {
    id: "c-1",
    category: "cancellations",
    categoryLabel: "Refunds",
    q: "What is TravelAI's cancellation & refund policy?",
    a: "100% full refund is available when cancelling up to 48 hours prior to check-in. Refunds are credited directly to your original payment method within 3 to 5 business days."
  },
  {
    id: "pr-1",
    category: "profile",
    categoryLabel: "Account",
    q: "How do I update my profile photo or name?",
    a: "Click your avatar in the top-right navbar → Select 'Profile' or 'Settings' → 'Edit Profile'. Changes synchronize across the entire portal, dashboard, and dropdown."
  },
  {
    id: "r-1",
    category: "bookings",
    categoryLabel: "Reviews",
    q: "How do I share a review or feedback?",
    a: "Navigate to the 'Reviews' page from the main navbar or User Dashboard to submit star ratings, written impressions, and verified trip feedback."
  }
];

export default function HelpSupport() {
  const navigate = useNavigate();
  const { user, profileImage } = useUser();
  const localUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = localUser?.email || "";
  const userName = localUser?.name || userEmail.split("@")[0] || "Traveler";

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFaq, setActiveFaq] = useState(null);

  // Contact Support Form State
  const [contactForm, setContactForm] = useState({
    name: userName,
    email: userEmail,
    subject: "",
    message: ""
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketFeedback, setTicketFeedback] = useState(null);

  // AI Chat Assistant State
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello ${userName}! 👋 I'm your TravelAI Support Assistant.\n\nI am connected directly to your live account bookings and tickets. You can ask me:\n• "What is my latest booking?"\n• "Show me my tickets"\n• "How do I cancel my hotel?"\n• "What is my booking status?"\n• "How do I get a refund?"`
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const contactFormRef = useRef(null);
  const chatInputRef = useRef(null);

  // Sync user info if updated
  useEffect(() => {
    if (user?.name || user?.email) {
      setContactForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Auto-scroll AI chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Filtered FAQ List based on category
  const filteredFaqs = useMemo(() => {
    return ALL_FAQS.filter(f => {
      return selectedCategory === "all" || f.category === selectedCategory;
    });
  }, [selectedCategory]);

  // AI Chat Handler
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputMsg.trim() || sending) return;

    const userText = inputMsg.trim();
    setInputMsg("");
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setSending(true);

    try {
      const res = await axios.post(`${API_BASE}/api/ai/support-chat`, {
        message: userText,
        email: userEmail
      });

      if (res.data?.reply) {
        setMessages(prev => [...prev, { sender: "ai", text: res.data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: "ai", text: "I've checked your account details. For immediate assistance with this request, feel free to submit a support ticket below or check 'My Bookings'." }
        ]);
      }
    } catch (err) {
      console.error("AI Support Chat Error:", err);
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: "I'm having trouble connecting to the support server. For urgent help, please email support@travelai.com or call toll-free +91 1800-TRAVEL-AI." }
      ]);
    } finally {
      setSending(false);
    }
  };

  // Reset Chat Conversation
  const handleResetChat = () => {
    setMessages([
      {
        sender: "ai",
        text: `Chat reset. Hello ${userName}! How can I assist you with your bookings, tickets, or travel plans today?`
      }
    ]);
  };

  // Handle Support Form Submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      setTicketFeedback({ type: "error", message: "Please complete all required fields." });
      return;
    }

    setSubmittingTicket(true);
    setTicketFeedback(null);

    try {
      const res = await axios.post(`${API_BASE}/api/support/contact`, contactForm);
      setTicketFeedback({
        type: "success",
        message: res.data?.message || "Your support ticket has been submitted! Our team will respond shortly."
      });
      setContactForm({
        name: userName,
        email: userEmail,
        subject: "",
        message: ""
      });
    } catch (err) {
      console.error("Submit ticket error:", err);
      try {
        await axios.post(`${API_BASE}/contact`, contactForm);
        setTicketFeedback({
          type: "success",
          message: "Support request submitted successfully! We will contact you at " + contactForm.email
        });
        setContactForm({
          name: userName,
          email: userEmail,
          subject: "",
          message: ""
        });
      } catch (err2) {
        setTicketFeedback({
          type: "error",
          message: err.response?.data?.message || "Failed to submit ticket. Please check your internet connection."
        });
      }
    } finally {
      setSubmittingTicket(false);
    }
  };

  const scrollToContact = () => {
    contactFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="help-page">
      <SharedNavbar activeTab="help" />

      {/* Main Page Container */}
      <div className="help-page-container">
        
        {/* 1. Top Header & Breadcrumb */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => navigate("/home")}
              style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12,
                padding: "8px 16px", color: "#334155", fontWeight: 700, fontSize: 13,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)", transition: "all 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.color = "#2563EB"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#334155"; }}
            >
              <FaArrowLeft size={11} /> Back to Home
            </button>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 2px", letterSpacing: "-0.5px" }}>
                Help Center &amp; AI Support
              </h1>
              <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
                How can we help you with your travel?
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#059669",
              fontWeight: 800, background: "#ECFDF5", padding: "8px 16px", borderRadius: 20,
              border: "1px solid #A7F3D0"
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
              24/7 AI &amp; Human Support Online
            </div>
          </div>
        </div>

        {/* 2. Help Categories / Quick Action Cards */}
        <div className="quick-actions">
          <button
            onClick={() => navigate("/my-bookings")}
            className="quick-action-card"
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎫</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>My Bookings</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>View active &amp; completed trips</div>
          </button>

          <button
            onClick={() => navigate("/tickets")}
            className="quick-action-card"
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎟️</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>My Tickets</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Download digital QR passes</div>
          </button>

          <button
            onClick={() => setSelectedCategory("payments")}
            className="quick-action-card"
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>💳</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>Payment Help</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Invoices &amp; Razorpay guides</div>
          </button>

          <button
            onClick={() => setSelectedCategory("cancellations")}
            className="quick-action-card"
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔄</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>Refund Policy</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>48h free cancellation rules</div>
          </button>

          <button
            onClick={scrollToContact}
            className="quick-action-card"
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>✉️</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>Contact Desk</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Submit a support ticket</div>
          </button>
        </div>

        {/* 3. MAIN SUPPORT SECTION: FAQ Left (40%) + Chatbot Right (60%) with Equal 650px Height */}
        <div className="main-support-grid">
          
          {/* LEFT COLUMN: FAQ Card (Height: 650px, Scrollable List) */}
          <div className="faq-card">
            {/* Fixed FAQ Card Header */}
            <div className="faq-card-header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaQuestionCircle color="#2563EB" /> Frequently Asked Questions
                </h2>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? "article" : "articles"}
                </span>
              </div>

              {/* Compact Category Filter Pills */}
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {FAQ_CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: "5px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                        border: isSelected ? "1px solid #2563EB" : "1px solid #E2E8F0",
                        background: isSelected ? "#EFF6FF" : "#F8FAFC",
                        color: isSelected ? "#2563EB" : "#475569",
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                        transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0
                      }}
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable FAQ Item List inside the 650px container */}
            <div className="faq-card-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map(faq => {
                  const isOpen = activeFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        background: isOpen ? "#FFFFFF" : "#F8FAFC",
                        borderRadius: 12, border: isOpen ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                        overflow: "hidden", transition: "all 0.15s", width: "100%", minWidth: 0, boxSizing: "border-box",
                        boxShadow: isOpen ? "0 4px 12px rgba(37,99,235,0.06)" : "none", flexShrink: 0
                      }}
                    >
                      <div
                        onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                        style={{
                          padding: "11px 14px", cursor: "pointer", display: "flex",
                          justifyContent: "space-between", alignItems: "center",
                          gap: 10, userSelect: "none"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <span style={{ fontSize: 10, background: "#EFF6FF", color: "#2563EB", padding: "2px 6px", borderRadius: 6, fontWeight: 800, flexShrink: 0 }}>
                            {faq.categoryLabel}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: 12.5, color: isOpen ? "#2563EB" : "#0F172A", overflowWrap: "anywhere" }}>
                            {faq.q}
                          </span>
                        </div>
                        {isOpen ? <FaChevronUp size={11} color="#2563EB" style={{ flexShrink: 0 }} /> : <FaChevronDown size={11} color="#64748B" style={{ flexShrink: 0 }} />}
                      </div>

                      {isOpen && (
                        <div style={{
                          padding: "0 14px 12px", fontSize: 12, color: "#475569",
                          lineHeight: 1.55, borderTop: "1px solid #F1F5F9", paddingTop: 10,
                          overflowWrap: "anywhere", wordBreak: "break-word"
                        }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "30px 16px" }}>
                  <FaInfoCircle size={28} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>No FAQ articles in this category</div>
                  <p style={{ fontSize: 12, color: "#64748B", margin: "6px auto 14px" }}>
                    Select "All" to browse all help topics or ask our AI Support Assistant directly!
                  </p>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    style={{
                      padding: "6px 14px", borderRadius: 8, background: "#F1F5F9",
                      border: "1px solid #CBD5E1", color: "#475569", fontWeight: 700, fontSize: 11, cursor: "pointer"
                    }}
                  >
                    View All Categories
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: TravelAI Assistant Card (Height: 650px) */}
          <div className="ai-assistant-card">
            {/* Chat Header */}
            <div style={{
              background: "linear-gradient(135deg, #1E1B4B 0%, #1E40AF 60%, #2563EB 100%)",
              color: "#FFFFFF", padding: "14px 18px", display: "flex",
              alignItems: "center", justifyContent: "space-between", width: "100%", boxSizing: "border-box", flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: "#FFFFFF",
                  color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", flexShrink: 0
                }}>
                  <FaRobot />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    TravelAI Assistant
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Connected to live account &amp; bookings</div>
                </div>
              </div>

              <button
                onClick={handleResetChat}
                title="Reset conversation"
                style={{
                  background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 8, padding: "5px 10px", color: "#FFFFFF",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 4, transition: "background 0.15s", flexShrink: 0
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              >
                <FaUndo size={9} /> Reset
              </button>
            </div>

            {/* Scrollable Chat Messages Container */}
            <div className="chat-messages">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={"chat-message " + (m.sender === "user" ? "user-message" : "ai-message")}
                >
                  {m.text}
                </div>
              ))}

              {sending && (
                <div style={{
                  alignSelf: "flex-start", background: "#FFFFFF", padding: "8px 12px",
                  borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12, color: "#64748B",
                  display: "flex", alignItems: "center", gap: 6, maxWidth: "85%", boxSizing: "border-box"
                }}>
                  <FaSync className="fa-spin" size={11} color="#2563EB" />
                  <span>Looking up your booking details in the database...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick AI Prompt Chips */}
            <div className="chat-prompt-chips">
              {[
                "What is my latest booking?",
                "Show me my tickets",
                "How do I cancel my hotel?",
                "What is my booking status?",
                "How do I get a refund?"
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInputMsg(prompt);
                    chatInputRef.current?.focus();
                  }}
                  className="chat-prompt-chip"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="chat-input-container"
            >
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Ask about your trips, tickets, hotels, refunds..."
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                className="chat-input-field"
              />
              <button
                type="submit"
                disabled={sending || !inputMsg.trim()}
                className="chat-send-btn"
                style={{
                  background: inputMsg.trim() ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "#CBD5E1",
                  cursor: inputMsg.trim() ? "pointer" : "not-allowed"
                }}
              >
                <FaPaperPlane size={11} /> Send
              </button>
            </form>
          </div>

        </div>

        {/* 4. 24/7 Direct Channels */}
        <div style={{
          background: "#FFFFFF", borderRadius: 24, padding: "24px 28px",
          border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          width: "100%", minWidth: 0, boxSizing: "border-box"
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <FaHeadset color="#2563EB" /> 24/7 Direct Channels
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div style={{ background: "#F8FAFC", padding: "16px 18px", borderRadius: 16, border: "1px solid #E2E8F0", minWidth: 0, boxSizing: "border-box" }}>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <FaEnvelope color="#2563EB" /> EMAIL DESK
              </div>
              <strong style={{ fontSize: 14, color: "#0F172A", display: "block" }}>support@travelai.com</strong>
              <div style={{ fontSize: 12, color: "#059669", fontWeight: 700, marginTop: 4 }}>Avg. reply time: &lt; 15 mins</div>
            </div>

            <div style={{ background: "#F8FAFC", padding: "16px 18px", borderRadius: 16, border: "1px solid #E2E8F0", minWidth: 0, boxSizing: "border-box" }}>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <FaPhoneAlt color="#10B981" /> TOLL FREE HOTLINE
              </div>
              <strong style={{ fontSize: 14, color: "#0F172A", display: "block" }}>+91 1800-TRAVEL-AI</strong>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>24/7 Priority Travel Assistance</div>
            </div>
          </div>
        </div>

        {/* 5. Contact Support / Submit a Ticket */}
        <div
          ref={contactFormRef}
          style={{
            background: "#FFFFFF", borderRadius: 24, padding: "28px 32px",
            border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            width: "100%", minWidth: 0, boxSizing: "border-box"
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
              <FaEnvelope color="#2563EB" /> Contact Support / Submit a Ticket
            </h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
              Need personal human assistance with a complex booking, date change, or corporate invoice? Submit your query directly to our senior customer support staff.
            </p>
          </div>

          {ticketFeedback && (
            <div style={{
              padding: "12px 18px", borderRadius: 14, marginBottom: 20, fontSize: 13, fontWeight: 700,
              background: ticketFeedback.type === "success" ? "#ECFDF5" : "#FEF2F2",
              color: ticketFeedback.type === "success" ? "#065F46" : "#991B1B",
              border: ticketFeedback.type === "success" ? "1px solid #A7F3D0" : "1px solid #FECACA",
              display: "flex", alignItems: "center", gap: 8
            }}>
              {ticketFeedback.type === "success" ? <FaCheckCircle color="#10B981" /> : <FaTimes color="#EF4444" />}
              <span>{ticketFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Your Full Name *</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Your Email Address *</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Subject / Issue Category *</label>
              <input
                type="text"
                required
                placeholder="e.g., Booking date change for Goa trip, Invoice receipt query, Payment assistance"
                value={contactForm.subject}
                onChange={e => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Detailed Message *</label>
              <textarea
                required
                rows={4}
                placeholder="Please describe your question or issue in detail including any relevant Booking IDs or dates..."
                value={contactForm.message}
                onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submittingTicket}
                style={{
                  padding: "12px 28px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)", color: "#FFFFFF",
                  fontWeight: 800, fontSize: 13, cursor: submittingTicket ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(37,99,235,0.2)"
                }}
              >
                {submittingTicket ? <FaSync className="fa-spin" /> : <FaPaperPlane />}
                <span>Submit Support Ticket</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
