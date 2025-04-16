"use server";

import { connectToDatabase } from "@/lib/mongodb";
import CategorisedPosts from "@/models/uncategorised_posts";

export async function fetchCategorisedPosts() {
  await connectToDatabase();
  const posts = await CategorisedPosts.find().lean();
  // console.log(posts)
  return JSON.stringify(posts);
}

export async function fetchCategorisedPostsStats() {
  const _posts = await fetchCategorisedPosts();
  let sus = 0;
  let norm = 0;
  const posts = JSON.parse(_posts);
  posts.map((post) => {
    if (post.final_risk_score > 1) sus += 1;
    else norm += 1;
  });
  return { sus, norm, posts: _posts };
}

export async function addNewKeyword(keyword) {
  const response = await fetch(`http://localhost:8080/api/search/${keyword}`);
  const json = await response.json();
  console.log(json);
  if (json.success) {
    return { success: true, posts: json.posts };
  } else {
    return { success: false };
  }
}

export async function addNewUser(username) {
  const response = await fetch(`http://localhost:8080/api/user/${username}`);
  const json = await response.json();
  if (json.success) {
    return { success: true, userProfile: json.userProfile };
  } else {
    return { success: false };
  }
}
