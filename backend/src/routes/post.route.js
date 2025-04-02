import express from "express";
import Post from "../models/post.model.js";
import { createPost } from "../controllers/post.controller.js";
import { getPosts } from "../controllers/post.controller.js";
const router = express.Router();

router.post("/", createPost);
router.get("/posts", getPosts); 


// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error });
  }
});

export default router;
