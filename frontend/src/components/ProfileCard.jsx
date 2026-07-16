function ProfileCard() {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "20px",
        width: "250px",
        textAlign: "center",
      }}
    >
      <img
        src="https://i.pravatar.cc/100"
        alt="profile"
        style={{
          width: "80px",
          borderRadius: "50%",
          marginBottom: "10px",
        }}
      />

      <h3>Anand</h3>

      <p>Traveler Explorer ✈️</p>

      <div style={{ marginTop: "15px" }}>
        <p>Trips: 12</p>
        <p>Bookings: 8</p>
      </div>
    </div>
  );
}

export default ProfileCard;