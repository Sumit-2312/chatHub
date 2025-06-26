import mongoose, { Schema, model } from "mongoose";
import {ICodeSnippet, IMessage, IRoom, IUser} from "./types/route";




const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true } // this will automatically tells mongoose to maintain the createdAt and updatedAt values
);

 const UserModel: mongoose.Model<IUser> = mongoose.models.User || mongoose.model("User", UserSchema);

 export { UserModel };




const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    Admin: {type:String, ref:"User" } // ref will let us use the populate property
  },
  { timestamps: true }
);

export const RoomModel : mongoose.Model<IRoom>= mongoose.models.Room || model<IRoom>("Room", RoomSchema);





const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    content: { type: String, required: true },
    isAI: { type: Boolean, default: false },
    messageType: {
      type: String,
      enum: ["text", "code", "file"],
      default: "text",
    },
    codeSnippet: { type: Schema.Types.ObjectId, ref: "CodeSnippet" },
  },
  { timestamps: true }
);
 const MessageModel: mongoose.Model<IMessage> = mongoose.models.Message || model<IMessage>("Message", MessageSchema);
 export {MessageModel};






const CodeSnippetSchema = new Schema<ICodeSnippet>(
  {
    title: { type: String },
    language: { type: String, required: true },
    code: { type: String, required: true },
    executedOutput: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
export const CodeSnippetModel: mongoose.Model<ICodeSnippet> =  mongoose.models.CodeSnippet || model<ICodeSnippet>("CodeSnippet", CodeSnippetSchema);  