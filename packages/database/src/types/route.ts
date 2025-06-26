import { Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  friends: Types.ObjectId[];
  rooms: Types.ObjectId[];
}

export interface IRoom extends Document {
  name: string;
  members: Types.ObjectId[];
  isGroup: boolean;
  Admin: string;
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