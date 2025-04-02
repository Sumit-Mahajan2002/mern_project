import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    media_urls: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], required: true },
      },
    ],
    post_type: { type: String, default: "general" },
    is_edited: { type: Boolean, default: false },
    view_count: { type: Number, default: 0 },
    likes_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 },
    shares_count: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false },
    is_pinned: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    geo_location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    moderation_status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

export default Post; 
