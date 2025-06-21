import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  messageError: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    
    set({ isMessagesLoading: true, messageError: null });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      const errorMessage = error.response?.data?.message || "Failed to load messages";
      set({ messageError: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected for chat");
      return;
    }

    set({ isSendingMessage: true, messageError: null });
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.message || "Failed to send message";
      set({ messageError: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket || !socket.connected) {
      console.warn("Socket not connected, cannot subscribe to messages");
      return;
    }

    // Clean up any existing listeners first
    get().unsubscribeFromMessages();

    // Subscribe to new messages
    const messageHandler = (newMessage) => {
      console.log("Received new message:", newMessage);
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      const isMessageSentToSelectedUser = newMessage.receiverId === selectedUser._id;
      
      // Only add message if it's from or to the selected user
      if (isMessageSentFromSelectedUser || isMessageSentToSelectedUser) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    };

    socket.on("newMessage", messageHandler);

    // Store the handler reference for cleanup
    set({ _messageHandler: messageHandler });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      // Remove the specific message handler if it exists
      const { _messageHandler } = get();
      if (_messageHandler) {
        socket.off("newMessage", _messageHandler);
      }
      // Also remove any other message listeners to be safe
      socket.off("newMessage");
    }
    
    // Clear the handler reference
    set({ _messageHandler: null });
  },

  setSelectedUser: (selectedUser) => {
    // Clean up previous message subscription
    get().unsubscribeFromMessages();
    
    // Clear messages when switching users
    set({ selectedUser, messages: [], messageError: null });
    
    // Subscribe to messages for the new user
    if (selectedUser) {
      get().subscribeToMessages();
    }
  },

  // Clear all chat data (useful for logout)
  clearChatData: () => {
    get().unsubscribeFromMessages();
    set({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      isSendingMessage: false,
      messageError: null,
      _messageHandler: null,
    });
  },

  // Add a message to the current chat (for optimistic updates)
  addMessageOptimistically: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // Remove a message (for error handling)
  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter(msg => msg._id !== messageId),
    }));
  },
}));
