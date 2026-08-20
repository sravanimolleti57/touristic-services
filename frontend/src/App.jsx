import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

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
import BookingDetails from "./pages/BookingDetails";
import MyTickets from "./pages/MyTickets";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import MyHotels from "./pages/MyHotels";
import MyFlights from "./pages/MyFlights";

import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import UserDashboard from "./pages/UserDashboard";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminHotels from "./pages/AdminHotels";
import AdminDestinations from "./pages/AdminDestinations";
import AdminActivities from "./pages/AdminActivities";
import AdminBookings from "./pages/AdminBookings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>

        {/* Root Authentication Entry (3D Flip Login / Sign Up) */}
        <Route path="/" element={<Login />} />

        {/* User Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<Login />} />

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
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/bookings/:bookingId" element={<BookingDetails />} />
        <Route path="/tickets" element={<MyTickets />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/tickets/:ticketId" element={<MyTickets />} />
        <Route path="/my-hotels" element={<MyHotels />} />
        <Route path="/my-flights" element={<MyFlights />} />

        {/* User Profile, Settings, Help & Contact */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<HelpSupport />} />
        <Route path="/support" element={<HelpSupport />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/Dashboard" element={<UserDashboard />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin Protected Flow */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/hotels" element={
          <ProtectedRoute requireAdmin>
            <AdminHotels />
          </ProtectedRoute>
        } />
        <Route path="/admin/destinations" element={
          <ProtectedRoute requireAdmin>
            <AdminDestinations />
          </ProtectedRoute>
        } />
        <Route path="/admin/activities" element={
          <ProtectedRoute requireAdmin>
            <AdminActivities />
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
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
