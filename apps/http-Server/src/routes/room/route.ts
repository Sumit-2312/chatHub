import express from "express";
import { RoomModel, UserModel } from "@repo/database/db";
const roomRouter = express.Router();



//  Change Room Name (Only Admin)
roomRouter.post("/changeRoomName", async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { newName, roomId } = req.body;

    const room = await RoomModel.findById(roomId);
    if (!room) return res.status(400).json({ message: "No such room exists" });

    if (!room.isGroup || room.members.length < 3) {
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

//  Create Room (Set creator as Admin)
roomRouter.post("/createRoom", async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    const newRoom = await RoomModel.create({
        name,
        members:[userId],
        isGroup: false,
        Admin: userId
    })
 
    return res.status(201).json({ message: "Room created", room: newRoom });
  } catch (err) {
    return res.status(500).json({ message: "Internal Error", err });
  }
});

//  Delete Room (Only Admin)
roomRouter.post("/deleteRoom", async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { roomId } = req.body;

    const room = await RoomModel.findById(roomId);
    if (!room) return res.status(400).json({ message: "Room not found" });

    if (room.Admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the Admin can delete this room" });
    }

    await RoomModel.findByIdAndDelete(roomId);


    //room.members is an array of user ObjectIds (e.g., ["user1Id", "user2Id"]).
    // $in is a MongoDB operator that matches any value inside the given array.
    // So, this targets all users whose _id is listed as a member of the room.
    // $pull removes a specific value from an array.
    // In this case, it's removing room._id from each user's rooms array.

    await UserModel.updateMany(
      { _id: { $in: room.members } },
      { $pull: { rooms: room._id } }
    );

    return res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Error", err });
  }
});

roomRouter.post("/deleteMember", async (req: any, res:any) => {
  try {
    const userId = req.userId;
    const { target, roomId } = req.body;

    const TargetUser = await UserModel.findById(target);
    if (!TargetUser) {
      return res.status(400).json({ message: "This user does not exist in the database" });
    }

    const room = await RoomModel.findById(roomId);
    if (!room) {
      return res.status(400).json({ message: "No such room exists" });
    }

    if (room.Admin.toString() !== userId) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    if (!room.members.includes(target)) {
      return res.status(400).json({ message: "Target user is not a member of the room" });
    }

    if (room.members.length === 2) {
      // If only 2 members left, delete room
      await RoomModel.findByIdAndDelete(roomId);

      // Remove room from both users' room lists
      await UserModel.updateMany(
        { _id: { $in: room.members } },
        { $pull: { rooms: room._id } }
      );
    } else {
      // Remove target user from room
      room.members = room.members.filter((id:any) => id.toString() !== target);
      await room.save();

      // Remove room from target user
      TargetUser.rooms = TargetUser.rooms.filter((id:any) => id.toString() !== roomId);
      await TargetUser.save();
    }

    return res.status(200).json({ message: "Removed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", err });
  }
});

roomRouter.post("/addMember", async (req:any, res:any) => {
  try {
    const userId = req.userId;
    const { newMemberId, roomId } = req.body;

    const newMember = await UserModel.findById(newMemberId);
    if (!newMember) {
      return res.status(400).json({ message: "The new member does not exist" });
    }

    const room = await RoomModel.findById(roomId);
    if (!room) {
      return res.status(400).json({ message: "No such room exists" });
    }

    if (room.members.includes(newMemberId)) {
      return res.status(400).json({ message: "User is already a member of the room" });
    }

    // Add member to room and save
    room.members.push(newMemberId);
    await room.save();

    // Add room to user's list
    newMember.rooms.push(room._id as typeof newMember.rooms[0]);
    await newMember.save();

    return res.status(200).json({ message: "Member added successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", err });
  }
});

export default roomRouter;