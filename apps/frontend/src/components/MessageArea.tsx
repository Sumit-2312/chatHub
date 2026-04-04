import { useEffect, useState, useRef } from "react";
import { FaSmile, FaPaperclip } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { useRecoilState } from "recoil";
import toast from "react-hot-toast";
import { format, isToday, isYesterday } from 'date-fns';
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "../../node_modules/highlight.js/styles/vs2015.css";

import selectedChat from "../recoil states/chat/selectedChat";
import { useDetalis } from "../recoil states/user details/user";
import { SelectedState } from "../recoil states/sidebar/sidebar";
import websocketState from "../recoil states/websocket/websocket";
import Allmessages from "../recoil states/messages/roomMessage";

function MessageArea() {
  const [userDetails, setUserDetails] = useRecoilState(useDetalis);
  const [SelectedSidebar, setSelectedSidebar] = useRecoilState(SelectedState);
  const [SelectedRoomId, setSelectedRoomId] = useRecoilState(selectedChat);
  const [ws, setWs] = useRecoilState<WebSocket | null>(websocketState);
  const [inputMessage, setInputMessage] = useState("");


  const [messages, setMessages] = useRecoilState<any[]>(Allmessages);
  const currentRoomId = useRef(SelectedRoomId);
  const currentMessages = useRef(messages);
  const bottomRef = useRef<HTMLDivElement | null>(null);



const handleAIResponse = (content: any) => {
    let data = "";
    try {
      data = JSON.parse(content);
    } catch {
      data = content;
    }

    const markdownComponents = {
      h1: ({ node, ...props }) => (
        <h1 className="text-2xl font-bold my-2 text-black" {...props} />
      ),
      h2: ({ node, ...props }) => (
        <h2 className="text-xl font-semibold my-2 text-black" {...props} />
      ),
      h3: ({ node, ...props }) => (
        <h3 className="text-lg font-semibold my-1 text-black" {...props} />
      ),
      p: ({ node, ...props }) => (
        <p className="text-sm leading-relaxed text-black" {...props} />
      ),
      code({ inline, className, children, ...props }: any) {
        return !inline ? (
          <pre className="bg-[#000000] text-white p-3 rounded-md overflow-x-auto">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        ) : (
          <code className="bg-blue-700 px-1 py-0.5 rounded text-sm">
            {children}
          </code>
        );
      },
    };

    if (Array.isArray(data)) {
      return data.map((item, i) => (
        <div key={i} className="mb-4 p-2">
          {item.type === "theory" ? (
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {item.content}
            </ReactMarkdown>
          ) : item.type === "code" ? (
            <div className="relative mt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.content);
                  toast.success("Code copied!");
                }}
                className="absolute top-1 right-2 text-xs px-2 py-1 font-bold rounded-md text-white bg-gray-700"
              >
                Copy
              </button>

              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {item.content}
              </ReactMarkdown>
            </div>
          ) : null}
        </div>
      ));
    }

    return (
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    );
};



  useEffect(() => {
    currentRoomId.current = SelectedRoomId;
  }, [SelectedRoomId]);

    useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
  if (bottomRef.current) {
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [SelectedRoomId]);



  useEffect(() => {
    currentMessages.current = messages;
  }, [messages]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'dd MMM, h:mm a');
  };




  const sendMessage = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("Can't send message, WebSocket not connected");
      return;
    }
    if (!inputMessage.trim()) {
      toast.error("Message cannot be empty");
      return;
    } 

    let messageData: any = {};
    let Mtype = "chat";

    if (inputMessage.startsWith("@ai")) {
      Mtype = "AiChat";
      messageData = {
        type: Mtype,
        roomId: SelectedRoomId,
        query: inputMessage.slice(3).trim(),
        sender: userDetails._id
      };
    } else {
      messageData = {
        type: "chat",
        messageType: "text",
        roomId: SelectedRoomId,
        message: inputMessage,
        sender: userDetails._id
      };
    }

    ws.send(JSON.stringify(messageData));
    console.log("Sent message from the frontend side:", messageData);
    if(Mtype == "AiChat") toast.loading("Wait AI will respond soon!");

      setMessages((prev) =>{ 
          let message = inputMessage;
          if( inputMessage.startsWith("@ai")){
             message = inputMessage.split("@ai")[1];
          }
        return [
          ...prev,
          {
            messageType: "text",
            content: message,
            sender: {
              _id: userDetails._id,
              username: userDetails.username,
              profilePicture: userDetails.profilePicture,
              discription: userDetails.discription
            },
            senderType: "user",
            createdAt: new Date().toISOString(),
            ChatRoomId: SelectedRoomId
          }]
      });
  

    setInputMessage("");
  };


  const currentRoom = userDetails.rooms.find(
    (room: any) => room._id === SelectedRoomId
  );
  if (!currentRoom) { 
    console.error("Current room not found in user details");
    return null; 
  }
  let currentRoomName = currentRoom?.name || "Unknown Room";
  if(currentRoom.type === "private"){
    const otherMember = currentRoom.members.find((member: any) => member._id !== userDetails._id);
    if(otherMember){
      currentRoomName = otherMember.username;
    }
  }




  return (
    <div
      className={`${
        SelectedRoomId  && SelectedSidebar !== "Friends"
          ? "bg-[url('https://images.unsplash.com/photo-1547499417-60eebaaf9854?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0')] bg-zinc-800"
          : "bg-black"
      } h-screen flex-1 w-[80%] sm:w-[80%] md:w-[70%] bg-no-repeat bg-cover bg-center text-black flex flex-col`}
    >

      {SelectedRoomId && SelectedSidebar !== "Friends" && (
        <div className="flex items-center justify-between px-4 h-14 bg-zinc-800 text-white shadow-sm">
          <div className="flex items-center space-x-3">
            <img
              src="https://via.placeholder.com/36"
              alt="profile"
              className="w-9 h-9 rounded-full"
            />
            <div>
              <div className="font-medium">{currentRoomName}</div>
              <div className="text-xs text-gray-400">online</div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Section */}
      {SelectedRoomId === "" && SelectedSidebar === "Friends" ? (
        <div className="flex items-center justify-center h-full text-gray-600 font-semibold">
          <div className="text-lg">Select a chat to start messaging</div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative  overflow-y-auto px-4 py-5">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full w-full text-gray-800 font-semibold">
              <div>No messages yet. Start the conversation!</div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser =
                message.sender && userDetails._id === message.sender._id;
              const senderName =
                message.senderType === "AI"
                  ? "AI Assistant"
                  : message.sender?.username || "Unknown User";

              return (
                <div
                  key={message._id || index}
                  className={`relative flex  mt-3 flex-col ${
                    isCurrentUser
                      ? "bg-green-300 pt-2 self-end m-2 text-gray-800"
                      : "bg-white text-gray-800 self-start pt-2 m-2"
                  } w-fit max-w-[70%] pb-3 pl-3 pr-4 rounded-md shadow-sm`}
                >
                  {!isCurrentUser && (
                    <div className="text-md font-bold text-gray-600 mb-1">
                      {senderName}
                    </div>
                  )}

                  <div className="flex justify-between gap-3 items-end">
                    <div className="text-md pl-1 overflow-hidden whitespace-wrap">
                      { message.senderType === "user"? (
                        message.content
                      ) : message.senderType === "AI" ? (
                         handleAIResponse(message.content)
                      ) : null
                    }
                    </div>


                    <div className="text-xs text-gray-500">
                      {message.createdAt
                        ? formatTime(message.createdAt)
                        : "Just now"}
                    </div>
                  </div>
                  
                </div>
              );
            })
          )}
            <div ref={bottomRef} className="h-1 w-full border-1 border-red-600" />
        </div>

      )}

    

      {/* Input Area */}
      {SelectedRoomId !== "" && SelectedSidebar !== "Friends" && (
        <div className="flex items-center px-5 py-2 bg-white border-t gap-5">
          <FaSmile className="text-xl text-gray-500 cursor-pointer" />

          <label htmlFor="file-upload" className="cursor-pointer text-gray-500">
            <FaPaperclip className="text-xl" />
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*, .pdf, .doc, .docx"
          />

          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />

          <IoSend
            onClick={sendMessage}
            className="text-xl text-blue-500 cursor-pointer"
          />
        </div>
      )}


    </div>
  );
}

export default MessageArea;
