import express from "express";
import { RoomModel, UserModel } from "@repo/database/db";
import { IUser } from "@repo/database/types";
const roomRouter = express.Router();

// ------------------ Change Room Name ------------------
roomRouter.post("/changeRoomName", async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { newName, name } = req.body;

    if (!newName || !name) {
      return res.status(400).json({ message: "Room name and new name are required" });
    }

    const room = await RoomModel.findOne({ name });
    if (!room) return res.status(400).json({ message: "No such room exists" });

    const existingRoom = await RoomModel.findOne({ name: newName });
    if (existingRoom) return res.status(400).json({ message: "Room with this name already exists" });

    if (room.members.length < 3) {
      return res.status(400).json({ message: "Cannot rename rooms with fewer than 3 members" });
    }

    if (room.Admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the Admin can rename this room" });
    }

    room.name = newName;
    await room.save();

    return res.status(200).json({ message: `Room name changed to ${newName}` });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", err });
  }
});

// ------------------ Create Room ------------------
roomRouter.post("/createRoom", async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { name, members } = req.body;
    console.log("Creating room with name:", name, "and members:", members);

    if (!name) return res.status(400).json({ message: "Room name is required" });

    const existingRoom = await RoomModel.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: "Room with this name already exists" });
    }

    // Convert usernames to ObjectIds
    const memberDocs = await UserModel.find({
      _id: { $in: members }
    }, '_id'); 

    if (!memberDocs || memberDocs.length === 0) {
      return res.status(400).json({ message: "No valid members found" });
    }

    console.log("Member ObjectIds:", memberDocs);
    const memberIds = memberDocs.map((user:any) => user._id.toString());
    console.log("Member IDs:", memberIds);

    //  Add current user and remove duplicates
    const allMembers = [...new Set([...memberIds, userId])];
    console.log("All Members IDs:", allMembers);

    //  Create room with valid ObjectIds only
    const newRoomDoc = await RoomModel.create({
      name,
      members: allMembers,
      Admin: userId,
    });
    console.log("New Room Document:", newRoomDoc);

    const newRoom = await newRoomDoc.populate(
      'members',
      "_id username email profilePicture discription"
    );
    console.log("Populated New Room:", newRoom);

    //  Add room to current user's rooms
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { rooms: newRoom._id },
    });

    //  Add room to each member's rooms
    await UserModel.updateMany(
      { _id: { $in: allMembers } },
      { $addToSet: { rooms: newRoom._id } }
    );

    return res.status(201).json({ message: "Room created", room: newRoom });
  } catch (err) {
    console.error("Create Room Error:", err);
    return res.status(500).json({ message: "Internal Error", err });
  }
});

// ------------------ Delete Room ------------------
roomRouter.post("/deleteRoom", async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    const room = await RoomModel.findOne({ name });
    if (!room) return res.status(400).json({ message: "Room not found" });

    if (room.Admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the Admin can delete this room" });
    }

    await RoomModel.findByIdAndDelete(room._id);

    await UserModel.updateMany(
      { _id: { $in: room.members } },
      { $pull: { rooms: room._id } }
    );

    return res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Error", err });
  }
});

// ------------------ Delete Member ------------------
roomRouter.post("/deleteMember", async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { username, name } = req.body;

    const targetUser = await UserModel.findOne({ username });
    if (!targetUser) {
      return res.status(400).json({ message: "This user does not exist" });
    }

    const room = await RoomModel.findOne({ name });
    if (!room) {
      return res.status(400).json({ message: "No such room exists" });
    }

    if (room.Admin.toString() !== userId) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    const isMember = room.members.some((id) => id.toString() === targetUser._id);
    if (!isMember) {
      return res.status(400).json({ message: "User is not a member of this room" });
    }

    if (room.members.length === 2) {
      await RoomModel.findByIdAndDelete(room._id);
      await UserModel.updateMany(
        { _id: { $in: room.members } },
        { $pull: { rooms: room._id } }
      );
    } else {
      room.members = room.members.filter(
        (id: any) => id.toString() !== targetUser._id 
      );
      await room.save();

      
      targetUser.rooms = targetUser.rooms.filter(
        (id: any) => id.toString() !== room._id
      );
      await targetUser.save();
    }

    return res.status(200).json({ message: "Removed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", err });
  }
});

// ------------------ Add Member ------------------
roomRouter.post("/addMember", async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { username, name } = req.body;

    const newMember = await UserModel.findOne({ username });
    if (!newMember) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const room = await RoomModel.findOne({ name });
    if (!room) {
      return res.status(400).json({ message: "Room not found" });
    }
    const isAlreadyMember = room.members.some((id) => id.toString() === newMember._id);
    if (isAlreadyMember) {
      return res.status(400).json({ message: "User already in the room" });
    }

    room.members.push(newMember._id as any);
    await room.save();

    newMember.rooms.push(room._id as any);
    await newMember.save();

    return res.status(200).json({ message: "Member added successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", err });
  }
});

export default roomRouter;
