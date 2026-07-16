import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import DestinationDetails from "./pages/DestinationDetails";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/explore/:placeId" element={<DestinationDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
