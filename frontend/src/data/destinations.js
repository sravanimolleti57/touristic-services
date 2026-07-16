export const PLACES = [
  { id: 1, type: "place", name: "Bali, Indonesia", category: "Beach & Tropical", rating: 4.8, reviews: 2341, price: "₹45,000", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", tags: ["Beach", "Temples", "Culture"], sentiment: "97% Positive", bestTime: "April to October", overview: "A laid-back island paradise with beaches, rice terraces, and vibrant spiritual culture.", reviewsData: [
    { name: "Aarav Sharma", rating: 5, date: "2 days ago", comment: "The sunsets were unreal and the local food was amazing. Perfect for a relaxing escape." },
    { name: "Mia Johnson", rating: 4, date: "1 week ago", comment: "Loved the temple visit and beach clubs. Easy to explore with a great mix of activities." },
    { name: "Kabir Mehta", rating: 5, date: "2 weeks ago", comment: "Beautiful views everywhere. I’d recommend staying longer than planned — there’s so much to see." },
  ], visits: [
    { name: "Uluwatu Temple", highlight: "Cliff-top sunsets and cultural dance shows", time: "Late afternoon" },
    { name: "Tegallalang Rice Terraces", highlight: "Scenic green terraces and photo spots", time: "Morning" },
    { name: "Seminyak Beach", highlight: "Relaxed beach clubs and ocean views", time: "Sunset" },
  ] },
  { id: 2, type: "place", name: "Paris, France", category: "City & Art", rating: 4.7, reviews: 5821, price: "₹1,20,000", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80", tags: ["Romance", "Museums", "Food"], sentiment: "95% Positive", bestTime: "April to June", overview: "A classic city break filled with art, café culture, and iconic landmarks.", reviewsData: [
    { name: "Sophia Martin", rating: 5, date: "3 days ago", comment: "Every corner felt like a movie scene. The museums and cafés were top-tier." },
    { name: "Rahul Verma", rating: 4, date: "6 days ago", comment: "The Seine walk at sunset was my favorite part. Very easy to fall in love with Paris." },
    { name: "Emma Clark", rating: 5, date: "1 month ago", comment: "Great food, iconic sights, and lots of photo spots. Definitely worth the trip." },
  ], visits: [
    { name: "Eiffel Tower", highlight: "Paris skyline views and the city’s signature landmark", time: "Evening" },
    { name: "Louvre Museum", highlight: "World-famous art and history collections", time: "Morning" },
    { name: "Seine River Walk", highlight: "Romantic riverside strolls and bridges", time: "Golden hour" },
  ] },
  { id: 3, type: "place", name: "Maldives", category: "Beach & Luxury", rating: 4.9, reviews: 1892, price: "₹2,50,000", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80", tags: ["Overwater", "Diving", "Luxury"], sentiment: "99% Positive", bestTime: "November to April", overview: "Crystal-clear lagoons, private islands, and luxury stays made for slow travel.", reviewsData: [
    { name: "Neha Kapoor", rating: 5, date: "Yesterday", comment: "A dream destination. The water was unbelievably clear and the resort service was flawless." },
    { name: "Ethan Brown", rating: 5, date: "4 days ago", comment: "We snorkeled every morning and watched sunsets every evening. Pure luxury." },
    { name: "Sara Ali", rating: 4, date: "2 weeks ago", comment: "A bit pricey, but absolutely worth it for the privacy and peace." },
  ], visits: [
    { name: "Snorkeling Lagoon", highlight: "Colorful reef fish and coral gardens", time: "Morning" },
    { name: "Sunset Cruise", highlight: "Dolphin watching and calm open-water views", time: "Sunset" },
    { name: "Overwater Villa Deck", highlight: "Private relaxation above turquoise water", time: "Anytime" },
  ] },
  { id: 4, type: "place", name: "Rajasthan, India", category: "Heritage & Culture", rating: 4.6, reviews: 3109, price: "₹18,000", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80", tags: ["Forts", "Desert", "History"], sentiment: "93% Positive", bestTime: "October to March", overview: "Royal forts, desert landscapes, and colorful markets packed with heritage.", reviewsData: [
    { name: "Priya Singh", rating: 5, date: "5 days ago", comment: "The forts and desert camp made this trip unforgettable. So much history everywhere." },
    { name: "Arjun Nair", rating: 4, date: "1 week ago", comment: "Loved the colors, food, and cultural vibe. Great for a heritage-focused vacation." },
    { name: "Olivia Green", rating: 5, date: "3 weeks ago", comment: "Beautiful palaces and very welcoming locals. A very memorable journey." },
  ], visits: [
    { name: "Amber Fort", highlight: "Majestic fort architecture and hilltop views", time: "Morning" },
    { name: "Hawa Mahal", highlight: "The iconic palace of winds in Jaipur", time: "Late morning" },
    { name: "Jaisalmer Desert Camp", highlight: "Camel rides, dunes, and cultural evenings", time: "Evening" },
  ] },
  { id: 5, type: "place", name: "Tokyo, Japan", category: "City & Technology", rating: 4.8, reviews: 4562, price: "₹95,000", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80", tags: ["Anime", "Food", "Tech"], sentiment: "96% Positive", bestTime: "March to May", overview: "A fast-paced city where futuristic vibes meet ancient tradition.", reviewsData: [
    { name: "Haruto Sato", rating: 5, date: "2 days ago", comment: "Clean, efficient, and endlessly exciting. The food alone is worth the trip." },
    { name: "Ananya Desai", rating: 5, date: "1 week ago", comment: "Loved the mix of temples, anime spots, and neon nightlife. So much energy." },
    { name: "Daniel Lee", rating: 4, date: "2 weeks ago", comment: "Excellent transit and amazing food. I’d go back just for the ramen." },
  ], visits: [
    { name: "Shibuya Crossing", highlight: "The world’s busiest crosswalk and neon energy", time: "Evening" },
    { name: "Senso-ji Temple", highlight: "Historic temple and traditional shopping streets", time: "Morning" },
    { name: "TeamLab Planets", highlight: "Immersive digital art and sensory exhibits", time: "Afternoon" },
  ] },
  { id: 6, type: "place", name: "Santorini, Greece", category: "Island & Romance", rating: 4.7, reviews: 2987, price: "₹1,40,000", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80", tags: ["Sunset", "Whitewash", "Wine"], sentiment: "98% Positive", bestTime: "May to October", overview: "Cliffside villages, famous sunsets, and relaxed island energy all day long.", reviewsData: [
    { name: "Lina Petrova", rating: 5, date: "Yesterday", comment: "The sunsets are as good as everyone says. Absolutely magical and romantic." },
    { name: "Noah Patel", rating: 4, date: "5 days ago", comment: "Great views, delicious wine, and lovely walkable towns. Very relaxing." },
    { name: "Maya Fernandez", rating: 5, date: "3 weeks ago", comment: "One of the most beautiful places I’ve ever visited. The cliff views are unreal." },
  ], visits: [
    { name: "Oia Village", highlight: "Whitewashed lanes and postcard sunsets", time: "Sunset" },
    { name: "Caldera Viewpoints", highlight: "Epic cliff and volcanic sea views", time: "Anytime" },
    { name: "Red Beach", highlight: "Unique volcanic shoreline and photo stops", time: "Morning" },
  ] },
];

export function getPlaceById(id) {
  return PLACES.find((place) => String(place.id) === String(id));
}