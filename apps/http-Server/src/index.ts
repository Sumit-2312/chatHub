import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./routes/auth/route";
import { verifyToken } from "./middleware";
import userRouter from "./routes/user/route";
import roomRouter from "./routes/room/route";
import cors from "cors";
import chatRouter from "./routes/chat/route";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);

//@ts-ignore
app.get('/',(req,res)=>{
    res.send("Hello world");
});
//@ts-ignore
app.use('/user',verifyToken,userRouter); // working properly
//@ts-ignore
app.use('/room',verifyToken,roomRouter);
//@ts-ignore
app.use('/chat',verifyToken,chatRouter);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || "")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error", err));