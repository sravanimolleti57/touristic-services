import React, { useState } from "react";
import SharedNavbar from "../components/SharedNavbar";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaCheckCircle,
  FaGlobe
} from "react-icons/fa";
import "../styles/shared.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) return;
    
    // Display UI-only success snackbar
    setShowToast(true);
    setFormData({ fullName: "", email: "", subject: "", message: "" });

    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  const infoCards = [
    {
      icon: <FaEnvelope style={{ color: "#2563EB", fontSize: "22px" }} />,
      title: "Email Us",
      value: "support@travelai.com",
      subtext: "Response within 24 hours",
      bg: "rgba(37, 99, 235, 0.08)",
    },
    {
      icon: <FaPhoneAlt style={{ color: "#0EA5E9", fontSize: "22px" }} />,
      title: "Call Us",
      value: "+1 (800) 555-0199",
      subtext: "Mon-Fri, 9am - 6pm EST",
      bg: "rgba(14, 165, 233, 0.08)",
    },
    {
      icon: <FaMapMarkerAlt style={{ color: "#6366F1", fontSize: "22px" }} />,
      title: "Visit Us",
      value: "123 Travel Suite, CA",
      subtext: "San Francisco, CA 94105",
      bg: "rgba(99, 102, 241, 0.08)",
    },
    {
      icon: <FaClock style={{ color: "#16A34A", fontSize: "22px" }} />,
      title: "Working Hours",
      value: "Mon - Fri: 9:00 AM - 6:00 PM",
      subtext: "Weekend email support",
      bg: "rgba(22, 163, 74, 0.08)",
    },
  ];

  const socialLinks = [
    { name: "Facebook", icon: <FaFacebookF />, url: "https://facebook.com", color: "#1877F2" },
    { name: "Instagram", icon: <FaInstagram />, url: "https://instagram.com", color: "#E4405F" },
    { name: "X (Twitter)", icon: <FaTwitter />, url: "https://twitter.com", color: "#000000" },
    { name: "LinkedIn", icon: <FaLinkedinIn />, url: "https://linkedin.com", color: "#0A66C2" },
  ];

  return (
    <div className="sr-page" style={{ background: "#F8FAFC", minHeight: "100vh" }}>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <SharedNavbar activeTab="contact" />

      {/* ── Toast Snackbar ─────────────────────────────────── */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "90px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#FFFFFF",
            color: "#065F46",
            border: "1px solid #A7F3D0",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
            borderRadius: "14px",
            padding: "16px 24px",
            animation: "sr-fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#D1FAE5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              color: "#059669",
            }}
          >
            <FaCheckCircle />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "14px", color: "#065F46" }}>Message Sent!</div>
            <div style={{ fontSize: "13px", color: "#047857" }}>Your message has been recorded.</div>
          </div>
        </div>
      )}

      {/* ── Main Content Container ──────────────────────────── */}
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "120px 24px 80px" }}>
        
        {/* ── Hero Section ─────────────────────────────────── */}
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 56px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(37, 99, 235, 0.08)",
              color: "#2563EB",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "16px",
            }}
          >
            <FaGlobe size={13} /> Get In Touch
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 900,
              color: "#111827",
              letterSpacing: "-0.02em",
              margin: "0 0 16px 0",
              lineHeight: 1.15,
            }}
          >
            Contact <span style={{ color: "#2563EB" }}>Us</span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "#4B5563",
              lineHeight: 1.6,
              margin: 0,
              fontWeight: 400,
            }}
          >
            We're here to help. Feel free to reach out with your questions, suggestions, or feedback.
          </p>
        </div>

        {/* ── Contact Info Cards Grid ───────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
            marginBottom: "56px",
          }}
        >
          {infoCards.map((card, idx) => (
            <div
              key={idx}
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "28px 24px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(37, 99, 235, 0.1)";
                e.currentTarget.style.borderColor = "rgba(37, 99, 235, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.04)";
                e.currentTarget.style.borderColor = "#E5E7EB";
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                {card.icon}
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#111827", margin: "0 0 6px 0" }}>
                {card.title}
              </h3>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#2563EB", margin: "0 0 4px 0" }}>
                {card.value}
              </p>
              <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>
                {card.subtext}
              </span>
            </div>
          ))}
        </div>

        {/* ── Contact Form + Map Section ───────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "36px",
            alignItems: "start",
          }}
        >
          {/* Left: Contact Form Card */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              padding: "36px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#111827", margin: "0 0 8px 0" }}>
                Send Us a Message
              </h2>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
                Fill out the form below and our travel support team will get back to you promptly.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Full Name <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D1D5DB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Email Address <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D1D5DB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D1D5DB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Message <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your inquiry or feedback..."
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563EB";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D1D5DB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                  transition: "all 0.25s ease",
                  marginTop: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.25)";
                }}
              >
                <FaPaperPlane size={14} /> Send Message
              </button>
            </form>
          </div>

          {/* Right: Map & Social Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Map Container */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
                    Our Headquarters
                  </h3>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>San Francisco, California</span>
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    background: "#F3F4F6",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  Global HQ
                </div>
              </div>

              {/* Map Placeholder Container */}
              <div
                style={{
                  width: "100%",
                  height: "280px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  position: "relative",
                  border: "1px solid #E5E7EB",
                }}
              >
                <iframe
                  title="Google Maps Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.08648216258!2d-122.401349684682!3d37.788235979757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858085d56778f5%3A0xbef0b7f8fa59b48b!2sMarket%20St%2C%20San%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus"
                />
              </div>
            </div>

            {/* Social Links Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                padding: "28px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: "0 0 6px 0" }}>
                Connect With Us
              </h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px 0" }}>
                Follow us on social media for travel tips, destination guides, and special offers.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {socialLinks.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      background: "#F9FAFB",
                      border: "1px solid #F3F4F6",
                      color: "#374151",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "14px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#FFFFFF";
                      e.currentTarget.style.borderColor = "rgba(37, 99, 235, 0.3)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.color = "#2563EB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#F9FAFB";
                      e.currentTarget.style.borderColor = "#F3F4F6";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.color = "#374151";
                    }}
                  >
                    <span style={{ fontSize: "18px", display: "flex", alignItems: "center" }}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        style={{
          background: "#FFFFFF",
          borderTop: "1px solid #E5E7EB",
          padding: "40px 24px",
          marginTop: "60px",
          textAlign: "center",
          color: "#6B7280",
          fontSize: "14px",
          fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        }}
      >
        <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, color: "#111827", fontSize: "18px" }}>
            <span style={{ fontSize: "20px" }}>✈️</span> TravelAI
          </div>
          <div>© 2026 TravelAI. All rights reserved. Your ultimate AI travel partner.</div>
        </div>
      </footer>
    </div>
  );
}
