import { FaCircle } from "react-icons/fa";
import { RiProfileFill } from "react-icons/ri";
import { useRecoilState } from "recoil";
import selectedChat from "../recoil states/chat/selectedChat";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";
import websocketState from "../recoil states/websocket/websocket";
import axios from "axios";
import toast from "react-hot-toast";
import Allmessages from "../recoil states/messages/roomMessage";


interface Props {
  name: string;
  email?: string;
  profilePicture?: string;
  description?: string;
  isOnline?: boolean;
  category: string
  onRemove: () => void;
  onChat?: () => void;
}


function ChatListItem({onRemove,onChat, name,category, email, profilePicture, description, isOnline }: Props) {


  const [SelectedChat,setSelectedChat] = useRecoilState(selectedChat);
  const [clicked,setClicked] = useState(false);
  const [ws, setWs] = useRecoilState<WebSocket | null>(websocketState);
  const [messages,setMessages] = useRecoilState(Allmessages);
  
    const fetchMessages = async () => {
      try {
        console.log("Trying to fetch messages for room: ", name);
        const response = await axios.get(`http://localhost:5000/chat/`, {
          params: { roomName: name },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
  
        const normalized = (response.data.chats || []).map((msg: any) => ({
          ...msg,
          sender:
            msg.sender ||
            (msg.senderType === "AI"
              ? { _id: "AI", username: "AI Assistant", profilePicture: "" }
              : null)
        }));
  
        setMessages(normalized);
      } catch (err: any) {
        console.error("Error fetching messages:", err.message);
        toast.error("Failed to fetch messages");
      }
    };
  

  const joinWebSocketRoom = ()=>{
      if( ws && ws.readyState === WebSocket.OPEN ){
        ws.send( JSON.stringify({ type: "joinRoom", roomName: name }) );
        console.log(`Sent joinRoom request for room: ${name}`);
      }
      else {
        console.log("Failed to join room, WebSocket not connected");
      }
  }

  const  handleClicked = async ()=>{
    setSelectedChat(name ?? "");
    if( category === 'Chats' ){
      // we also need to join the websocket room here
      joinWebSocketRoom();
      await fetchMessages();
      console.log("Fetched the messages for the selected chat room");
    }
  }


  return (
  <div onMouseLeave={()=>setClicked(false)} onClick={handleClicked} className={` ${SelectedChat === name ? "bg-gray-900":""} flex items-center gap-4 p-3 justify-between pr-10 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 group `}>
      
      <div className="flex items-center gap-3">
        <div className="relative">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ):(
          <RiProfileFill className="h-10 w-10 rounded-full "/>  
        )}
        {isOnline && (
          <FaCircle className="absolute bottom-0 right-0 h-3 w-3 text-green-500 bg-gray-950 rounded-full border-2 border-gray-950" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">{name}</span>
        {email && <span className="text-xs text-gray-400">{email}</span>}
        {description && <span className="text-xs text-gray-500 italic">{description}</span>}
      </div>
      </div>

        {/* Three dots in the top right corner for options */}
      <div className="hidden relative group-hover:block ">
        <BsThreeDots onClick={()=>setClicked((prev)=>!prev)}  className=" size-5 hover:text-blue-500" />
        {clicked && (
          <div className="absolute z-100 w-fit flex flex-col gap-1  top-[100%] left-[100%]  bg-gray-900 text-white">
           
            <div onClick={onRemove} className="w-full text-nowrap p-2 hover:bg-gray-950">
              Remove 
            </div>


            {category === 'Friends' && (
                <div onClick={onChat} className="w-full text-nowrap p-2 hover:bg-gray-950">
                  Chat
                </div>
            )}


            <div>

            </div>
          </div>
        )} 
      </div>

    </div>
  );
}

export default ChatListItem;
