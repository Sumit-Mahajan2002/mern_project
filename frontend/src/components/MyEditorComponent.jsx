import React, { useEffect, useState } from "react";
import FroalaEditorComponent from "react-froala-wysiwyg";
import axios from "axios";

// Import required styles
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";

import 'froala-editor/js/plugins.pkgd.min.js';




const MyEditorComponent = ({ onContentChange, onPostSubmit }) => {
  const [title, setTitle] = useState("");
  const [plainText, setPlainText] = useState("");
  const [richContent, setRichContent] = useState("");
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState("");
  const [mediaUrls, setMediaUrls] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("user_id");
    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
  }, []);


  // ✅ Corrected Image Upload Handler
  const handleImageUpload = async (file, editorInstance) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post(
        "http://localhost:5001/api/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.link) {
        const imageUrl = response.data.link;
        console.log("✅ Image uploaded:", imageUrl);
  
        setMediaUrls((prev) => [...prev, imageUrl]);
  
        // ✅ Use Froala's insert function correctly
        editorInstance.image.insert(imageUrl, true);
      }
    } catch (error) {
      console.error("❌ Image upload failed:", error);
    }
  };
  
  

  // ✅ Corrected Video Upload Handler
  const handleVideoUpload = async (file, editorInstance) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post(
        "http://localhost:5001/api/upload/video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ Fixed syntax error
          },
        }
      );
  
      if (response.data.link) {
        const videoUrl = response.data.link;
        console.log("✅ Video uploaded:", videoUrl);
        editorInstance.video.insert(videoUrl, true); // ✅ Insert correct URL
      }
    } catch (error) {
      console.error("❌ Video upload failed:", error);
    }
  };
  

  const froalaConfig = {
    placeholderText: "Write your post here...",
    // toolbarButtons: [
    //   "bold", "italic", "underline", "strikeThrough", "formatOL", "formatUL",
    //   "indent", "outdent", "align", "undo", "redo","insert"
    // ],
    // imageEditButtons: ['imageDisplay', 'imageAlign', 'imageInfo', 'imageRemove'],
    heightMax:600,
    charCounterCount: false,
    imageUpload: true,
    videoUpload: true,
    events: {
      initialized: function () {
        console.log("Froala Editor Initialized");
      },

      // ✅ Updated Image Upload
      "image.beforeUpload": async function (files) {
        if (!files || !files[0]) {
          console.error("No file selected for upload");
          return false;
        }

        console.log("Uploading image:", files[0]);

        const formData = new FormData();
        formData.append("file", files[0]);

        try {
          const response = await axios.post(
            "http://localhost:5001/api/upload/image",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.link) {
            const fileUrl = response.data.link;
            console.log("✅ Image uploaded successfully:", fileUrl);

            // ✅ Store the image URL in mediaUrls
            setMediaUrls((prev) => [...prev, fileUrl]);

            // ✅ Insert the uploaded image URL into Froala
            this.image.insert(fileUrl, true);
          } else {
            console.error("❌ Image upload failed:", response.data);
          }
        } catch (error) {
          console.error("❌ Image upload error:", error);
        }

        return false; // ✅ Prevent Froala from inserting the blob URL
      },

      // ✅ Updated Video Upload
      "video.beforeUpload": async function (files) {
        if (!files || !files[0]) {
          console.error("No video selected for upload");
          return false;
        }

        console.log("Uploading video:", files[0]);

        await handleVideoUpload(files[0], this);
        return false; // ✅ Prevent default behavior
      },

      "image.uploadError": function (error) {
        console.error("❌ Image upload error:", error);
      },
      "video.uploadError": function (error) {
        console.error("❌ Video upload error:", error);
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!title || (!plainText && !richContent)) {
      alert("Please enter a title and content before submitting.");
      return;
    }
  
    const userId = localStorage.getItem("user_id"); // ✅ Fetch user_id from localStorage
  
    if (!userId) {
      console.error("❌ User ID is missing!");
      alert("User not authenticated!");
      return;
    }
  
    const postData = {
      title,
      content: `<p>${plainText}</p>${richContent}`, // ✅ Corrected template literal syntax
      user_id: userId,
      media_urls: mediaUrls, // ✅ Attach media URLs
    };
    
  
    console.log("📤 Sending Post Data:", postData); // ✅ Debugging log
  
    try {
      const response = await axios.post(
        "http://localhost:5001/api/posts",
        postData,
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Fixed syntax
        }
      );
    
      console.log("✅ Post submitted successfully:", response.data);
    
      onPostSubmit?.(response.data);
      setTitle("");
      setPlainText("");
      setRichContent("");
      setMediaUrls([]); // ✅ Clear media URLs after submission
    } catch (error) {
      console.error("❌ Error submitting post:", error.response?.data || error.message);
    }
    
  };
  

  return (
    <div className="editor-container">
      <h3>Create Your Post</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Enter your text content here..."
          value={plainText}
          onChange={(e) => {
            setPlainText(e.target.value);
            if (onContentChange)
              onContentChange(`<p>${e.target.value}</p>${richContent}`);
          }}
          style={{ width: "100%", height: "100px", marginTop: "10px" }}
        ></textarea>

        <FroalaEditorComponent
          tag="textarea"
          model={richContent}
          config={froalaConfig}
          onModelChange={(newContent) => {
            console.log(newContent)
            setRichContent(newContent);
            if (onContentChange)
              onContentChange(`<p>${plainText}</p>${newContent}`);
          }}
        />

        <button type="submit" style={{ marginTop: "10px" }}>
          Submit Post
        </button>
      </form>
    </div>
  );
};

export default MyEditorComponent;