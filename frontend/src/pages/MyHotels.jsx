import { useEffect, useState } from "react";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";

export default function MyHotels() {
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/my-hotels/${email}`
      );
      setHotels(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load hotels.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to cancel this hotel booking?"
    );

    if (!ok) return;

    try {
      await axios.delete(
        `http://127.0.0.1:5000/cancel-hotel/${id}`
      );

      fetchHotels();
      alert("Hotel booking cancelled successfully.");
    } catch (err) {
      console.error(err);
      alert("Unable to cancel booking.");
    }
  };

  return (
    <>
      <SharedNavbar />

      <div
        style={{
          paddingTop: "110px",
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "110px 40px 40px",
        }}
      >
        <h1 style={{ marginBottom: 25 }}>🏨 My Hotel Bookings</h1>

        {loading ? (
          <h3>Loading...</h3>
        ) : hotels.length === 0 ? (
          <h3>No hotel bookings found.</h3>
        ) : (
          hotels.map((hotel) => (
            <div
              key={hotel._id}
              style={{
                background: "#1e293b",
                borderRadius: 15,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <h2>{hotel.hotel_name}</h2>

              <p>
                <strong>Location:</strong> {hotel.location}
              </p>

              <p>
                <strong>Check In:</strong> {hotel.check_in}
              </p>

              <p>
                <strong>Check Out:</strong> {hotel.check_out}
              </p>

              <p>
                <strong>Guests:</strong> {hotel.guests}
              </p>

              <button
                onClick={() => cancelBooking(hotel._id)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginTop: 10,
                }}
              >
                Cancel Booking
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}