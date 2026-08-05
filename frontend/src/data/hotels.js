/**
 * Single Source of Truth for Hotels across the application.
 */

export const HOTELS_LIST = [
  { id: "h1", name: "The Leela Palace", location: "New Delhi, India", rating: 4.9, price: "₹28,000/night", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80" },
  { id: "h2", name: "Taj Mahal Palace", location: "Mumbai, India", rating: 4.8, price: "₹35,000/night", img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80" },
  { id: "h3", name: "Oberoi Udaivilas", location: "Udaipur, India", rating: 4.9, price: "₹55,000/night", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80" },
  { id: "h4", name: "ITC Grand Chola", location: "Chennai, India", rating: 4.7, price: "₹22,000/night", img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80" },
  { id: "h5", name: "Six Senses Vana", location: "Dehradun, India", rating: 4.8, price: "₹42,000/night", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80" },
  { id: "h6", name: "Amanbagh Resort", location: "Alwar, Rajasthan", rating: 4.7, price: "₹38,000/night", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80" },
  { id: "h7", name: "Zostel Hotel Jaipur", location: "Jaipur, Rajasthan", rating: 4.8, price: "₹2,500/night", img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80" },
  { id: "h8", name: "GoStops Hotel Rishikesh", location: "Rishikesh, Uttarakhand", rating: 4.6, price: "₹2,100/night", img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80" },
  { id: "h9", name: "The Hosteller Goa", location: "Anjuna, Goa", rating: 4.7, price: "₹3,200/night", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80" },
  { id: "h10", name: "Moustache Hotel Manali", location: "Manali, Himachal Pradesh", rating: 4.5, price: "₹2,800/night", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80" }
];

export function getHotelByName(name) {
  if (!name) return HOTELS_LIST[0];
  const found = HOTELS_LIST.find(h => h.name.toLowerCase() === name.toLowerCase());
  return found || { id: "custom", name, location: "India", rating: 4.8, price: "₹5,000/night", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80" };
}
