import { Document, Types } from "mongoose";



 export interface IMessage extends Document {
  ChatRoomId: Types.ObjectId;
  sender?: Types.ObjectId;
  messageType: "text" | "image" | "file";
  content: string;
  senderType: "user" | "AI";
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;

  friends: Types.ObjectId[];       // Reference to User
  rooms: Types.ObjectId[];         // Reference to Room
  archived: Types.ObjectId[];     // Archived chats (Room)
  blocked: Types.ObjectId[];       // Blocked users (User)
  favourites: Types.ObjectId[];     // Favorite chats (Room)

  profilePicture: string;          // URL string
  discription: string;             // User description
  isOnline: boolean;               // Online status

  createdAt?: Date;                // From timestamps: true
  updatedAt?: Date;                // From timestamps: true
}

export interface IRoom extends Document {
  name: string;
  members: Types.ObjectId[];
  isGroup: boolean;
  Admin: Types.ObjectId;
}