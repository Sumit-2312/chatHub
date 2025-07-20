import mongoose, { Schema, model } from "mongoose";
import { IRoom, IUser } from "./types/route";

// -------------------- User Schema --------------------
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [3, "Password must be at least 3 characters"],
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
    archived: [{ type: Schema.Types.ObjectId, ref: "Room" }],
    blocked: [{ type: Schema.Types.ObjectId, ref: "User" }],
    favourites: [{ type: Schema.Types.ObjectId, ref: "Room" }],
    profilePicture: { type: String, default: "" },
    discription: { type: String, default: "" }
  },
  { timestamps: true }
);

const UserModel: mongoose.Model<IUser> =
  mongoose.models.User || model<IUser>("User", UserSchema);

// -------------------- Room Schema --------------------
const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Room name is required"]
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    Admin: { type: Schema.Types.ObjectId, ref: "User", required: true }
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
      required: true
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      required: true
    }
  },
  {
    discriminatorKey: "messageType",
    collection: "messages",
    timestamps: true
  }
);

const Message =
  mongoose.models.Message || model("Message", baseMessageSchema);

// -------------------- Text Message --------------------
const textSchema = new Schema({
  content: { type: String, required: true },
  sender: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (v: any) {
        return (
          mongoose.Types.ObjectId.isValid(v) ||
          (typeof v === "string" && v === "AI")
        );
      },
      message: "Sender must be a valid ObjectId or 'AI'"
    }
  }
});

const TextMessage =
  mongoose.models.TextMessage || Message.discriminator("text", textSchema);

// -------------------- File Message --------------------
const fileSchema = new Schema({
  url: { type: String, required: true },
  sender: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  filename: String,
  filetype: String,
  size: Number
});

const FileMessage =
  mongoose.models.FileMessage || Message.discriminator("file", fileSchema);

// -------------------- Exports --------------------
export {
  UserModel,
  RoomModel,
  Message,
  TextMessage,
  FileMessage
};
