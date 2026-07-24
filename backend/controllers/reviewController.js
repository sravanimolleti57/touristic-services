const axios = require("axios");
const Review = require("../models/Review");

// Add Review
const addReview = async (req, res) => {
  try {
    const { review } = req.body;

    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Review is required",
      });
    }

    // Call Flask API
    const response = await axios.post("http://127.0.0.1:5001/predict", {
      review,
    });

    const sentiment = response.data.predicted_sentiment;

    // Save review in MongoDB
    const newReview = new Review({
      review,
      sentiment,
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      review: newReview,
    });

  } catch (error) {
    console.error("Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addReview,
  getReviews,
};