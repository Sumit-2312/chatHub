import { FileMessage, RoomModel } from '@repo/database/db';
import express from 'express';
import {Message} from '@repo/database/db';
const chatRouter = express.Router();
import fs from 'fs';
import multer from 'multer';
import storage from '../../utils/multer/storage';
import fileFilter from '../../utils/multer/fileFilter';
import cloudinary from '../../utils/cloudinary/route';
import detectMessageType from '../../utils/multer/detectType';


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB file size limit
  },
});


chatRouter.get('/', async (req: any, res: any) => {
  try {
    const { roomName } = req.query;
    const userId = req.userId;

    if (!roomName) {
      return res.status(400).json({ message: "Room Name is required" });
    }
    if( !userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const isRoom = await RoomModel.findOne({name:roomName});
    if (!isRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isMember = isRoom.members.some(
      (memberId: any) => memberId && memberId.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this room",chats:[] });
    }
    console.log("User is a member of the room: ", isRoom.name);
//@ts-ignore
    const roomChats = await Message.find(
      { ChatRoomId: isRoom._id },
      null,
      {}
    )
    .populate('sender', '_id username email profilePicture discription')
    .sort({ createdAt: 1 });

    console.log("Room Chats: ", roomChats);

    if (!roomChats || roomChats.length === 0) {
      return res.status(200).json({ message: "No chats found in this room",chats:[] });
    }

    res.status(200).json({ chats: roomChats });
  } catch (err:any) {
    console.error("Error in chat route:", err.message || err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


chatRouter.post('/upload', upload.single('file'), async (req: any, res: any) => {
  try {
    const { roomId } = req.body;
    const userId = req.userId;
    const file = req.file;
    console.log( "file info:", file )

    if (!roomId || !file) {
      return res.status(400).json({ message: 'Room ID and file are required' });
    }

    const isRoom = await RoomModel.findById(roomId);
    if (!isRoom) return res.status(404).json({ message: 'Room not found' });

    const isMember = isRoom.members.some(
      (memberId: any) => memberId.toString() === userId
    );
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    // ✅ Use simple upload now since you're using diskStorag685d16655675fcd6e4380616e
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto', // auto detects image, pdf, etc.
    });


    // After cloudinary upload
    fs.unlink(file.path, (err) => {
      if (err) console.error('Failed to delete local file:', err);
    });


    // Save message with file URL
    const newMessage = await FileMessage.create({
      ChatRoomId: roomId,
      sender: userId,
      url: result.secure_url,
      filename: file.originalname,
      filetype: detectMessageType(file.mimetype),
      size: file.size
    })


    res.status(201).json({
      message: 'File uploaded and saved successfully',
      fileUrl: result.secure_url,
      data: newMessage,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});




export default chatRouter;
