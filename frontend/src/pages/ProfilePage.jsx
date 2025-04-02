import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera } from "lucide-react";
import MyEditorComponent from "../components/MyEditorComponent"; // Froala editor component
import PostContent from "../components/PostContent"; // New component to display formatted posts

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(authUser?.profilePic || null);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [posts, setPosts] = useState([]); // State for posts

  // ✅ Fetch Posts on Load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/posts");
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // ✅ Handle Profile Image Upload to Backend
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5001/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      const uploadedImageUrl = data.post.media_urls[0]?.url;

      if (uploadedImageUrl) {
        setSelectedImg(uploadedImageUrl);
        await updateProfile({ profilePic: uploadedImageUrl });
        console.log("✅ Profile image updated successfully!");
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Handle Post Submission
  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      alert("Post content cannot be empty!");
      return;
    }

    const title = "Default Title"; 
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userId) {
      alert("User not authenticated!");
      return;
    }

    const mediaUrls = Array.from(
      postContent.matchAll(/<img[^>]+src="([^">]+)"/g),
      (match) => match[1]
    );

    const postData = {
      title,
      content: postContent,
      user_id: userId,
      media_urls: mediaUrls,
    };

    console.log("📤 Sending Post Data:", postData);
    setIsPosting(true);

    try {
      const response = await fetch("http://localhost:5001/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit post: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Post submitted successfully:", data);

      // ✅ Update posts list after submission
      setPosts((prevPosts) => [data.post, ...prevPosts]);

      setPostContent(""); // Clear editor after submission
    } catch (error) {
      console.error("❌ Error submitting post:", error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* ✅ Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUploading || isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading || isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUploading ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* ✅ Create Post Section */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Create a Post</h2>
            <MyEditorComponent onContentChange={setPostContent} />
            <button
              onClick={handlePostSubmit}
              className="btn btn-primary mt-4"
              disabled={isPosting}
            >
              {isPosting ? "Posting..." : "Submit Post"}
            </button>
          </div>

          {/* ✅ Display Posts */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Recent Posts</h2>
            {posts.length === 0 ? (
              <p className="text-gray-400">No posts available.</p>
            ) : (
              posts.map((post, index) => (
                <div key={index} className="p-4 border-b">
                  <PostContent content={post.content} /> {/* ✅ Renders HTML properly */}
                  {post.media_urls.map((url, i) => (
                    <img key={i} src={url} alt="Post media" className="w-32 h-32 rounded-lg mt-2" />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;