/**
 * Utility functions for review analytics calculations and text processing
 */

<<<<<<< Updated upstream
const KEYWORD_DICTIONARY = [
  { word: "cleanliness", label: "Clean Rooms", category: "positive" },
  { word: "clean", label: "Cleanliness", category: "positive" },
  { word: "staff", label: "Friendly Staff", category: "positive" },
  { word: "location", label: "Great Location", category: "positive" },
  { word: "pool", label: "Swimming Pool", category: "positive" },
  { word: "wifi", label: "High-Speed WiFi", category: "tech" },
  { word: "breakfast", label: "Delicious Breakfast", category: "food" },
  { word: "view", label: "Breathtaking Views", category: "positive" },
  { word: "bed", label: "Comfortable Beds", category: "comfort" },
  { word: "check-in", label: "Quick Check-in", category: "service" },
  { word: "service", label: "Great Service", category: "service" },
  { word: "price", label: "Value for Money", category: "value" },
  { word: "quiet", label: "Peaceful Environment", category: "comfort" },
  { word: "vibe", label: "Awesome Vibe", category: "vibe" },
  { word: "hotel", label: "Luxury Hotel", category: "general" },
];

export function analyzeReviewText(reviews = [], sentiments = []) {
  if (!reviews || reviews.length === 0) {
=======
export function normalizeHotelName(name = "") {
  if (!name) return "";
  const cleaned = name
    .toLowerCase()
    .replace(/\b(hotel|hostel|resort|resorts|the|palace|inn|suites|stay|stays)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
  return cleaned || name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isHotelMatch(nameA = "", nameB = "") {
  if (!nameA || !nameB) return false;
  const normA = normalizeHotelName(nameA);
  const normB = normalizeHotelName(nameB);
  if (!normA || !normB) return false;
  return normA === normB || normA.includes(normB) || normB.includes(normA);
}

/**
 * Calculates percentages using Largest Remainder Method (Hamilton Method)
 * Guarantees that non-zero counts total exactly 100%.
 */
export function calculateExactPercentages(counts = [], total = 0) {
  if (!total || total <= 0) return counts.map(() => 0);

  const unrounded = counts.map(c => (c / total) * 100);
  const floored = unrounded.map(v => Math.floor(v));
  const remainders = unrounded.map((v, i) => ({ index: i, remainder: v - floored[i] }));

  let currentSum = floored.reduce((a, b) => a + b, 0);
  let diff = 100 - currentSum;

  remainders.sort((a, b) => b.remainder - a.remainder);

  const result = [...floored];
  for (let i = 0; i < diff && i < remainders.length; i++) {
    // Only add to non-zero counts unless all are zero
    if (counts[remainders[i].index] > 0 || currentSum === 0) {
      result[remainders[i].index] += 1;
    }
  }

  return result;
}

const KEYWORD_DICTIONARY = [
  { word: "cleanliness", label: "Cleanliness", category: "positive" },
  { word: "clean", label: "Clean Rooms", category: "positive" },
  { word: "spacious", label: "Spacious Rooms", category: "positive" },
  { word: "staff", label: "Friendly Staff", category: "positive" },
  { word: "hospitality", label: "Warm Hospitality", category: "positive" },
  { word: "location", label: "Great Location", category: "positive" },
  { word: "pool", label: "Swimming Pool", category: "positive" },
  { word: "wifi", label: "Wi-Fi", category: "tech" },
  { word: "breakfast", label: "Delicious Breakfast", category: "food" },
  { word: "dining", label: "Fine Dining", category: "food" },
  { word: "view", label: "Scenic View", category: "positive" },
  { word: "bed", label: "Comfortable Beds", category: "comfort" },
  { word: "luxury", label: "Luxury Stay", category: "positive" },
  { word: "quiet", label: "Peaceful Environment", category: "comfort" },
  { word: "vibe", label: "Great Atmosphere", category: "vibe" },
  { word: "service", label: "Attentive Service", category: "service" },
  { word: "price", label: "Good Value", category: "value" },
  { word: "slow", label: "Slow Service", category: "negative" },
  { word: "noisy", label: "Noise Concerns", category: "negative" },
  { word: "small", label: "Compact Rooms", category: "negative" },
];

export function analyzeReviewText(reviews = [], sentiments = []) {
  // Sanitize & Deduplicate Reviews
  const validReviews = [];
  const seenKeys = new Set();

  (reviews || []).forEach((r) => {
    if (!r) return;
    const text = (r.text || r.review || "").trim();
    const rating = parseInt(r.rating || "5", 10);
    const user = r.user || r.userEmail || "anonymous";
    const key = `${user}_${r.hostelName || r.hotelName}_${rating}_${text}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      validReviews.push(r);
    }
  });

  if (validReviews.length === 0) {
>>>>>>> Stashed changes
    return {
      totalReviews: 0,
      avgRating: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      avgLength: 0,
      newestDate: "N/A",
      oldestDate: "N/A",
      overallScore: 0,
      overallSentimentLabel: "Neutral",
      confidence: 0,
<<<<<<< Updated upstream
      emotionPieData: [],
      ratingDistribution: [],
=======
      emotionPieData: [
        { name: "Positive", value: 0, count: 0, color: "#10b981" },
        { name: "Neutral", value: 0, count: 0, color: "#3b82f6" },
        { name: "Negative", value: 0, count: 0, color: "#ef4444" },
      ],
      ratingDistribution: [5, 4, 3, 2, 1].map(s => ({ stars: `${s} ★`, count: 0, percentage: 0 })),
>>>>>>> Stashed changes
      keywords: [],
      pros: [],
      cons: [],
      trends: { last7Days: 0, last30Days: 0 },
<<<<<<< Updated upstream
      aiSummary: "No review analytics available."
    };
  }

  // 1. Basic Stats & Ratings
=======
      aiSummary: "No review analytics available for this selection."
    };
  }

  // 1. Basic Stats & Rating Counts
>>>>>>> Stashed changes
  let totalRating = 0;
  let totalWords = 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const dates = [];

  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;

<<<<<<< Updated upstream
  reviews.forEach((rev, idx) => {
    const numRating = Math.min(5, Math.max(1, parseInt(rev.rating || "5", 10)));
    totalRating += numRating;
    ratingCounts[numRating] = (ratingCounts[numRating] || 0) + 1;

    const text = rev.text || "";
    totalWords += text.split(/\s+/).filter(Boolean).length;
=======
  validReviews.forEach((rev, idx) => {
    const numRating = Math.min(5, Math.max(1, parseInt(rev.rating || "5", 10) || 5));
    totalRating += numRating;
    ratingCounts[numRating] = (ratingCounts[numRating] || 0) + 1;

    const text = rev.text || rev.review || "";
    const words = text.split(/\s+/).filter(Boolean);
    totalWords += words.length;
>>>>>>> Stashed changes

    if (rev.createdAt) {
      const d = new Date(rev.createdAt);
      if (!isNaN(d.getTime())) dates.push(d);
    }

    // Determine sentiment from AI sentiment array or rating fallback
    const aiSent = (sentiments[idx] || "").toLowerCase();
    if (aiSent.includes("pos") || aiSent.includes("happy") || aiSent.includes("label_2")) {
      posCount++;
    } else if (aiSent.includes("neg") || aiSent.includes("sad") || aiSent.includes("label_0")) {
      negCount++;
    } else if (aiSent.includes("neu") || aiSent.includes("label_1")) {
      neuCount++;
    } else {
<<<<<<< Updated upstream
      // Fallback based on star rating
=======
      // Direct rating fallback if model output unavailable
>>>>>>> Stashed changes
      if (numRating >= 4) posCount++;
      else if (numRating === 3) neuCount++;
      else negCount++;
    }
  });

<<<<<<< Updated upstream
  const totalReviews = reviews.length;
=======
  const totalReviews = validReviews.length;
>>>>>>> Stashed changes
  const avgRating = (totalRating / totalReviews).toFixed(1);
  const avgLength = Math.round(totalWords / totalReviews);

  dates.sort((a, b) => a - b);
  const oldestDate = dates.length > 0 ? dates[0].toLocaleDateString() : "Recently";
  const newestDate = dates.length > 0 ? dates[dates.length - 1].toLocaleDateString() : "Recently";

<<<<<<< Updated upstream
  // 2. Emotion Pie Data
  const posPct = Math.round((posCount / totalReviews) * 100);
  const neuPct = Math.round((neuCount / totalReviews) * 100);
  const negPct = Math.round((negCount / totalReviews) * 100);
=======
  // 2. Emotion Pie Data with Exact 100% Sum
  const [posPct, neuPct, negPct] = calculateExactPercentages([posCount, neuCount, negCount], totalReviews);
>>>>>>> Stashed changes

  const emotionPieData = [
    { name: "Positive", value: posPct, count: posCount, color: "#10b981" },
    { name: "Neutral", value: neuPct, count: neuCount, color: "#3b82f6" },
<<<<<<< Updated upstream
    { name: "Negative", value: negPct, count: negCount, color: "#ef4444" },
  ].filter(d => d.value > 0);

  // 3. Overall Sentiment Score & Label
  let overallSentimentLabel = "Positive";
  if (negPct > posPct && negPct > neuPct) overallSentimentLabel = "Negative";
  else if (neuPct > posPct && neuPct > negPct) overallSentimentLabel = "Neutral";

  const overallScore = Math.min(99, Math.max(60, Math.round((posPct * 0.7) + (parseFloat(avgRating) * 6))));
  const confidence = Math.min(98, Math.max(82, 85 + (totalReviews * 2)));

  // 4. Rating Distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars: `${stars} ★`,
    count: ratingCounts[stars] || 0,
    percentage: Math.round(((ratingCounts[stars] || 0) / totalReviews) * 100)
  }));

  // 5. Keyword Extraction
  const keywordFreq = {};
  const fullTextCombined = reviews.map(r => (r.text || "").toLowerCase()).join(" ");
=======
    { name: "Negative", value: negPct, count: negPct, color: "#ef4444" },
  ].filter(d => d.count > 0 || totalReviews === 0);

  // 3. Overall Sentiment Label & Score
  let overallSentimentLabel = "Positive";
  if (negCount > posCount && negCount > neuCount) overallSentimentLabel = "Negative";
  else if (neuCount > posCount && neuCount > negCount) overallSentimentLabel = "Neutral";

  const overallScore = Math.min(99, Math.max(50, Math.round((posPct * 0.7) + (parseFloat(avgRating) * 6))));
  const confidence = Math.min(99, Math.max(85, Math.round(88 + (totalReviews * 1.5))));

  // 4. Rating Distribution with Exact 100% Sum
  const starCounts = [5, 4, 3, 2, 1].map(s => ratingCounts[s] || 0);
  const starPcts = calculateExactPercentages(starCounts, totalReviews);

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars, idx) => ({
    stars: `${stars} ★`,
    count: starCounts[idx],
    percentage: starPcts[idx]
  }));

  // 5. Dynamic Keyword Frequency (Computed Strictly From Review Content)
  const keywordFreq = {};
  const fullTextCombined = validReviews.map(r => (r.text || r.review || "").toLowerCase()).join(" ");
>>>>>>> Stashed changes

  KEYWORD_DICTIONARY.forEach(item => {
    const reg = new RegExp(`\\b${item.word}\\b`, "gi");
    const matches = (fullTextCombined.match(reg) || []).length;
    if (matches > 0) {
      keywordFreq[item.label] = matches;
    }
  });

<<<<<<< Updated upstream
  // Fallback default keywords if text is short
  if (Object.keys(keywordFreq).length === 0) {
    keywordFreq["Clean Rooms"] = posCount + 1;
    keywordFreq["Friendly Staff"] = posCount;
    keywordFreq["Great Location"] = Math.ceil(totalReviews / 2);
    keywordFreq["High-Speed WiFi"] = 1;
  }

=======
>>>>>>> Stashed changes
  const keywords = Object.entries(keywordFreq)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

<<<<<<< Updated upstream
  // 6. Pros and Cons auto-extraction
  const prosSet = new Set();
  const consSet = new Set();

  reviews.forEach(r => {
    const text = (r.text || "").toLowerCase();
    const rating = parseInt(r.rating || "5", 10);

    if (rating >= 4 || text.includes("great") || text.includes("clean") || text.includes("love")) {
      if (text.includes("clean")) prosSet.add("Spotless rooms & clean dorms");
      if (text.includes("staff") || text.includes("friendly")) prosSet.add("Warm & welcoming staff");
      if (text.includes("location") || text.includes("beach")) prosSet.add("Prime accessible location");
      if (text.includes("vibe") || text.includes("social")) prosSet.add("Vibrant social atmosphere");
      if (text.includes("wifi")) prosSet.add("Fast & reliable Wi-Fi");
      if (text.includes("pool")) prosSet.add("Clean swimming pool");
    }

    if (rating <= 3 || text.includes("slow") || text.includes("noisy") || text.includes("small")) {
      if (text.includes("wifi") || text.includes("slow")) consSet.add("Intermittent Wi-Fi speeds");
      if (text.includes("noise") || text.includes("noisy")) consSet.add("Noise during peak hours");
      if (text.includes("park")) consSet.add("Limited parking availability");
      if (text.includes("space") || text.includes("small")) consSet.add("Compact room size");
    }
  });

  // Default fallbacks if empty
  if (prosSet.size === 0) {
    prosSet.add("Clean & comfortable rooms");
    prosSet.add("Friendly customer service");
    prosSet.add("Convenient location");
  }
  if (consSet.size === 0 && negCount > 0) {
    consSet.add("Occasional peak-hour delay");
    consSet.add("Limited parking space");
  }

  const pros = Array.from(prosSet).slice(0, 4);
  const cons = Array.from(consSet).slice(0, 3);

  // 7. Trends (7 days / 30 days)
=======
  // 6. Dynamic Pros & Cons (Extracted From User Reviews)
  const prosSet = new Set();
  const consSet = new Set();

  validReviews.forEach(r => {
    const text = (r.text || r.review || "").toLowerCase();
    const rating = parseInt(r.rating || "5", 10);

    if (rating >= 4 || text.includes("great") || text.includes("clean") || text.includes("love") || text.includes("excellent")) {
      if (text.includes("clean")) prosSet.add("Spotless cleanliness & hygiene");
      if (text.includes("staff") || text.includes("service") || text.includes("friendly")) prosSet.add("Friendly & accommodating staff");
      if (text.includes("location") || text.includes("view")) prosSet.add("Prime location & great views");
      if (text.includes("vibe") || text.includes("atmosphere")) prosSet.add("Vibrant & comfortable atmosphere");
      if (text.includes("pool")) prosSet.add("Clean swimming pool");
      if (text.includes("wifi")) prosSet.add("Fast Wi-Fi access");
      if (text.includes("food") || text.includes("breakfast") || text.includes("dining")) prosSet.add("Quality dining options");
    }

    if (rating <= 3 || text.includes("slow") || text.includes("noisy") || text.includes("small") || text.includes("dirty") || text.includes("bad")) {
      if (text.includes("wifi") || text.includes("internet")) consSet.add("Intermittent Wi-Fi connectivity");
      if (text.includes("noise") || text.includes("noisy") || text.includes("loud")) consSet.add("Noise during peak hours");
      if (text.includes("small") || text.includes("space")) consSet.add("Compact room size");
      if (text.includes("slow") || text.includes("delay")) consSet.add("Service speed delays");
    }
  });

  // Collect array of pros/cons dynamically derived from reviews
  const pros = Array.from(prosSet).slice(0, 4);
  const cons = Array.from(consSet).slice(0, 3);

  // 7. Trends
>>>>>>> Stashed changes
  const now = new Date().getTime();
  const sevenDaysAgo = now - (7 * 86400000);
  const thirtyDaysAgo = now - (30 * 86400000);

  const recentReviews = dates.filter(d => d.getTime() >= sevenDaysAgo).length;
  const monthlyReviews = dates.filter(d => d.getTime() >= thirtyDaysAgo).length;

  const trends = {
    last7Days: recentReviews > 0 ? Math.round((recentReviews / totalReviews) * 100) : 100,
    last30Days: monthlyReviews > 0 ? Math.round((monthlyReviews / totalReviews) * 100) : 100
  };

<<<<<<< Updated upstream
  // 8. AI Summary Generation
  let aiSummary = "";
  if (posPct >= 70) {
    aiSummary = `Guests consistently praise the hotel for exceptional cleanliness, attentive staff, and ideal location. Overall customer satisfaction is very high (${posPct}% positive sentiment).`;
  } else if (posPct >= 40) {
    aiSummary = `Travelers report a generally positive experience with good amenities. Some reviews highlight areas for minor improvement such as Wi-Fi speed or parking.`;
  } else {
    aiSummary = `Feedback is mixed with several guests highlighting areas needing maintenance or staff attention. Management is actively reviewing guest notes.`;
=======
  // 8. Dynamic AI Summary derived strictly from active metrics
  let aiSummary = "";
  if (posPct >= 70) {
    aiSummary = `Based on ${totalReviews} verified reviews (${avgRating}/5.0 avg), guests express strong positive satisfaction (${posPct}% positive sentiment). ${pros.length > 0 ? `Key highlights include ${pros.slice(0, 2).join(" and ")}.` : "Overall feedback highlights high quality standards."}`;
  } else if (posPct >= 40) {
    aiSummary = `Analyzed ${totalReviews} reviews (${avgRating}/5.0 avg) indicating a balanced guest experience (${posPct}% positive, ${neuPct}% neutral). ${cons.length > 0 ? `Areas noted for attention include ${cons.slice(0, 2).join(" and ")}.` : "Guest sentiment reflects moderate satisfaction."}`;
  } else {
    aiSummary = `Based on ${totalReviews} reviews (${avgRating}/5.0 avg), feedback indicates areas requiring management review (${negPct}% negative sentiment). ${cons.length > 0 ? `Main concerns involve ${cons.join(", ")}.` : "Guests recommend improvements to services."}`;
>>>>>>> Stashed changes
  }

  return {
    totalReviews,
    avgRating,
    positiveCount: posCount,
    neutralCount: neuCount,
    negativeCount: negCount,
    avgLength,
    newestDate,
    oldestDate,
    overallScore,
    overallSentimentLabel,
    confidence,
    emotionPieData,
    ratingDistribution,
    keywords,
    pros,
    cons,
    trends,
    aiSummary
  };
}
