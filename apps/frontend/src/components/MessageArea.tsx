import { useEffect, useState } from "react";
import { FaSmile, FaMicrophone, FaPaperclip } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { useRecoilState } from "recoil";
import Allmessages from "../recoil states/messages/roomMessage";
import selectedChat from "../recoil states/chat/selectedChat";
import toast from "react-hot-toast";
import axios from 'axios';
import { useDetalis } from "../recoil states/user details/user";
import { SelectedState } from "../recoil states/sidebar/sidebar";
import websocketState from "../recoil states/websocket/websocket";
import { input } from "motion/react-client";

function MessageArea() {

  const [allChats, setAllChats] = useRecoilState(Allmessages);
  const [messages, setMessages] = useState<any[]>([]);
  const [SelectedRoomName, setSelectedRoomName ] = useRecoilState(selectedChat);
  const [userDetails ,setUserDetails] = useRecoilState(useDetalis);
  const [SelectedSidebar, setSelectedSidebar] = useRecoilState(SelectedState);
  const [SelectedRoomId, setSelectedRoomId ] = useRecoilState(selectedChat);
  const [ws,setWs] = useRecoilState<WebSocket|null>(websocketState);
  const [inputMessage,setInputMessage] = useState("");


  const Messagehandler = (event:any) =>{
    const data = JSON.parse(event.data);
    console.log("Message recieved from websocket server: ",data);
    if(data.type === 'chat' && data.roomName === SelectedRoomName && data.messageType === 'text'){
        setMessages((prevMessages:any)=>{
          return [...prevMessages,{message:data.message, sender:data.sender}]
        })
        console.log(messages);
    }
  }
  
useEffect(() => {
  console.log(SelectedRoomName);

  const fetchMessages = async () => {
    // Use cached messages if available
    //@ts-ignore
    if (allChats?.chats?.[SelectedRoomName]) {
      //@ts-ignore
      setMessages(allChats.chats[SelectedRoomName]);
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/chat/', {
        params: { roomName: SelectedRoomName },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const fetchedMessages = response.data.chats;

      if( fetchedMessages.length === 0){
        setMessages([]);
        return;
      }

      // Set messages in local state
      setMessages(fetchedMessages);

      // Cache in Recoil state
      setAllChats((prev) => ({
        ...prev,
        chats: {
          ...prev.chats,
          [SelectedRoomName]: fetchedMessages
        }
      }));
    } catch (err: any) {
      console.log(err.response);
      toast.error(err?.response?.data?.message || "Network Error");
    }
  };

  if (SelectedRoomName && SelectedSidebar != 'Friends') {
    fetchMessages();
    console.log("Fetched Messages from useEffect : ", messages);
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("WebSocket is open, joining room:", SelectedRoomName);
            ws.send(JSON.stringify({
              type: 'joinRoom',
              roomName: SelectedRoomName,
            }));

            // Clean up old listener to avoid duplication
            ws.removeEventListener("message", Messagehandler);
            ws.addEventListener("message", Messagehandler);
      }
  }

   return () => {
    if (ws) {
      ws.removeEventListener("message", Messagehandler);
      ws.send(JSON.stringify({
        type: 'leaveRoom',
        roomName: SelectedRoomName
      }))
    }
  };
}, [SelectedRoomName]);



  return (
    <div className="h-screen w-full bg-gray-100 text-black flex flex-col">

{/* -------------------------------------------------------Top Navbar----------------------------------------------------------------------- */}
     {SelectedRoomName != "" && SelectedSidebar != 'Friends' && (
       <div className="flex items-center justify-between px-4 h-14 bg-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <img
            src="https://via.placeholder.com/36"
            alt="profile"
            className="w-9 h-9 rounded-full"
          />
          <div>
            <div className="font-medium">{SelectedRoomName}</div>
            <div className="text-xs text-gray-600">online</div>
          </div>
        </div>

      </div>
     )}

{/* --------------------------------------------------------Chat Section--------------------------------------------------------------------- */}

     {
      (SelectedRoomName === "" &&  SelectedSidebar != 'Friends') ? (
        <div className="flex items-center justify-center h-full text-gray-600 font-semibold">
          <div className="text-lg">Select a chat to start messaging</div>
        </div>
      ):(
         <div className="flex-1 relative overflow-y-auto px-4 py-2 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full w-full text-gray-800 font-semi">
                <div>
                    No messages yet. Start the conversation!
                </div>
              </div>
            ):(
              messages.map((message:any)=>(
                <div className={` ${userDetails.id === message.sender? "bg-green-400 text-gray-800 justify-end":"bg-white text-gray-800 justify-start"} `}>
                  {message}
                </div>
              ))
            )
            }
          </div>
      )
     }

     

{/* --------------------------------------------------------Input Area----------------------------------------------------------------------- */}
      {
        (SelectedRoomName !== ""  && SelectedSidebar != 'Friends')&& (
          <div className="flex items-center px-5 py-2 bg-white border-t gap-5">
        <FaSmile className="text-xl text-gray-500 cursor-pointer" />


    {/* ------------------------------------------------File Upload Button---------------------------------------------------------- */}

        <label htmlFor="file-upload" className="cursor-pointer text-gray-500">
          <FaPaperclip className="text-xl" />
        </label>

        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*, .pdf, .doc, .docx"
        />

    {/* ----------------------------------------------------------------------------------------------------------------------------- */}

        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />

        <IoSend  onClick={()=>{
          if(!inputMessage.trim()){
            toast.error("Message cannot be empty");
            return;
          }else{
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'chat',
                roomName: SelectedRoomName,
                messageType: 'text',
                message: inputMessage,
              }));
              setInputMessage(""); 
            } else {
              toast.error("WebSocket is not connected");
            }
          }
        }} className="text-xl text-blue-500 cursor-pointer" />

    {/* ----------------------------------------------------------------------------------------------------------------------------- */}

      </div>
        )
      }

      
    </div>
  );
}

export default MessageArea;
