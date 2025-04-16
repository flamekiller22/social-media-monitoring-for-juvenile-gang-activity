const express = require("express");
const {
  FetchPost,
  FetchUserPosts,
  SearchPost,
  BuildDriver,
  LogIn,
} = require("../scraper.js");
const Post = require("../models/Post");

const router = express.Router();
let driver;
(async () => {
  driver = await BuildDriver();
  await LogIn(driver);
})();

router.get("/search/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;
    const posts = await SearchPost(driver, keyword);

    // Send immediate response
    res.json({
      message: "Processing request in background",
      posts,
      success: true,
    });

    // Process in background
    setImmediate(async () => {
      for (const postUrl of posts) {
        try {
          const { postImgUrl, captionText, comments, userProfile } =
            await FetchPost(driver, postUrl);

          if (postImgUrl === "") {
            continue;
          }

          // Store in MongoDB
          const newPost = new Post({
            postUrl,
            postImgUrl,
            captionText,
            comments,
            keyword,
            userProfile,
          });
          await newPost.save();

          console.log("Post stored successfully.");
          console.log("Background processing complete for:", postUrl);

          await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {
          console.error("Error in background processing:", error);
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

router.get("/post", async (req, res) => {
  try {
    const { post_url } = req.query;
    const postData = await FetchPost(driver, post_url);
    res.json(postData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching post data" });
  }
});

router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const userProfile = await FetchUserPosts(driver, username);

    // Send immediate response
    res.json({
      message: "Processing request in background",
      userProfile,
      success: true,
    });

    // Process in background
    setImmediate(async () => {
      for (const postUrl of userProfile.postsArr) {
        console.log(postUrl);
        try {
          const { postImgUrl, captionText, comments, userProfile } =
            await FetchPost(driver, postUrl);

          if (postImgUrl === "") {
            continue;
          }

          // Store in MongoDB
          const newPost = new Post({
            postUrl,
            postImgUrl,
            captionText,
            comments,
            userProfile,
          });
          await newPost.save();

          console.log("Post stored successfully.");
          console.log("Background processing complete for:", postUrl);

          await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {
          console.error("Error in background processing:", error);
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

module.exports = router;
