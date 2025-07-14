import { Document, Types } from "mongoose";

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

export interface IMessage extends Document {
  sender: Types.ObjectId;
  room: Types.ObjectId;
  content: string;
  isAI: boolean;
  messageType: "text" | "code" | "file";
  codeSnippet?: Types.ObjectId;
}


export interface ICodeSnippet extends Document {
  title?: string;
  language: string;
  code: string;
  executedOutput?: string;
  createdBy: Types.ObjectId;
}