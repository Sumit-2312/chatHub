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
const Message = (mongoose.models.Message || model("Message", baseMessageSchema)) as mongoose.Model<any>;




// -------------------- Text Message --------------------
const textSchema = new Schema({
  content: { type: String, required: true },
  sender: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (v: any) {
        // Accepts either a valid ObjectId or the string "AI"
        return (
          mongoose.Types.ObjectId.isValid(v) ||
          (typeof v === "string" && v === "AI")
        );
      },
      message: "Sender must be a valid user ObjectId or the string 'AI'",
    },
  },
});

const TextMessage =
  mongoose.models.TextMessage || Message.discriminator("text", textSchema);







// -------------------- File Message --------------------
const fileSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
   sender: {
    type: Schema.Types.ObjectId, required: true, ref: "User"
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
  FileMessage,
};
