import React from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaStar, FaWifi, FaSwimmingPool, FaUtensils, FaParking, FaCheckCircle, FaBed } from "react-icons/fa";

export default function HotelDetailsPanel({ hotel }) {
  if (!hotel) return null;

  const amenities = [
    { icon: <FaWifi className="text-sky-400" />, label: "Free Wi-Fi" },
    { icon: <FaSwimmingPool className="text-blue-400" />, label: "Pool" },
    { icon: <FaUtensils className="text-amber-400" />, label: "Dining" },
    { icon: <FaParking className="text-emerald-400" />, label: "Parking" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl space-y-4 text-slate-100 font-sans"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <FaBed className="text-sky-400 text-base" />
        <h3 className="text-sm uppercase tracking-wider font-extrabold text-white">
          Hotel Information
        </h3>
      </div>

      {/* Hotel Image */}
      <div className="relative rounded-xl overflow-hidden shadow-md group">
        <img
          src={hotel.img || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80"}
          alt={hotel.name}
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-800">
          <FaStar /> {hotel.rating || 4.8}
        </div>
      </div>

      {/* Hotel Title & Price */}
      <div>
        <h4 className="text-base font-bold text-white leading-snug">{hotel.name}</h4>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
          <FaMapMarkerAlt className="text-red-400" />
          <span>{hotel.location}</span>
        </p>
        <div className="mt-2 text-sm font-extrabold text-sky-400">
          {hotel.price || "₹28,000/night"}
        </div>
      </div>

      {/* Highlights / Amenities */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Amenities</span>
        <div className="grid grid-cols-2 gap-2">
          {amenities.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-800/60 text-[11px] text-slate-200">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
        <FaCheckCircle className="text-emerald-400 text-sm flex-shrink-0" />
        <span>Verified AI Sentiment Tracked Hotel</span>
      </div>
    </motion.div>
  );
}
