import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import DestinationDetails from "./pages/DestinationDetails";
import HotelDetails from "./pages/HotelDetails";
import TripBooking from "./pages/TripBooking";

import Reviews from "./pages/Reviews";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import MyHotels from "./pages/MyHotels";
import MyFlights from "./pages/MyFlights";

import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import UserDashboard from "./pages/UserDashboard";

import AdminDashboard from "./pages/AdminDashboard";
import AdminHotels from "./pages/AdminHotels";
import AdminFlights from "./pages/AdminFlights";
import AdminBookings from "./pages/AdminBookings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Entry Landing Page (User / Admin Selection) */}
        <Route path="/" element={<LandingPage />} />

        {/* User Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User Protected Flow */}
        <Route path="/home" element={
          <ProtectedRoute requireUser>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/explore/:placeId" element={<DestinationDetails />} />
        <Route path="/destinations/:placeId" element={<DestinationDetails />} />
        <Route path="/book-trip/:placeId" element={
          <ProtectedRoute requireUser>
            <TripBooking />
          </ProtectedRoute>
        } />
        <Route path="/destinations/:placeId/book" element={
          <ProtectedRoute requireUser>
            <TripBooking />
          </ProtectedRoute>
        } />
        <Route path="/hotel/:hotelId" element={<HotelDetails />} />
        <Route path="/hotel-details/:hotelId" element={<HotelDetails />} />

        {/* User Booking Status Management */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/my-hotels" element={<MyHotels />} />
        <Route path="/my-flights" element={<MyFlights />} />

        {/* Reviews, Dashboard, Profile & Contact */}
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/Dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin Protected Flow */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/hotels" element={
          <ProtectedRoute requireAdmin>
            <AdminHotels />
          </ProtectedRoute>
        } />
        <Route path="/admin/flights" element={
          <ProtectedRoute requireAdmin>
            <AdminFlights />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute requireAdmin>
            <AdminBookings />
          </ProtectedRoute>
        } />

        {/* Fallback Route */}
        <Route path="*" element={<LandingPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
