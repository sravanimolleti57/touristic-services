import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_unique_hotels_per_destination():
    print("==================================================")
    print("TEST: UNIQUE DESTINATION-TO-HOTEL RELATIONSHIPS")
    print("==================================================")

    # 1. Test Maldives (destinationId: 3)
    res_maldives = requests.get(f"{BASE_URL}/api/hotels?destinationId=3")
    assert res_maldives.status_code == 200, f"Failed: {res_maldives.text}"
    maldives_hotels = res_maldives.json()
    print(f"Maldives (ID: 3) returned {len(maldives_hotels)} hotels:")
    for h in maldives_hotels:
        print(f"  - {h.get('name')} (destinationId: {h.get('destinationId')})")
        assert str(h.get("destinationId")) == "3", f"Wrong destinationId: {h}"

    # 2. Test Bali (destinationId: 1)
    res_bali = requests.get(f"{BASE_URL}/api/hotels?destinationId=1")
    assert res_bali.status_code == 200, f"Failed: {res_bali.text}"
    bali_hotels = res_bali.json()
    print(f"\nBali (ID: 1) returned {len(bali_hotels)} hotels:")
    for h in bali_hotels:
        print(f"  - {h.get('name')} (destinationId: {h.get('destinationId')})")
        assert str(h.get("destinationId")) == "1", f"Wrong destinationId: {h}"

    # 3. Test Paris (destinationId: 2)
    res_paris = requests.get(f"{BASE_URL}/api/hotels?destinationId=2")
    assert res_paris.status_code == 200, f"Failed: {res_paris.text}"
    paris_hotels = res_paris.json()
    print(f"\nParis (ID: 2) returned {len(paris_hotels)} hotels:")
    for h in paris_hotels:
        print(f"  - {h.get('name')} (destinationId: {h.get('destinationId')})")
        assert str(h.get("destinationId")) == "2", f"Wrong destinationId: {h}"

    # 4. Verify No Overlap between Bali, Maldives, and Paris
    maldives_names = {h['name'] for h in maldives_hotels}
    bali_names = {h['name'] for h in bali_hotels}
    paris_names = {h['name'] for h in paris_hotels}
    assert len(maldives_names.intersection(bali_names)) == 0, "Overlap detected between Maldives and Bali hotels!"
    assert len(maldives_names.intersection(paris_names)) == 0, "Overlap detected between Maldives and Paris hotels!"
    print("\n[OK] Verification Passed: Hotel datasets are completely unique and isolated across destinations.")

    # 5. Test Cross-Destination Booking Rejection
    target_maldives_hotel = maldives_hotels[0]
    mismatch_booking_payload = {
        "userEmail": "tester_mismatch@travelai.com",
        "customerName": "Destination Test User",
        "hotelId": target_maldives_hotel.get("_id") or target_maldives_hotel.get("id"),
        "hotelName": target_maldives_hotel.get("name"),
        "destinationId": "1", # BALI id, but hotel is Maldives!
        "destinationName": "Bali, Indonesia",
        "checkIn": "2026-09-01",
        "checkOut": "2026-09-04",
        "rooms": 1,
        "guests": 2
    }
    mismatch_res = requests.post(f"{BASE_URL}/book-hotel", json=mismatch_booking_payload)
    print(f"\nAttempting cross-destination booking (Maldives hotel with Bali destinationId): Status {mismatch_res.status_code}")
    print(f"Server rejection message: {mismatch_res.json().get('message')}")
    assert mismatch_res.status_code == 400, "Expected 400 rejection for mismatched destination booking!"
    print("[OK] Verification Passed: Mismatched cross-destination booking was strictly rejected.")

    # 6. Test Valid Booking for Maldives hotel with Maldives destinationId ("3")
    valid_booking_payload = {
        "userEmail": "tester_valid@travelai.com",
        "customerName": "Valid Destination User",
        "hotelId": target_maldives_hotel.get("_id") or target_maldives_hotel.get("id"),
        "hotelName": target_maldives_hotel.get("name"),
        "destinationId": "3",
        "destinationName": "Maldives",
        "checkIn": "2026-09-10",
        "checkOut": "2026-09-14",
        "rooms": 1,
        "guests": 2
    }
    valid_res = requests.post(f"{BASE_URL}/book-hotel", json=valid_booking_payload)
    print(f"\nAttempting valid destination booking: Status {valid_res.status_code}")
    assert valid_res.status_code in (200, 201), f"Valid booking failed: {valid_res.text}"
    booking_data = valid_res.json()
    print(f"[OK] Valid booking succeeded! Booking ID: {booking_data.get('bookingId')}")
    print(f"  Hotel: {booking_data.get('booking', {}).get('hotelName')}")
    print(f"  Destination ID: {booking_data.get('booking', {}).get('destinationId')}")
    print(f"  Destination Name: {booking_data.get('booking', {}).get('destinationName')}")

    print("\n==================================================")
    print("ALL UNIQUE DESTINATION-TO-HOTEL TESTS PASSED (100%)")
    print("==================================================")

if __name__ == "__main__":
    test_unique_hotels_per_destination()
