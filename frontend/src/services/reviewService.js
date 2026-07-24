import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/reviews",
});

// Add Review
export const addReview = (data) => API.post("/", data);

// Get All Reviews
export const getReviews = () => API.get("/");