import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGlobe, FaPaperPlane, FaLightbulb,
  FaChartBar,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin
} from "react-icons/fa";
import SharedNavbar from "../components/SharedNavbar";
import UserDashboardSection from "../components/UserDashboardSection";
import InteractiveWorldMap from "../components/InteractiveWorldMap";
import "../styles/Home.css";

/* ═══════════════════════════════════════════════════════════════
   DATA & CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const DASHBOARD_STATS = [
  { label: "Destinations", value: "120+", icon: "🗺️", color: "#3b82f6" },
  { label: "Hotels", value: "800+", icon: "🏨", color: "#8b5cf6" },
  { label: "Flights", value: "350+", icon: "✈️", color: "#06b6d4" },
  { label: "Reviews", value: "50K+", icon: "⭐", color: "#f59e0b" },
  { label: "AI Predictions", value: "10K+", icon: "🧠", color: "#22c55e" },
  { label: "Satisfaction", value: "96%", icon: "😊", color: "#ec4899" },
];

const TRAVEL_TIPS = [
  { icon: "💡", title: "Book in Advance", text: "AI analysis shows booking 45 days ahead saves you up to 30% on flights and hotels." },
  { icon: "🎒", title: "Pack Smart", text: "Our data recommends packing layers for European trips — weather varies widely across cities." },
  { icon: "📱", title: "Go Digital", text: "Download offline maps and keep digital copies of all travel documents for stress-free trips." },
  { icon: "🌍", title: "Travel Off-Peak", text: "Mid-week departures are 22% cheaper on average. AI detected best rates on Tuesdays." },
];

/* ═══════════════════════════════════════════════════════════════
   HOOKS: Scroll Animations
   ═══════════════════════════════════════════════════════════════ */
function useScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HOME PAGE (UNIFIED DASHBOARD + HOME EXPERIENCE)
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useScrollAnimations();

  const goToTab = (tab) => navigate(`/search?tab=${tab}`);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="home-page" style={{ paddingTop: 64, background: "#F8FAFC", minHeight: "100vh" }}>

      {/* ── SHARED TOP NAVBAR ── */}
      <SharedNavbar activeTab="home" />

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: UNIFIED USER DASHBOARD SECTION AT TOP
          ═══════════════════════════════════════════════════════ */}
      <UserDashboardSection />

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: REMAINING HOME PAGE CONTENT
          ═══════════════════════════════════════════════════════ */}

      {/* 2.1 PLATFORM STATISTICS */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaChartBar /> Platform Statistics</div>
              <h2 className="hp-section-title" style={{ fontSize: 26 }}>TravelAI by the Numbers</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Real-time metrics powering our global travel intelligence platform.
              </p>
            </div>
          </div>

          <div className="stats-grid">
            {DASHBOARD_STATS.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.2 INTERACTIVE WORLD MAP */}
      <InteractiveWorldMap />

      {/* 2.3 TRAVEL TIPS */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaLightbulb color="#f59e0b" /> Daily AI Tips</div>
              <h2 className="hp-section-title" style={{ fontSize: 26 }}>Travel Tips</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                AI-generated travel tips based on analysis of thousands of journeys.
              </p>
            </div>
          </div>

          <div className="tips-grid">
            {TRAVEL_TIPS.map(t => (
              <div key={t.title} className="tip-card">
                <div className="tip-icon">{t.icon}</div>
                <h3 className="tip-title">{t.title}</h3>
                <p className="tip-text">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2.4 NEWSLETTER */}
      <section className="hp-section newsletter-section animate-on-scroll">
        <div className="hp-container">
          <div className="newsletter-content">
            <div className="hp-section-tag" style={{ justifyContent: "center" }}><FaPaperPlane /> Stay Updated</div>
            <h2 className="hp-section-title" style={{ textAlign: "center", fontSize: 26 }}>Subscribe to Travel Insights</h2>
            <p className="hp-section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
              Get weekly AI-curated travel deals, destination guides, and exclusive offers.
            </p>

            {newsletterSubmitted ? (
              <div style={{
                marginTop: 20, padding: "16px 20px", borderRadius: 16,
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e", fontWeight: 700, fontSize: 14, textAlign: "center",
              }}>
                ✅ Thank you for subscribing! You'll receive our next issue soon.
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary">
                  <FaPaperPlane size={14} /> Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="home-footer">
        <div className="hp-container">
          <div className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div className="nav-brand-icon" style={{ width: 36, height: 36, fontSize: 18 }}>✈️</div>
                <div className="nav-brand-text" style={{ fontSize: 16 }}>TravelAI</div>
              </div>
              <p className="footer-brand-text">
                AI-powered tourism platform analyzing 50,000+ reviews to help you discover the perfect destinations, hotels, and flights worldwide.
              </p>
              <div className="footer-social">
                <div className="footer-social-icon"><FaFacebook /></div>
                <div className="footer-social-icon"><FaTwitter /></div>
                <div className="footer-social-icon"><FaInstagram /></div>
                <div className="footer-social-icon"><FaLinkedin /></div>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-links">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Press</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-links">
                <li>FAQ</li>
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Explore</h4>
              <ul className="footer-links">
                <li onClick={() => goToTab("places")}>Destinations</li>
                <li onClick={() => goToTab("hotels")}>Hotels</li>
                <li onClick={() => goToTab("flights")}>Flights</li>
                <li onClick={() => navigate("/reviews")}>Reviews</li>
                <li onClick={() => navigate("/contact")}>Contact Us</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            © 2026 TravelAI. All rights reserved. Powered by AI Sentiment Analysis Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
