import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ value, onChange, placeholder = "Search destinations, hotels, or flights..." }) {
  return (
    <div style={{ position: "relative", maxWidth: 600, width: "100%" }}>
      <FaSearch style={{
        position: "absolute", left: 16, top: "50%",
        transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none",
      }} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "13px 20px 13px 46px",
          background: "#FFFFFF",
          border: "1px solid #DCE5F2",
          borderRadius: 12,
          color: "#111827",
          fontSize: "1rem",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={e => {
          e.target.style.borderColor = "#2563EB";
          e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)";
        }}
        onBlur={e => {
          e.target.style.borderColor = "#DCE5F2";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
