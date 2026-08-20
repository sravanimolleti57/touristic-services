import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  FaSearch, FaTimes, FaSpinner, FaMapMarkerAlt,
  FaHotel, FaPlane, FaSuitcase, FaHiking, FaArrowRight
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:5000";

/**
 * High-performance, universal Search Autocomplete component.
 * Supports:
 * - Real-time backend querying from live database
 * - Client-side localData filtering
 * - Debouncing & request cancellation
 * - Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 * - Click outside detection
 * - Clear button (✕)
 * - Custom styling & type scoping ("all" | "destinations" | "hotels" | "activities" | "travel" | "packages")
 */
export default function SearchAutocomplete({
  value = "",
  onChange,
  onSelect,
  onSubmit,
  onClear,
  placeholder = "Search destinations, hotels, activities...",
  type = "all", // all | destinations | hotels | activities | travel | packages | custom
  localData = null, // Array for client-side filtering if supplied
  searchFields = ["name", "title", "location", "city", "country", "category", "email"],
  style = {},
  inputStyle = {},
  dropdownStyle = {},
  icon = null,
  showClear = true,
  minChars = 1,
  debounceMs = 220,
  autoFocus = false,
  disabled = false,
  className = "",
  ariaLabel = "Search input with autocomplete suggestions"
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Filter Local Data (if localData prop passed)
  const filterLocalData = useCallback((query) => {
    if (!localData || !Array.isArray(localData) || !query.trim()) return [];
    const qLower = query.trim().toLowerCase();
    const tokens = qLower.split(/\s+/).filter(Boolean);

    const matches = localData.filter(item => {
      return tokens.every(token => {
        return searchFields.some(field => {
          const val = item[field];
          if (!val) return false;
          return String(val).toLowerCase().includes(token);
        });
      });
    });

    return matches.slice(0, 8).map(item => ({
      id: item._id || item.id || Math.random().toString(),
      title: item.name || item.title || item.customerName || item.guestName || "Result",
      subtitle: item.location || item.city || item.destinationName || item.email || "",
      type: item.type || type || "item",
      icon: item.hotelName ? "🏨" : item.destinationName ? "🌍" : item.activityName ? "🏄" : "🔍",
      badge: item.category || (item.role ? `Role: ${item.role}` : item.status ? `Status: ${item.status}` : ""),
      price: item.price || item.cost || item.pricePerNight ? `₹${item.price || item.cost || item.pricePerNight}` : "",
      rating: item.rating || null,
      raw: item
    }));
  }, [localData, searchFields, type]);

  // Fetch Remote Suggestions with Debounce & Cancellation
  const fetchSuggestions = useCallback((query) => {
    if (!query || query.trim().length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    const trimmedQuery = query.trim();

    // If localData provided, do instant client-side filtering
    if (localData && Array.isArray(localData)) {
      const results = filterLocalData(trimmedQuery);
      setSuggestions(results);
      setIsOpen(true);
      setLoading(false);
      setHighlightedIndex(-1);
      return;
    }

    // Cancel existing in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setLoading(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await axios.get(`${API_BASE}/api/search/suggestions`, {
          params: { q: trimmedQuery, type, limit: 8 },
          signal: controller.signal
        });
        setSuggestions(res.data || []);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.warn("Autocomplete error:", err);
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
        setHighlightedIndex(-1);
      }
    }, debounceMs);
  }, [minChars, localData, filterLocalData, type, debounceMs]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    if (onChange) onChange(nextVal);
    fetchSuggestions(nextVal);
  };

  // Handle Selection of Suggestion
  const handleSelectSuggestion = (item) => {
    const selectedTitle = item.title || "";
    setInputValue(selectedTitle);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onChange) onChange(selectedTitle);
    if (onSelect) {
      onSelect(item, selectedTitle);
    } else if (onSubmit) {
      onSubmit(selectedTitle, item);
    }
  };

  // Handle Clear Button
  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onChange) onChange("");
    if (onClear) onClear();
    if (inputRef.current) inputRef.current.focus();
  };

  // Handle Keyboard Navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter" && onSubmit) {
        e.preventDefault();
        onSubmit(inputValue);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev < suggestions.length - 1 ? prev + 1 : 0;
          scrollHighlightedIntoView(next);
          return next;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev > 0 ? prev - 1 : suggestions.length - 1;
          scrollHighlightedIntoView(next);
          return next;
        });
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        } else if (onSubmit) {
          setIsOpen(false);
          onSubmit(inputValue);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  const scrollHighlightedIntoView = (index) => {
    if (!dropdownRef.current) return;
    const items = dropdownRef.current.querySelectorAll(".autocomplete-item");
    if (items[index]) {
      items[index].scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  // Render Highlighted Match in Text
  const renderHighlightedText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={i} style={{ color: "#2563EB", fontWeight: 800 }}>
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const getTypeIcon = (item) => {
    if (item.icon) return item.icon;
    switch (item.type) {
      case "destination": return "🌍";
      case "hotel": return "🏨";
      case "activity": return "🏄";
      case "travel": return "🚆";
      case "package": return "💼";
      default: return "📍";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`search-autocomplete-container ${className}`}
      style={{
        position: "relative",
        width: "100%",
        fontFamily: "'Inter', system-ui, sans-serif",
        ...style
      }}
    >
      {/* Input wrapper */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        {/* Left Search Icon */}
        <div style={{
          position: "absolute", left: 14, display: "flex", alignItems: "center",
          pointerEvents: "none", color: "#94A3B8", fontSize: 14, zIndex: 2
        }}>
          {icon || <FaSearch />}
        </div>

        {/* The Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.trim().length >= minChars) {
              fetchSuggestions(inputValue);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          autoComplete="off"
          spellCheck="false"
          style={{
            width: "100%",
            padding: "12px 38px 12px 42px",
            borderRadius: 14,
            border: "1px solid #CBD5E1",
            background: "#FFFFFF",
            color: "#0F172A",
            fontSize: 14,
            fontWeight: 500,
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.2s ease",
            boxShadow: isOpen ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
            borderColor: isOpen ? "#3B82F6" : "#CBD5E1",
            ...inputStyle
          }}
        />

        {/* Right Status / Clear Actions */}
        <div style={{
          position: "absolute", right: 12, display: "flex", alignItems: "center",
          gap: 6, zIndex: 2
        }}>
          {loading && (
            <FaSpinner className="fa-spin" style={{ color: "#3B82F6", fontSize: 13 }} />
          )}

          {showClear && inputValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear search"
              style={{
                background: "rgba(148,163,184,0.18)",
                border: "none",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748B",
                fontSize: 10,
                transition: "all 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E2E8F0"; e.currentTarget.style.color = "#0F172A"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.18)"; e.currentTarget.style.color = "#64748B"; }}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* ── Dropdown Suggestions Menu ─────────────────────────── */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 2500,
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            boxShadow: "0 14px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.04)",
            overflow: "hidden",
            maxHeight: 320,
            overflowY: "auto",
            animation: "fadeIn 0.15s ease",
            ...dropdownStyle
          }}
        >
          {loading && suggestions.length === 0 ? (
            <div style={{
              padding: "20px 16px", textAlign: "center", color: "#64748B",
              fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              <FaSpinner className="fa-spin" color="#3B82F6" />
              <span>Searching live database...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div style={{
              padding: "24px 20px", textAlign: "center", color: "#64748B"
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
              <div style={{ fontWeight: 700, color: "#1E293B", fontSize: 13 }}>No matching results found</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                Try searching for a different destination, hotel, or activity.
              </div>
            </div>
          ) : (
            <div style={{ padding: "6px 0" }}>
              {/* Header hint */}
              <div style={{
                padding: "6px 16px 4px", fontSize: 10, fontWeight: 800,
                color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.8px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: "1px solid #F8FAFC"
              }}>
                <span>Suggested Matches ({suggestions.length})</span>
                <span style={{ fontSize: 9, fontWeight: 600 }}>↑↓ to navigate · ↵ to select</span>
              </div>

              {/* Suggestions List */}
              {suggestions.map((item, idx) => {
                const isSelected = highlightedIndex === idx;
                const iconEmoji = getTypeIcon(item);

                return (
                  <div
                    key={item.id || idx}
                    className="autocomplete-item"
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      cursor: "pointer",
                      background: isSelected ? "#F0F7FF" : "transparent",
                      borderLeft: isSelected ? "3px solid #2563EB" : "3px solid transparent",
                      transition: "background 0.1s ease"
                    }}
                  >
                    {/* Left: Icon / Thumbnail + Titles */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: 38, height: 38, borderRadius: 8, objectFit: "cover",
                            flexShrink: 0, border: "1px solid #E2E8F0"
                          }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, background: "#F1F5F9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, flexShrink: 0
                        }}>
                          {iconEmoji}
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700, color: isSelected ? "#1D4ED8" : "#0F172A",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                        }}>
                          {renderHighlightedText(item.title, inputValue)}
                        </div>

                        {item.subtitle && (
                          <div style={{
                            fontSize: 11, color: "#64748B", marginTop: 2,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                          }}>
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Badge / Price / Rating */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {item.price && (
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#059669" }}>
                          {item.price}
                        </span>
                      )}

                      {item.badge && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                          background: item.type === "hotel" ? "#EFF6FF" : item.type === "activity" ? "#FEF3C7" : "#F1F5F9",
                          color: item.type === "hotel" ? "#2563EB" : item.type === "activity" ? "#D97706" : "#475569",
                          border: "1px solid rgba(0,0,0,0.05)"
                        }}>
                          {item.badge}
                        </span>
                      )}

                      {isSelected && (
                        <FaArrowRight size={11} color="#2563EB" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
