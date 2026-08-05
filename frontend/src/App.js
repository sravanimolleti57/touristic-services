import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import DestinationDetails from "./pages/DestinationDetails";

import Reviews from "./pages/Reviews";
import Booking from "./pages/Booking";
import MyHotels from "./pages/MyHotels";
import MyFlights from "./pages/MyFlights";

import ProfileCard from "./components/ProfileCard";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/explore/:placeId" element={<DestinationDetails />} />

        {/* Booking */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-hotels" element={<MyHotels />} />
        <Route path="/my-flights" element={<MyFlights />} />

        {/* Reviews */}
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/Dashboard" element={<UserDashboard />} />

        {/* Profile */}
        <Route path="/profile" element={<ProfileCard />} />

        {/* Fallback Route */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;