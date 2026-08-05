import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import DestinationDetails from "./pages/DestinationDetails";
<<<<<<< Updated upstream
=======
import HotelDetails from "./pages/HotelDetails";
>>>>>>> Stashed changes

import Reviews from "./pages/Reviews";
import Booking from "./pages/Booking";
import MyHotels from "./pages/MyHotels";
import MyFlights from "./pages/MyFlights";

<<<<<<< Updated upstream
import ProfileCard from "./components/ProfileCard";
import Contact from "./pages/Contact";
=======
<<<<<<<< Updated upstream:frontend/src/App.js
import ProfileCard from "./components/ProfileCard";
import UserDashboard from "./pages/UserDashboard";
========
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/profile";
import Contact from "./pages/Contact";
>>>>>>>> Stashed changes:frontend/src/App.jsx
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======
        <Route path="/hotel/:hotelId" element={<HotelDetails />} />
>>>>>>> Stashed changes

        {/* Booking */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-hotels" element={<MyHotels />} />
        <Route path="/my-flights" element={<MyFlights />} />

        {/* Reviews */}
        <Route path="/reviews" element={<Reviews />} />
<<<<<<< Updated upstream

        {/* Profile & Contact */}
        <Route path="/profile" element={<ProfileCard />} />
=======
        <Route path="/Dashboard" element={<UserDashboard />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/Dashboard" element={<UserDashboard />} />

        {/* Profile & Contact */}
        <Route path="/profile" element={<Profile />} />
>>>>>>> Stashed changes
        <Route path="/contact" element={<Contact />} />

        {/* Fallback Route */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
