import sys
import io
import requests
import json

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:5000"

def test_reviews_complete_flow():
    print("==================================================")
    print("TEST: REVIEWS SYSTEM & SUBMISSION FLOW VERIFICATION")
    print("==================================================")

    # 1. Test fetching reviews
    print("\n[Step 1: Test GET /api/reviews]")
    res = requests.get(f"{BASE_URL}/api/reviews")
    assert res.status_code == 200, f"Failed GET /api/reviews: {res.text}"
    initial_reviews = res.json()
    print(f"  [OK] Successfully retrieved {len(initial_reviews)} reviews from database.")

    # 2. Test submitting review for Maldives
    print("\n[Step 2: Submit Review for Maldives -> Paradise Island Resort]")
    maldives_payload = {
        "email": "traveler.maldives@test.com",
        "user": "Aarav Patel",
        "destinationId": "3",
        "destinationName": "Maldives",
        "hotelId": "11",
        "hotelName": "Paradise Island Resort",
        "hostelName": "Paradise Island Resort",
        "rating": "5",
        "text": "Stunning water villas and excellent snorkeling! Staff was exceptionally hospitable.",
        "type": "Text"
    }
    submit_res = requests.post(f"{BASE_URL}/submit-review", json=maldives_payload)
    assert submit_res.status_code in (200, 201), f"Submit review failed: {submit_res.text}"
    submit_data = submit_res.json()
    print(f"  [OK] Review submitted successfully! Review ID: {submit_data.get('reviewId')}")
    assert submit_data.get("review", {}).get("sentiment") == "Positive", "Sentiment analysis should be Positive"

    # 3. Test submitting review for Bali
    print("\n[Step 3: Submit Review for Bali -> The Apurva Kempinski Bali]")
    bali_payload = {
        "email": "traveler.bali@test.com",
        "user": "Maya Wong",
        "destinationId": "1",
        "destinationName": "Bali, Indonesia",
        "hotelId": "6",
        "hotelName": "The Apurva Kempinski Bali",
        "hostelName": "The Apurva Kempinski Bali",
        "rating": "5",
        "text": "Incredible infinity pool and traditional Balinese spa. A magical experience from start to finish.",
        "type": "Text"
    }
    bali_res = requests.post(f"{BASE_URL}/submit-review", json=bali_payload)
    assert bali_res.status_code in (200, 201), f"Bali review submit failed: {bali_res.text}"
    print(f"  [OK] Bali review submitted successfully! Review ID: {bali_res.json().get('reviewId')}")

    # 4. Validation Tests: Missing fields and mismatches
    print("\n[Step 4: Validation Tests]")
    
    # Missing destination
    no_dest = dict(maldives_payload)
    del no_dest["destinationId"]
    del no_dest["destinationName"]
    r = requests.post(f"{BASE_URL}/submit-review", json=no_dest)
    assert r.status_code == 400, f"Expected 400 for missing destination, got {r.status_code}"
    print(f"  [OK] Missing destination rejected: {r.json().get('message')}")

    # Missing hotel
    no_hotel = dict(maldives_payload)
    del no_hotel["hotelId"]
    del no_hotel["hotelName"]
    del no_hotel["hostelName"]
    r = requests.post(f"{BASE_URL}/submit-review", json=no_hotel)
    assert r.status_code == 400, f"Expected 400 for missing hotel, got {r.status_code}"
    print(f"  [OK] Missing hotel rejected: {r.json().get('message')}")

    # Missing review text
    no_text = dict(maldives_payload)
    no_text["text"] = ""
    r = requests.post(f"{BASE_URL}/submit-review", json=no_text)
    assert r.status_code == 400, f"Expected 400 for empty review text, got {r.status_code}"
    print(f"  [OK] Empty review text rejected: {r.json().get('message')}")

    # Invalid rating
    invalid_rating = dict(maldives_payload)
    invalid_rating["rating"] = "10"
    r = requests.post(f"{BASE_URL}/submit-review", json=invalid_rating)
    assert r.status_code == 400, f"Expected 400 for invalid rating score, got {r.status_code}"
    print(f"  [OK] Invalid rating score rejected: {r.json().get('message')}")

    # Cross-destination mismatch (Maldives + Paris hotel)
    mismatch_payload = {
        "email": "tester@test.com",
        "user": "Tester",
        "destinationId": "3",
        "destinationName": "Maldives",
        "hotelId": "16",
        "hotelName": "Hôtel Plaza Athénée",
        "hostelName": "Hôtel Plaza Athénée",
        "rating": "5",
        "text": "Great stay!"
    }
    r = requests.post(f"{BASE_URL}/submit-review", json=mismatch_payload)
    assert r.status_code == 400, f"Expected 400 for destination mismatch, got {r.status_code}"
    print(f"  [OK] Destination/Hotel mismatch rejected: {r.json().get('message')}")

    # 5. Verify review persistence after submission
    print("\n[Step 5: Verify Persistence in GET /api/reviews]")
    res2 = requests.get(f"{BASE_URL}/api/reviews")
    all_revs = res2.json()
    assert len(all_revs) >= len(initial_reviews) + 2, f"Reviews list did not reflect new submissions: {len(all_revs)}"
    
    found_maldives = any(r.get("text") == maldives_payload["text"] for r in all_revs)
    found_bali = any(r.get("text") == bali_payload["text"] for r in all_revs)
    assert found_maldives, "Submitted Maldives review not found in all reviews list"
    assert found_bali, "Submitted Bali review not found in all reviews list"
    print("  [OK] All newly submitted reviews successfully verified in database query.")

    print("\n==================================================")
    print("REVIEWS SYSTEM FLOW 100% VERIFIED AND PASSING")
    print("==================================================")

if __name__ == "__main__":
    test_reviews_complete_flow()
