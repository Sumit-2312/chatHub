import { FaCircle } from "react-icons/fa";
import { RiProfileFill } from "react-icons/ri";
import { useRecoilState } from "recoil";
import selectedChat from "../recoil states/chat/selectedChat";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";

interface Props {
  name: string;
  email?: string;
  profilePicture?: string;
  description?: string;
  isOnline?: boolean;
  category: string
}


function ChatListItem({ name,category, email, profilePicture, description, isOnline }: Props) {


  const [SelectedChat,setSelectedChat] = useRecoilState(selectedChat);
  const [clicked,setClicked] = useState(false);


  return (
  <div onMouseLeave={()=>setClicked(false)} onClick={()=>setSelectedChat(email ?? "")} className={` ${SelectedChat === email ? "bg-gray-900":""} flex items-center gap-4 p-3 justify-between pr-10 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors duration-200 group`}>
      
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

      <div className="hidden relative group-hover:block ">
        <BsThreeDots onClick={()=>setClicked((prev)=>!prev)}  className=" size-5 hover:text-blue-500" />
        {clicked && (
          <div className="absolute z-100 w-fit flex flex-col gap-1  top-[100%] left-[100%]  bg-gray-900 text-white">
           
            <div className="w-full text-nowrap p-2 hover:bg-gray-950">
              Remove 
            </div>


            {category === 'Friends' && (
                <div className="w-full text-nowrap p-2 hover:bg-gray-950">
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
