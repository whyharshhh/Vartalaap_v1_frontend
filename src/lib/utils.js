export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Socket connection utilities
export const isSocketConnected = (socket) => {
  return socket && socket.connected;
};

export const getSocketConnectionStatus = (socket) => {
  if (!socket) return 'disconnected';
  if (socket.connected) return 'connected';
  if (socket.connecting) return 'connecting';
  return 'disconnected';
};

// Error handling utilities
export const handleSocketError = (error, context = 'Socket') => {
  console.error(`${context} error:`, error);
  
  if (error.message.includes('timeout')) {
    return 'Connection timeout. Please check your internet connection.';
  }
  
  if (error.message.includes('refused')) {
    return 'Unable to connect to chat server. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please refresh the page.';
};

// Online users utilities
export const filterOnlineUsers = (users, onlineUserIds, excludeUserId = null) => {
  if (!users || !onlineUserIds) return [];
  
  return users.filter(user => {
    const isOnline = onlineUserIds.includes(user._id);
    const isNotExcluded = !excludeUserId || user._id !== excludeUserId;
    return isOnline && isNotExcluded;
  });
};

export const getOnlineUsersCount = (onlineUserIds, excludeUserId = null) => {
  if (!onlineUserIds) return 0;
  
  if (excludeUserId) {
    return onlineUserIds.filter(id => id !== excludeUserId).length;
  }
  
  return onlineUserIds.length;
};
