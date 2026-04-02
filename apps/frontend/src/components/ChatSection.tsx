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
import websocketState from "../recoil states/websocket/websocket";

function ChatSection() {
  const [Selected] = useRecoilState(SelectedState);
  const [userDetail] = useRecoilState(useDetalis);
  // const [resizing, setResizing] = useState(false);
  const [width, setWidth] = useState(420);
  const [FriendModal, setFriendModal ] = useRecoilState(AddFriendModal);
  const [GroupModal, setGroupModal ] = useRecoilState(AddGroupModal);
  const [userDetails, setUserDetails] = useRecoilState(useDetalis);
  const [Chat, setChat] = useRecoilState(selectedChat);
  const [Sidebar,setSidebar] = useRecoilState(SelectedState);
  const [ws, setWs] = useRecoilState<WebSocket | null>(websocketState);



  const joinWebSocketRoom = (ws: WebSocket | null, roomId: string)=>{
    console.log(`Attempting to join WebSocket room: ${roomId}`);
      if( ws && ws.readyState === WebSocket.OPEN ){
        ws.send( JSON.stringify({ type: "joinRoom", roomId: roomId }) );
        console.log(`Sent joinRoom request for room: ${roomId}`);
      }
      else {
        console.log("Failed to join room, WebSocket not connected");
      }
  }

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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/removeFriend`,{
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/removeFromArchived`,{
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/room/deleteRoom`,{
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/removeFromFavourites`,{
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/removeFromBlocked`,{
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

  const handleChatWithFriend = async(id: string) => {
    // Logic to start chat with friend
    console.log("Starting chat with friend ID:", id);
    try{
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/room/createRoom`,{
        members:[id],
        type: "private"
      },{
        headers:{
          Authorization : `Bearer ${localStorage.getItem('token')}`
        }
      })
      let roomName = response.data.room.name;
      // console.log("Chat Room Response while creating chat with friend :", response.data);
      // console.log("User's friends", userDetails.friends);
      // console.log("roomType: ", response.data.room.type);
      if( response.data.room.type === "private"){
        roomName = userDetails.friends.find(friend => friend._id === id)?.username || "Chat";
        const existingRoom = response.data.existed;
        if(existingRoom){
          const roomId = response.data.room._id;
          setChat(roomId);
          setSidebar("Chats");
          joinWebSocketRoom(ws, roomId);
          return;
        }
      }
      console.log("Final Room Name:", roomName);
      setUserDetails(prev=>({
        ...prev,
        rooms: [
          ...prev.rooms,
          {
            type: response.data.type,
            _id: response.data.room._id,
            name: roomName ,
            members: response.data.room.members 
          }
        ]
      }))

      setSidebar("Chats");
      setChat(response.data.room._id);
    }catch(err:any){
      toast.error(err.response.data.message || "An error occurred while starting chat");
    }
  };

  // useEffect(() => {
  //   if (resizing) {
  //     document.addEventListener("mousemove", handleMouseMove);
  //     document.addEventListener("mouseup", handleMouseUp);
  //   }

  //   return () => {
  //     document.removeEventListener("mousemove", handleMouseMove);
  //     document.removeEventListener("mouseup", handleMouseUp);
  //     document.body.style.userSelect = "";
  //   };
  // }, [resizing]);

  return (
    <div className="relative sm:w-[80%] md:w-[25%] h-full flex-none " >

      <div
        onMouseDown={handleMouseDown}
        className={`w-1 h-full hover:cursor-col-resize hover:bg-blue-100 absolute right-0 top-0 z-10`}
      ></div>


        <motion.div
          className="h-screen w-full relative bg-gray-950 flex flex-col gap-5 items-center justify-start overflow-hidden text-white py-5"
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

          <div className="middle  w-full px-10">
            <input
              type="text"
              placeholder="Search"
              className="w-full focus:outline-none focus:ring-0 focus:border-none rounded-md bg-gray-900 px-3 py-3 placeholder-gray-400"
            />
          </div>

          <div className="bottom scrollbar-hide w-full px-8 flex flex-col gap-2 overflow-y-auto h-full">
            {Selected === "Friends" && ( userDetail.friends.length === 0 ||
              userDetail.friends[0]._id === "" ? (
                <div className="text-center text-white mt-10 font-bold text-2xl">No friends found</div>
              ) :
              userDetail.friends?.map((friend:any) => (
                <ChatListItem
                  onRemove={() => handleRemoveFriend(friend.email)}
                  onChat={() => handleChatWithFriend(friend._id)}
                  category='Friends'
                  id={friend.id}
                  name={friend.username}
                  email={friend.email}
                  profilePicture={friend.profilePicture}
                  description={friend.discription}
                  isOnline={true}
                />
              )))}

            {Selected === "Chats" &&( userDetail.rooms.length === 0 ||
               userDetail.rooms[0]._id === "" ? (
                <div className="text-center text-white mt-10 font-bold text-2xl">No Chats found</div>
              ) :(
                  userDetail.rooms?.map((chat) => {
                    console.log("Rendering chat: ", chat);
                    //@ts-ignore
                    console.log("chat id: ", chat._id);
                    if(chat.type === "private") {
                      const otherMember = chat.members.find((m:any) => m._id !== userDetail._id);
                      //@ts-ignore
                      const roomName = userDetail.friends.find(f => f._id === otherMember?._id)?.username || "Chat";
                      return <ChatListItem 
                          onRemove={() => handleRemoveChat(chat.name)} 
                          category='Chats'
                          //@ts-ignore 
                          id={chat._id} 
                          name={roomName} 
                      />;
                    }
                    return <ChatListItem 
                        onRemove={() => handleRemoveChat(chat.name)} 
                        category='Chats' 
                        id={chat._id} 
                        name={chat.name} 
                    />;
                  })
              ))}

            {Selected === "Archieve" &&( userDetail.archived.length === 0 ||
              userDetail.archived[0]._id === "" ? (
                <div className="text-center text-white mt-10 font-bold text-2xl">No archived chats</div>
              ) :
              userDetail.archived?.map((arch) => (
                <ChatListItem
                  onRemove={()=>handleRemoveArchived(arch.email)}
                  category='Archived'
                  id={arch._id}
                  name={arch.username}
                  email={arch.email}
                  profilePicture={arch.profilePicture}
                  description={arch.discription}
                />
              )))
              }

            {Selected === "Favourites" && ( userDetail.favourites.length === 0 ||
                userDetail.favourites[0]._id === "" ? (
                  <div className="text-center text-white mt-10 font-bold text-2xl">No favourites found</div>
                ) :
                userDetail.favourites?.map((fav) => (
                  <ChatListItem
                    onRemove={()=>handleRemoveFavourite(fav.email)}
                    category='Favourites'
                    id={fav._id}
                    name={fav.username}
                    email={fav.email}
                    profilePicture={fav.profilePicture}
                    description={fav.discription}
                  />
                ))
              )
            }

            {Selected === "Blocked" &&
             ( userDetail.blocked.length === 0 || userDetail.blocked[0]._id === "" ? (
                <div className="text-center text-white mt-10 font-bold text-2xl">No blocked users</div>
              ) :
              userDetail.blocked?.map((block) => (
                <ChatListItem
                  onRemove={()=>handleRemoveBlocked(block.email)}
                  category='Blocked'
                  id={block._id}
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
