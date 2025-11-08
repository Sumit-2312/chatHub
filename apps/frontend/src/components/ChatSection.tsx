import { motion } from "framer-motion";
import { useRecoilState } from "recoil";
import { SelectedState } from "../recoil states/sidebar/sidebar";
import { MdOutlineGroup } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";
import { useDetalis } from "../recoil states/user details/user";
import ChatListItem from "./ChatListItem";
import { useEffect, useState } from "react";
import AddFriendModal from "../recoil states/modals/AddFriendModal";
import AddGroupModal from "../recoil states/modals/AddGroupModal";
import axios from "axios";
import toast from "react-hot-toast";
import selectedChat from "../recoil states/chat/selectedChat";

function ChatSection() {
  const [Selected] = useRecoilState(SelectedState);
  const [userDetail] = useRecoilState(useDetalis);
  const [resizing, setResizing] = useState(false);
  const [width, setWidth] = useState(420);
  const [FriendModal, setFriendModal ] = useRecoilState(AddFriendModal);
  const [GroupModal, setGroupModal ] = useRecoilState(AddGroupModal);
  const [userDetails, setUserDetails] = useRecoilState(useDetalis);
  const [Chat, setChat] = useRecoilState(selectedChat);
  const [Sidebar,setSidebar] = useRecoilState(SelectedState);

  const handleMouseMove = (e: MouseEvent) => {
    if (resizing) {
      const newWidth = e.clientX;
      if (newWidth >= 240 && newWidth <= 600) {
        setWidth(newWidth);
      }
    }
  };

  const handleMouseDown = () => {
    setResizing(true);
    document.body.style.userSelect = "none";
    document.body.classList.add("dragging");
  };

  const handleMouseUp = () => {
    setResizing(false);
    document.body.style.userSelect = "";
    document.body.classList.remove("dragging");
  };

  const openModalFriends = () =>{
    setFriendModal(true);
  }

  const openModalGroup = () =>{
    setGroupModal(true);
  }

  const handleRemoveFriend = async(email: string) => {
    // Logic to remove friend
    try{
      const response = await axios.post('http://localhost:5000/user/removeFriend',{
        friendEmail : email
      },{
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setUserDetails(prev=>({
        ...prev,
        friends: prev.friends.filter(friend => friend.email !== email)
      }))
      toast.success(response.data.message || "Friend removed successfully");

    }catch(err:any){
      toast.error(err.response.data.message || "An error occurred while removing friend");
    }
  };

  const handleRemoveArchived = async(email: string) => {
    // Logic to remove archived chat
    try{
      const response = await axios.post('http://localhost:5000/user/removeFromArchived',{
        friendEmail: email
      },{
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setUserDetails(prev=>({
        ...prev,
        archived: prev.archived.filter(arch => arch.email !== email)
      }))
      toast.success(response.data.message || "Archived chat removed successfully");
    }
    catch(err:any){
      toast.error(err.response.data.message || "Failed to remove archived chat");
    }
  };

  const handleRemoveChat = async(name: string) => {
    // Logic to remove chat
    try{
      const response = await axios.post('http://localhost:5000/room/deleteRoom',{
        name
      },{
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      setUserDetails(prev=>({
        ...prev,
        rooms: prev.rooms.filter(room => room.name !== name)
      }))
      
      toast.success(response.data.message || "Chat removed successfully");
    }catch(err:any){  
      toast.error(err.response.data.message || "An error occurred while removing chat");
    }
  };

  const handleRemoveFavourite = async(email: string) => {
    // Logic to remove favourite
    try{
      const response = await axios.post('http://localhost:5000/user/removeFromFavourites',{
        friendEmail: email
    } ,{
      headers:{
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
      }
    )
    setUserDetails(prev=>({
      ...prev,  
        favourites: prev.favourites.filter(fav => fav.email !== email)
    }))
    toast.success(response.data.message || "Favourite removed successfully");

    }catch(err:any){
        toast.error(err.response.data.message || "An error occurred while removing favourite");
    }
  };

  const handleRemoveBlocked = async(email: string) => {
    // Logic to remove blocked user
    try{
      const response = await axios.post('http://localhost:5000/user/removeFromBlocked',{
        friendEmail: email
      },{
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setUserDetails(prev=>({
        ...prev,
        blocked: prev.blocked.filter(block => block.email !== email)
      }))
      toast.success(response.data.message || "Blocked user removed successfully");
    }catch(err:any){  
      toast.error(err.response.data.message || "An error occurred while removing blocked user");
    }
  };

  const handleChatWithFriend = async(id: string,name:string) => {
    // Logic to start chat with friend
    try{
      const response = await axios.post('http://localhost:5000/room/createRoom',{
        name,
        members:[id]
      },{
        headers:{
          Authorization : `Bearer ${localStorage.getItem('token')}`
        }
      })

      setUserDetails(prev=>({
        ...prev,
        rooms: [
          ...prev.rooms,
          {
            id: response.data.room._id,
            name: response.data.room.name,
            member: response.data.room.members 
          }
        ]
      }))

      setSidebar("Chats");
      setChat(response.data.room.name);
    }catch(err:any){
      toast.error(err.response.data.message || "An error occurred while starting chat");
    }
  };

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [resizing]);

  return (
    <div className="relative h-full">

      <div
        onMouseDown={handleMouseDown}
        className={` ${resizing? "bg-blue-100" : ""} w-1 h-full hover:cursor-col-resize hover:bg-blue-100 absolute right-0 top-0 z-10`}
      ></div>


        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={!resizing ? { width: width, opacity: 1 } : false}
          exit={{ width: 0, opacity: 0, transition: { duration: 0.5 } }}
          transition={!resizing ? { duration: 0.4, ease: "easeInOut" } : { duration: 0 }}
          className="h-screen relative bg-gray-950 flex flex-col gap-5 items-center justify-start overflow-hidden text-white py-5"
          style={{ width: `${width}px` }}
        >

          <div className="top flex items-center justify-between w-full border-b px-10 pb-5 border-blue-950 text-white">
            <h1 className="text-2xl font-semibold">{Selected}</h1>
            {(Selected === "Chats" || Selected === "Friends") && (
              <div className="right flex items-center gap-5">
                {Selected === "Chats" && (
                  <>
                    <div onClick={openModalGroup} title="Add new Group" className="hover:cursor-pointer border rounded-md p-1 border-gray-700 hover:bg-gray-800">
                      <MdOutlineGroup className="h-6 w-6" />
                    </div>
                    <div onClick={openModalFriends} title="Add new Friend" className="hover:cursor-pointer border rounded-md p-1 border-gray-700 hover:bg-gray-800">
                      <CiCirclePlus className="h-6 w-6" />
                    </div>
                  </>
                )}
                {Selected === "Friends" && (
                  <div onClick={openModalFriends} title="Add new Friend" className="border hover:cursor-pointer rounded-md p-1 border-gray-700 hover:bg-gray-800">
                    <CiCirclePlus className="h-6 w-6" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="middle w-full px-10">
            <input
              type="text"
              placeholder="Search"
              className="w-full focus:outline-none focus:ring-0 focus:border-none rounded-md bg-gray-900 px-3 py-3 placeholder-gray-400"
            />
          </div>

          <div className="bottom scrollbar-hide w-full px-8 flex flex-col gap-2 overflow-y-auto h-full">
            {Selected === "Friends" && ( userDetail.friends.length === 0 ||
              userDetail.friends[0].id === "" ? (
                <div className="text-center text-white mt-10 font-bold text-2xl">No friends found</div>
              ) :
              userDetail.friends?.map((friend:any) => (
                <ChatListItem
                  onRemove={() => handleRemoveFriend(friend.email)}
                  onChat={() => handleChatWithFriend(friend._id,friend.username)}
                  category='Friends'
                  key={friend.id}
                  name={friend.username}
                  email={friend.email}
                  profilePicture={friend.profilePicture}
                  description={friend.discription}
                  isOnline={true}
                />
              )))}

            {Selected === "Chats" &&( userDetail.rooms.length === 0 ||
               userDetail.rooms[0].id === "" ? (
                <div className="text-center text-white mt-10 font-bold text-2xl">No Chats found</div>
              ) :
              userDetail.rooms?.map((chat) => (
                <ChatListItem onRemove={()=>handleRemoveChat(chat.name)} category='Chats' key={chat.id} name={chat.name} />
              )))}

            {Selected === "Archieve" &&( userDetail.archived.length === 0 ||
              userDetail.archived[0].id === "" ? (
                <div className="text-center text-white mt-10 font-bold text-2xl">No archived chats</div>
              ) :
              userDetail.archived?.map((arch) => (
                <ChatListItem
                  onRemove={()=>handleRemoveArchived(arch.email)}
                  category='Archived'
                  key={arch.id}
                  name={arch.username}
                  email={arch.email}
                  profilePicture={arch.profilePicture}
                  description={arch.discription}
                />
              )))
              }

            {Selected === "Favourites" && ( userDetail.favourites.length === 0 ||
                userDetail.favourites[0].id === "" ? (
                  <div className="text-center text-white mt-10 font-bold text-2xl">No favourites found</div>
                ) :
                userDetail.favourites?.map((fav) => (
                  <ChatListItem
                    onRemove={()=>handleRemoveFavourite(fav.email)}
                    category='Favourites'
                    key={fav.id}
                    name={fav.username}
                    email={fav.email}
                    profilePicture={fav.profilePicture}
                    description={fav.discription}
                  />
                ))
              )
            }

            {Selected === "Blocked" &&
             ( userDetail.blocked.length === 0 || userDetail.blocked[0].id === "" ? (
                <div className="text-center text-white mt-10 font-bold text-2xl">No blocked users</div>
              ) :
              userDetail.blocked?.map((block) => (
                <ChatListItem
                  onRemove={()=>handleRemoveBlocked(block.email)}
                  category='Blocked'
                  key={block.id}
                  name={block.username}
                  email={block.email}
                  profilePicture={block.profilePicture}
                  description={block.discription}
                />
              )))
            }
          </div>

        </motion.div>

    </div>
  );
}

export default ChatSection;
