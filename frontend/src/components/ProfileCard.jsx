function ProfileCard() {
  return (
    <div style={{
      background: "#FFFFFF",
      padding: "20px",
      borderRadius: "20px",
      width: "250px",
      textAlign: "center",
      border: "1px solid #E5E7EB",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>
      <img
        src="https://i.pravatar.cc/100"
        alt="profile"
        style={{ width: "80px", borderRadius: "50%", marginBottom: "10px" }}
      />
      <h3 style={{ color: "#111827", margin: "0 0 4px" }}>Anand</h3>
      <p style={{ color: "#6B7280", margin: "0 0 12px" }}>Traveler Explorer ✈️</p>
      <div style={{ marginTop: "15px" }}>
        <p style={{ color: "#374151" }}>Trips: 12</p>
        <p style={{ color: "#374151" }}>Bookings: 8</p>
      </div>
    </div>
  );
}

export default ProfileCard;