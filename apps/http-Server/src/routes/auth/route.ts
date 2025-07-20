import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "@repo/database/db";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ;

const authRouter = express.Router();

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET as string, { expiresIn: "7d" });
};

authRouter.post("/signup", async (req: any, res: any) => {
  try {
    const { username, email, password } = req.body;

    // Check if email exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already in use" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    //@ts-ignore

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err });
  }
});


authRouter.post( '/login',async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "user do not exits " });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "password was incorrect" });

    //@ts-ignore
    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err });
  }
});



export default authRouter;