import React from "react";

interface ChatListItemProps {
  name: string;
  message: string;
  time: string;
  unreadCount: number;
  profileUrl: string;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  name,
  message,
  time,
  unreadCount,
  profileUrl,
}:ChatListItemProps) => {
  return (
    <div className="flex items-center border-b border-gray-900 justify-between px-4 py-3 hover:bg-gray-900 transition-colors">
      {/* Left Side: Profile + Text */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={profileUrl}
            alt={name}
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-blue-600">{name}</span>
          <span className="text-sm text-gray-500">{message}</span>
        </div>
      </div>

      {/* Right Side: Unread count + Time */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-gray-500">{time}</span>
        {unreadCount > 0 && (
          <span className="text-white bg-blue-500 rounded-full h-6 w-6 text-sm flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
