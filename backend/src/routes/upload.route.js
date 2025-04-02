import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import Post from "../models/post.model.js"; // Import Post Model

const router = express.Router();

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Helper Function to Save Post with Media
const savePost = async (req, res, mediaType) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { title, content, user_id } = req.body;
  if (!user_id || !content) {
    return res.status(400).json({ error: "User ID and content are required." });
  }

  const fileUrl = `/uploads/${req.file.filename}`; // ✅ Stored with static path

  try {
    const newPost = new Post({
      user_id,
      title: title || "Untitled Post",
      content,
      media_urls: [{ url: fileUrl, type: mediaType }],
      post_type: "general",
      visibility: "public",
      is_edited: false,
      view_count: 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      is_featured: false,
      is_pinned: false,
      is_active: true,
      moderation_status: "pending",
    });

    await newPost.save();
    res.status(201).json({ message: `${mediaType} uploaded & post created!`, post: newPost });
  } catch (error) {
    console.error(`❌ Error saving ${mediaType}:`, error);
    res.status(500).json({ error: `Error saving ${mediaType}` });
  }
};

// ✅ Image Upload Route
router.post("/image", upload.single("file"), async (req, res) => {
  await savePost(req, res, "image");
});

// ✅ Video Upload Route
router.post("/video", upload.single("file"), async (req, res) => {
  await savePost(req, res, "video");
});

export default router;
