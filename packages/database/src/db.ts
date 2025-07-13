import mongoose, { Schema, model } from "mongoose";
import { IRoom, IUser } from "./types/route";






// -------------------- User Schema --------------------
const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true }
);

const UserModel: mongoose.Model<IUser> =
  mongoose.models.User || model<IUser>("User", UserSchema);


  
  // when we do model("User", UserSchema) it creates a new collection in the database with the name "users"(plural of User)
  // You can use the model of collection "users" by using mongoose.models.User






// -------------------- Room Schema --------------------
const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    Admin: { type: Schema.Types.ObjectId, ref: "User" }, // ✅ Fixed type
  },
  { timestamps: true }
);

const RoomModel: mongoose.Model<IRoom> =
  mongoose.models.Room || model<IRoom>("Room", RoomSchema);





// -------------------- Base Message Schema --------------------
const baseMessageSchema = new Schema(
  {
    ChatRoomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      required: true,
    },
  },
  {
    discriminatorKey: "messageType",
    collection: "messages",
    timestamps: true, 
  }
);  

// Base message model
const Message = mongoose.models.Message || model("Message", baseMessageSchema);




// -------------------- Text Message --------------------
const textSchema = new Schema({
  blocks: [
    {
      type: {
        type: String,
        enum: ["text", "code"],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      language: {
        type: String,
        enum: ["javascript", "python", "cpp", "java", "other"],
        required: function (this: any) {
          return this.type === "code";
        },
      },
    },
  ],
});

const TextMessage =
  mongoose.models.TextMessage || Message.discriminator("text", textSchema);




// -------------------- Image Message --------------------
const imageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  caption: String,
});

const ImageMessage =
  mongoose.models.ImageMessage || Message.discriminator("image", imageSchema);




// -------------------- File Message --------------------
const fileSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  filename: String,
  filetype: String,
  size: Number,
});

const FileMessage =
  mongoose.models.FileMessage || Message.discriminator("file", fileSchema);




// -------------------- Exports --------------------
export {
  UserModel,
  RoomModel,
  Message,
  TextMessage,
  ImageMessage,
  FileMessage,
};
