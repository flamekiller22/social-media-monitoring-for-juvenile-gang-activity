import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    postUrl: { type: String, required: true },
    postImgUrl: String,
    captionText: String,
    comments: Object,
    keyword: { type: String, default: null }, // Optional field
    userProfile: { type: String, default: null }, // Optional field
    createdAt: { type: Date, default: Date.now },
    final_risk_score: Number,
    reasoning: String
  },
  { collection: "categorized_posts" }
); // Explicitly setting collection name

const CategorisedPosts = mongoose.models.CategorisedPosts || mongoose.model("CategorisedPosts", PostSchema);
export default CategorisedPosts;