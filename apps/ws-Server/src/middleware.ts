import jwt from 'jsonwebtoken';
import { UserModel } from "@repo/database/db";
import dotenv from 'dotenv';
dotenv.config();

export default async function isAuthenticated(req:any){

    const token = new URLSearchParams(req.url.split("?")[1]).get("token");
    if(!token){
        console.error("No token provided in the request");
        return false;
    }
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET as string);
    console.log("Decoded token:", decodedToken);
    if(!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id){
        return false;
    }
    const userId = decodedToken.id;
    console.log("User ID from token:", userId);
    if(!userId){
        return false;
    }
    const user = await UserModel.findById(userId);
    console.log("User found:", user);
    if( !user){
        return false;
    }
    req.user = user;
    req.userId = userId;
    return true;
}