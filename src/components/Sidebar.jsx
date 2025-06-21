import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Wifi, WifiOff } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { 
    onlineUsers, 
    isSocketConnected, 
    socketError, 
    getOnlineUsersCount,
    isUserOnline 
  } = useAuthStore();
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Sort users by online status - online users first, then offline users
  const sortedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    
    return [...users].sort((a, b) => {
      const aOnline = isUserOnline(a._id);
      const bOnline = isUserOnline(b._id);
      
      // If both have same online status, sort alphabetically by name
      if (aOnline === bOnline) {
        return (a.fullName || '').localeCompare(b.fullName || '');
      }
      
      // Online users come first
      return aOnline ? -1 : 1;
    });
  }, [users, isUserOnline]);

  // Filter users based on showOnlineOnly toggle
  const filteredUsers = useMemo(() => {
    if (showOnlineOnly) {
      return sortedUsers.filter((user) => isUserOnline(user._id));
    }
    return sortedUsers;
  }, [sortedUsers, showOnlineOnly, isUserOnline]);

  const onlineUsersCount = getOnlineUsersCount();

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        
        {/* Connection Status */}
        <div className="mt-2 flex items-center gap-2">
          {isSocketConnected ? (
            <div className="flex items-center gap-1 text-green-500">
              <Wifi className="size-4" />
              <span className="text-xs hidden lg:block">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500">
              <WifiOff className="size-4" />
              <span className="text-xs hidden lg:block">
                {socketError || "Disconnected"}
              </span>
            </div>
          )}
        </div>

        {/* Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsersCount} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {isUserOnline(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {isUserOnline(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly ? "No online users" : "No users found"}
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
