import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_SOCKET_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isSocketConnected: false,
  socketError: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;

    // Disconnect existing socket if any
    get().disconnectSocket();

    try {
      const socket = io(BASE_URL, {
        query: {
          userId: authUser._id,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      set({ socket: socket, socketError: null });

      // Connection event handlers
      socket.on("connect", () => {
        console.log("Socket connected");
        set({ isSocketConnected: true, socketError: null });
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        set({ isSocketConnected: false });
        
        if (reason === "io server disconnect") {
          // Server disconnected us, try to reconnect
          socket.connect();
        }
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        set({ 
          isSocketConnected: false, 
          socketError: "Failed to connect to chat server" 
        });
        toast.error("Chat connection failed. Trying to reconnect...");
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
        set({ isSocketConnected: true, socketError: null });
        toast.success("Chat connection restored");
      });

      socket.on("reconnect_error", (error) => {
        console.error("Socket reconnection error:", error);
        set({ socketError: "Failed to reconnect to chat server" });
      });

      socket.on("reconnect_failed", () => {
        console.error("Socket reconnection failed");
        set({ socketError: "Unable to reconnect to chat server" });
        toast.error("Unable to reconnect to chat. Please refresh the page.");
      });

      // Chat event handlers
      socket.on("getOnlineUsers", (userIds) => {
        console.log("Received online users:", userIds);
        set({ onlineUsers: userIds });
      });

      // Fallback: If socket fails, try to get online users via REST API
      socket.on("connect_error", () => {
        get().fetchOnlineUsersFallback();
      });

    } catch (error) {
      console.error("Error creating socket connection:", error);
      set({ socketError: "Failed to initialize chat connection" });
      get().fetchOnlineUsersFallback();
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      // Remove all event listeners
      socket.removeAllListeners();
      
      if (socket.connected) {
        socket.disconnect();
      }
      
      set({ 
        socket: null, 
        isSocketConnected: false, 
        socketError: null,
        onlineUsers: [] 
      });
    }
  },

  fetchOnlineUsersFallback: async () => {
    try {
      const res = await axiosInstance.get("/auth/online-users");
      set({ onlineUsers: res.data });
    } catch (error) {
      console.error("Failed to fetch online users via REST API:", error);
      // Keep existing online users or set to empty array
      set({ onlineUsers: [] });
    }
  },

  // Get online users count excluding current user
  getOnlineUsersCount: () => {
    const { onlineUsers, authUser } = get();
    if (!authUser) return 0;
    
    // Filter out current user from online users count
    const otherOnlineUsers = onlineUsers.filter(userId => userId !== authUser._id);
    return otherOnlineUsers.length;
  },

  // Check if a specific user is online
  isUserOnline: (userId) => {
    const { onlineUsers } = get();
    return onlineUsers.includes(userId);
  },
}));
