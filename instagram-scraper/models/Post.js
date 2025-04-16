const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    postUrl: { type: String, required: true },
    postImgUrl: String,
    captionText: String,
    comments: Object,
    keyword: { type: String, default: null }, // Optional field
    userProfile: { type: String, default: null }, // Optional field
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "uncategorized_posts" }
); // Explicitly setting collection name

module.exports = mongoose.model("Post", PostSchema);
