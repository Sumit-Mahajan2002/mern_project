import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: JSON.parse(localStorage.getItem("authUser")) || null, // Load from localStorage
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // ✅ Store in localStorage
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
      localStorage.removeItem("authUser"); // ✅ Clear if error
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // ✅ Store after signup
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (!res || !res.data) throw new Error("Invalid response from server");

      const user = res.data;

      // ✅ Store token & user_id in localStorage
      localStorage.setItem("token", user.token);
      localStorage.setItem("user_id", user._id);
      localStorage.setItem("authUser", JSON.stringify(user));

      set({ authUser: user });
      toast.success("Logged in successfully");

    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });

      // ✅ Clear localStorage
      localStorage.removeItem("authUser");
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });

      // ✅ Update localStorage
      localStorage.setItem("authUser", JSON.stringify(res.data));

      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));

// ✅ Ensure `checkAuth` runs on app start
useAuthStore.getState().checkAuth();
