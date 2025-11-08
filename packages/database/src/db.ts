import mongoose, { Schema, model } from "mongoose";
import { IMessage, IRoom, IUser } from "./types/route";





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

const baseMessageSchema = new Schema<IMessage>(
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
    },
    content:{
      type: String,
      required: true
    },
    senderType: {
      type: String,
      enum: ["user", "AI"],
      default: "user",
      required: true
    },
    sender:{
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  },{
    timestamps: true
  }
);

const Message =
  mongoose.models.Message || model<IMessage>("Message", baseMessageSchema);

// -------------------- Exports --------------------
export {
  UserModel,
  RoomModel,
  Message,
};
