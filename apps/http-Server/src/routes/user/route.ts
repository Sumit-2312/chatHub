import express from "express";
import { UserModel } from "@repo/database/db";
const userRouter = express.Router();
import bcrypt from "bcrypt";

userRouter.get("/userDetails", async (req: any, res:any) => {
  try {
    const userId = req.userId;
    console.log("This is the userId from req ",userId);
    

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

const user = await UserModel.findById(userId)
  .select("-password")
  .populate({
    path: "friends",
    select: "_id username email profilePicture discription"
  })
  .populate({
    path: "rooms",
    populate: {
      path: "members",
      select: "_id username email profilePicture discription"
    },
    select: "_id name members"
  })
  .populate({
    path: "archived",
    select: "_id name members"
  })
  .populate({
    path: "blocked",
    select: "_id username email profilePicture discription"
  })
  .populate({
    path: "favourites",
    select: "_id name members"
  });

    if (!user) {
      return res.status(400).json({ message: "No such user exists" });
    }

    return res.status(200).json({ user });

  } catch (err) {
    return res.status(500).json({ message: "Some error occurred", error: err });
  }
});

userRouter.post("/addFriend",async(req:any,res:any)=>{
  try{
    const userId = req.userId;
    const {username} = req.body;

    if (!userId || !username) {
      return res.status(400).json({ message: "User ID and friend username are required" });
    }
    const friend = await UserModel.findOne({ username });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if( user.friends.includes(friend._id as any)){
      return res.status(400).json({ message: "Friend already exists" });  
    }

    user.friends.push(friend._id as any);
    friend.friends.push(user._id as any);
    await user.save();
    await friend.save();

    return res.status(200).json({message: "Friend added successfully",id: friend._id, username: friend.username, email: friend.email, profilePicture: friend.profilePicture, discription: friend.discription});
    
  } catch (err) {
    return res.status(500).json({ message: "Internal error", error: err });
  }
})

userRouter.post("/removeFriend",async(req:any,res:any)=>{
  try{
    const userId = req.userId;
    const {friendEmail} = req.body;

    if (!userId || !friendEmail) {
      return res.status(400).json({ message: "User ID and friend email are required" });
    }
    const friend = await UserModel.findOne({ email: friendEmail });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { friends: friend._id } }, // remove friend
      { new: true } // return the updated user
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Friend removed successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", error: err });
  }
});

//------------------------------------------------------------------------------------------------------------------//

userRouter.post("/addToFavourites", async (req:any, res:any) => {
  try { 
    const userId = req.userId;
    const { friendEmail } = req.body;

    if (!userId || !friendEmail) {
      return res.status(400).json({ message: "User ID and friend email are required" });
    }

    const friend = await UserModel.findOne({ email: friendEmail });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // check if the friend is acutally in the friend list of user or not
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.friends.includes(friend._id as any)) {
      return res.status(400).json({ message: "Friend is not in your friend list" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favourites: friend._id } }, // add to favourites if not already present
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Return the updated user with favourites
    return res.status(200).json({ message: "Added to favourites successfully", user: updatedUser });
  }

  catch (err) {
    return res.status(500).json({ message: "Internal error", error: err });
  }
});

userRouter.post("/removeFromFavourites", async (req:any, res:any) => {
  try {
    const userId = req.userId;
    const { friendEmail } = req.body;

    if (!userId || !friendEmail) {
      return res.status(400).json({ message: "User ID and friend email are required" });
    }

    const friend = await UserModel.findOne({ email: friendEmail });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { favourites: friend._id } }, // remove from favourites
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Removed from favourites successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", error: err });
  }
});

userRouter.post("/addToBlocked", async (req:any, res:any) => {
  try {  
    const userId = req.userId;
    const { friendEmail } = req.body;

    if (!userId || !friendEmail) {
      return res.status(400).json({ message: "User ID and friend email are required" });
    }

    const friend = await UserModel.findOne({ email: friendEmail });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { blocked: friend._id } }, // add to blocked if not already present
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // remove the friend from user's friends list if they are already friends
    await UserModel.findByIdAndUpdate(
      userId, 
      { $pull: { friends: friend._id } }, // remove from friends
      { new: true }
    );
    // remove the user from friend's friends list if they are already friends
    await UserModel.findByIdAndUpdate(
      friend._id,
      { $pull: { friends: userId } }, // remove from friends
      { new: true }
    );  

    return res.status(200).json({ message: "Added to blocked successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", error: err });   
  }
}); 

userRouter.post("/removeFromBlocked", async (req:any, res:any) => {
  try {
    const userId = req.userId;
    const { friendEmail } = req.body;

    if (!userId || !friendEmail) {
      return res.status(400).json({ message: "User ID and friend email are required" });
    }

    const friend = await UserModel.findOne({ email: friendEmail });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { blocked: friend._id } }, // remove from blocked
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Removed from blocked successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", error: err });
  }
}); 

userRouter.post('/addToArchived', async (req:any, res:any) => {
  try { 
    const userId = req.userId;
    const { friendEmail } = req.body;

    if (!userId || !friendEmail) {
      return res.status(400).json({ message: "User ID and friend email are required" });
    }

    const friend = await UserModel.findOne({ email: friendEmail });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { archived: friend._id } }, // add to archived if not already present
      { new: true }
    );

    // remote the friend from user's friends list if they are already friends
    await UserModel.findByIdAndUpdate(  
      userId, 
      { $pull: { friends: friend._id } }, // remove from friends
      { new: true }
    );  


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Added to archived successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Internal error", error: err }); 
  }
});

//---------------------------------------------------------------------------------------------------------//

userRouter.post('/removeFromArchived', async (req:any, res:any) => {
  try {   
    const userId = req.userId;
    const { friendEmail } = req.body;

    if (!userId || !friendEmail) {
      return res.status(400).json({ message: "User ID and friend email are required" });
    }

    const friend = await UserModel.findOne({ email: friendEmail });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { archived: friend._id } }, // remove from archived
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // add the friend back to user's friends list if they are not already friends
    await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friend._id } }, // add to friends if not already present
      { new: true }
    );

    return res.status(200).json({ message: "Removed from archived successfully", user });
  } catch (err) { 
    return res.status(500).json({ message: "Internal error", error: err });
  }     
}); 

userRouter.post('/updateProfile',async(req:any,res:any)=>{

  try{
    const userId = req.userId;
    const {username,profilePicture,discription,email} = req.body;
    if (!userId || !username || email) {
      return res.status(400).json({ message: "User ID, username and email are required" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCorrect =  bcrypt.compareSync(req.body.oldPassword, user.password); // compareSync means that we are comparing the old password with the hashed password stored in the database
    if (!isCorrect) { 
      return res.status(400).json({ message: "Incorrect old password" });
    }


  user.username = username;
  user.email = email;
  user.discription = discription;
  if (profilePicture) {
    user.profilePicture = profilePicture; // assuming profilePicture is a URL or base64 string
  }
  await user.save();

  return res.status(200).json({ message: "Profile updated successfully", user });
  }catch(err:any){
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
})



// in the chats we will render all the rooms of the user
// in the frinds we will render all the friends of the user
// in the favourites we will render all the favourite rooms of the user
// in the archived we will render all the archived rooms of the user





export default userRouter;