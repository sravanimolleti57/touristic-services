import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ value, onChange, placeholder = "Search destinations, hotels, or flights..." }) {
  return (
    <div style={{
      position: "relative",
      maxWidth: 600,
      width: "100%"
    }}>
      <FaSearch style={{
        position: "absolute",
        left: 16,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8"
      }} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "14px 20px 14px 48px",
          background: "rgba(30, 41, 59, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 12,
          color: "#fff",
          fontSize: "1rem",
          outline: "none"
        }}
      />
    </div>
  );
}
