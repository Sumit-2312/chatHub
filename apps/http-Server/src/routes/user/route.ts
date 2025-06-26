import express from "express";
import { UserModel } from "@repo/database/db";
const userRouter = express.Router();


userRouter.get("/userDetails", async (req: any, res:any) => {
  try {
    const userId = req.userId;
    console.log("This is the userId from req ",userId);
    

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    const user = await UserModel.findById(userId).select("-password"); // exclude password

    if (!user) {
      return res.status(400).json({ message: "No such user exists" });
    }

    return res.status(200).json({ user });

  } catch (err) {
    return res.status(500).json({ message: "Some error occurred", error: err });
  }
});

    
export default userRouter;