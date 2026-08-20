"""
Hotel and Hotel Booking schema definitions and helper structures for TravelAI.
"""
from datetime import datetime

def format_hotel_document(data):
    """Formats and sanitizes hotel dictionary before insertion or update."""
    now_str = datetime.now().isoformat()
    price_num = float(data.get("pricePerNight", 5000))
    total_rooms = int(data.get("totalRooms", 20))
    
    images = data.get("images") or []
    img_main = data.get("img") or (images[0] if images else "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80")
    if not images and img_main:
        images = [img_main]

    room_types = data.get("roomTypes") or [
        {
            "id": "rt-standard",
            "name": "Standard Deluxe Room",
            "pricePerNight": price_num,
            "totalRooms": total_rooms,
            "availableRooms": total_rooms,
            "maxGuests": int(data.get("maxGuests", 2)),
            "amenities": ["Free Wi-Fi", "Air Conditioning", "King Bed"]
        }
    ]

    dest_id = str(data.get("destinationId", "")).strip()
    dest_name = str(data.get("destinationName", "")).strip()

    return {
        "name": data.get("name", "").strip(),
        "destinationId": dest_id,
        "destinationName": dest_name,
        "city": data.get("city", data.get("location", "").split(",")[0].strip() if "," in data.get("location", "") else ""),
        "location": data.get("location", "").strip(),
        "country": data.get("country", data.get("location", "").split(",")[-1].strip() if "," in data.get("location", "") else "India"),
        "description": data.get("description", f"Luxury accommodation in {data.get('location')}."),
        "rating": float(data.get("rating", 4.8)),
        "reviewsCount": int(data.get("reviewsCount", 100)),
        "pricePerNight": price_num,
        "price": data.get("price") or f"₹{int(price_num):,}/night",
        "img": img_main,
        "images": images,
        "amenities": data.get("amenities") or ["Free High-Speed Wi-Fi", "Air Conditioning", "Swimming Pool", "Restaurant", "Valet Parking", "24/7 Front Desk"],
        "checkInTime": data.get("checkInTime", "14:00"),
        "checkOutTime": data.get("checkOutTime", "11:00"),
        "totalRooms": total_rooms,
        "availableRooms": int(data.get("availableRooms", total_rooms)),
        "roomTypes": room_types,
        "status": data.get("status", "Active"),
        "createdAt": data.get("createdAt", now_str),
        "updatedAt": now_str
    }
