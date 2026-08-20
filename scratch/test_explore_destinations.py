import sys
import io
import requests
import json

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:5000"

DESTINATIONS = [
    {"id": "1", "name": "Bali, Indonesia"},
    {"id": "2", "name": "Paris, France"},
    {"id": "3", "name": "Maldives"},
    {"id": "4", "name": "Rajasthan, India"},
    {"id": "5", "name": "Tokyo, Japan"},
    {"id": "6", "name": "Santorini, Greece"},
    {"id": "7", "name": "Dubai, UAE"},
    {"id": "8", "name": "Switzerland"},
    {"id": "9", "name": "Kerala, India"},
    {"id": "10", "name": "Singapore"},
    {"id": "11", "name": "Rome, Italy"},
    {"id": "12", "name": "New York City, USA"}
]

def test_explore_destinations_flow():
    print("==================================================")
    print("TEST: EXPLORE DESTINATIONS & HOTEL DETAILS FLOW")
    print("==================================================")

    for d in DESTINATIONS:
        dest_id = d["id"]
        dest_name = d["name"]
        print(f"\n[Testing Destination ID: {dest_id} - {dest_name}]")
        
        # 1. Query backend hotels for this destination
        res = requests.get(f"{BASE_URL}/api/hotels?destinationId={dest_id}")
        assert res.status_code == 200, f"Failed to fetch hotels for {dest_name}: {res.text}"
        hotels = res.json()
        
        assert len(hotels) > 0, f"No hotels returned for destination {dest_name} (ID: {dest_id})"
        print(f"  [OK] Found {len(hotels)} destination-specific hotels:")
        for h in hotels:
            print(f"    - {h.get('name')} | Rating: {h.get('rating')} | Price: {h.get('pricePerNight')} (destinationId: {h.get('destinationId')})")
            assert str(h.get("destinationId")) == dest_id, f"Hotel {h.get('name')} has mismatch destinationId: {h.get('destinationId')} != {dest_id}"
            
        # 2. Verify booking a hotel from this destination
        first_hotel = hotels[0]
        hotel_id = first_hotel.get("_id") or first_hotel.get("id")
        
        booking_payload = {
            "userEmail": f"traveler_{dest_id}@test.com",
            "customerName": f"Traveler {dest_name.split(',')[0]}",
            "hotelId": hotel_id,
            "hotelName": first_hotel.get("name"),
            "destinationId": dest_id,
            "destinationName": dest_name,
            "checkIn": "2026-10-01",
            "checkOut": "2026-10-05",
            "rooms": 1,
            "guests": 2
        }
        
        book_res = requests.post(f"{BASE_URL}/book-hotel", json=booking_payload)
        assert book_res.status_code in (200, 201), f"Failed booking for {dest_name}: {book_res.text}"
        book_data = book_res.json()
        print(f"  [OK] Booking successful for {first_hotel.get('name')} -> Booking ID: {book_data.get('bookingId')}")

    print("\n==================================================")
    print("ALL 12 DESTINATIONS VERIFIED SUCCESSFULLY (100%)")
    print("==================================================")

if __name__ == "__main__":
    test_explore_destinations_flow()
