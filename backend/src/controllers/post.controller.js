import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
  try {
    const { user_id, title, content, post_type, visibility, geo_location } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({ success: false, error: "User ID and content are required." });
    }

    // Extract Image URLs from content
    const media_urls = []; // ✅ Define media_urls properly
    const modifiedContent = content.replace(/<img[^>]+src="([^">]+)"/g, (match, src) => {
      if (!src.startsWith("blob:")) {
        media_urls.push(src);
        return ""; // Remove the <img> tag from content
      }
      return match; // Keep other content unchanged
    });

    const newPost = new Post({
      user_id,
      title: title?.trim() || "Untitled Post",
      content: modifiedContent, // ✅ Store modified content (without <img> tags)
      media_urls, // ✅ Store extracted image URLs separately
      post_type: post_type || "general",
      visibility: visibility || "public",
      geo_location: geo_location || null,
      is_edited: false,
      last_edited_at: null,
      view_count: 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      is_featured: false,
      is_pinned: false,
      is_active: true,
      moderation_status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    await newPost.save();

    return res.status(201).json({ success: true, message: "Post created successfully!", post: newPost });
  } catch (error) {
    console.error("🚨 Error creating post:", error);
    return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
  }
};


export const getPosts = async (req, res) => {
    try {
      const posts = await Post.find(); // Fetch all posts
      res.status(200).json(posts);
    } catch (error) {
      console.error("🚨 Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
};
  