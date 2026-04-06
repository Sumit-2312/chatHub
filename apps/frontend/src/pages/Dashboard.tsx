import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { haveAnySelectedState } from "../recoil states/sidebar/sidebar";
import { useRecoilState, useRecoilValue } from "recoil";
import { AnimatePresence } from "motion/react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDetalis } from "../recoil states/user details/user";
import ChatSection from "../components/ChatSection";
import AddFriendModal from "../recoil states/modals/AddFriendModal";
import FriendModal from "../components/FriendModal";
import MessageArea from "../components/MessageArea";
import GroupModal from "../components/GroupModal";
import AddGroupModal from "../recoil states/modals/AddGroupModal";
import SettingModal from "../components/SettingModal";
import SettingModalState from "../recoil states/modals/SettingModal";
import websocketState from "../recoil states/websocket/websocket";
import selectedChat from "../recoil states/chat/selectedChat";
import Allmessages from "../recoil states/messages/roomMessage";

function Dashboard() {

    const navigate = useNavigate();
    const haveSelected = useRecoilValue(haveAnySelectedState);
    const [Open , setOpen ] = useState(true);
    const [userDtls, setUserDetails] = useRecoilState(useDetalis);
    const [OpenFriendModal,setOpenFriendModal] = useRecoilState(AddFriendModal);
    const [OpenGroupModal, setOpenGroupModal] = useRecoilState(AddGroupModal);
    const [OpenSettingModal, setOpenSettingModal] = useRecoilState(SettingModalState);
    const [ws,setWs] = useRecoilState(websocketState);
    const currentRoomId = useRecoilValue(selectedChat);
    const [messages,setMessages] = useRecoilState<any[]>(Allmessages);

    const currentRoomRef = useRef(currentRoomId);
    const userRef = useRef(userDtls);

    useEffect(() => { currentRoomRef.current = currentRoomId; }, [currentRoomId]);
    useEffect(() => { userRef.current = userDtls }, [userDtls]);


    useEffect(()=>{
        const token = localStorage.getItem("token");

        if( !token || token == "" ) navigate('/login');
        else{
            const socket = new WebSocket(`ws://localhost:8080?token=${localStorage.getItem("token")}`);

            socket.addEventListener("open",()=>{
                toast.success("WebSocket connected successfully");
                console.log("Connected to websocket server");
                console.log("socket: ",socket);
                // setInterval(() => {
                //     socket.send(JSON.stringify({ type: "ping", time: Date.now() }));
                // }, 3000);

                // setting up the onMEssage handler
                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    const roomId = data.ChatRoomId;
                    console.log("Received message from websocket:", data);
                    console.log(`current room: ${currentRoomRef.current} \n room for which msg is recieved from ws: ${roomId}`)
                    if (data.messageType === "text" && roomId === currentRoomRef.current) {
                        if(data.sender != userRef.current._id ){
                            console.log("Messages are updated");
                            setMessages((prev) => [...prev, data]);
                        }
                    } else if (data.type === "joinedRoom" || data.type === "leftRoom") {
                        toast.success(
                            `You have ${data.type === "joinedRoom" ? "joined" : "left"} ${
                                data.roomId
                            }`
                        );
                    } else if (data.type === "error") {
                        toast.error(data.message);
                    }
                };
                console.log("WebSocket onmessage handler set up");
            })
            socket.addEventListener('error', function (event) {
              console.error('WebSocket error:', event);
            });
            socket.addEventListener('close', function (event) {
              console.log('WebSocket connection closed:', event);
            });
            setWs(socket);
            return ()=>{
                socket.close();
            }
        }
    },[]);



    useEffect(()=>{
        // Logic to handle the state of the dashboard based on selection
        if (haveSelected) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    },[haveSelected]);

    // fetch details of user from the server on mount
    useEffect(()=>{
          const token = localStorage.getItem("token");
            if (!token) return;
        const fetchUserDetails = async()=>{
            try{
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/userDetails`,{
                    headers:{
                        authorization: `Bearer ${localStorage.getItem("token")  }`
                    }
                });
                if(response.status === 200){
                    console.log("User details fetched successfully:", response.data.user);
                }
                else{
                    toast.error("Failed to fetch user details");
                }
                // set the atom state of user details 
                setUserDetails({
                    _id: response.data.user._id,
                    username: response.data.user.username,  
                    email: response.data.user.email,
                    profilePicture: response.data.user.profilePicture,
                    friends: response.data.user.friends,
                    rooms: response.data.user.rooms,
                    archived: response.data.user.archived,
                    blocked: response.data.user.blocked,
                    favourites: response.data.user.favourites,
                    discription: response.data.user.discription
                });
            }
            catch(err:any){
                console.error("Error fetching user details:", err.message);
                toast.error('Failed to fetch user details');
            }
        }
        fetchUserDetails();
    },[]);




  return (
    <div className="flex w-[100vw] overflow-hidden h-screen bg-black">
        <Sidebar/>
        <AnimatePresence mode="wait">
            {Open && <ChatSection key="friends" />}
        </AnimatePresence>  

        <MessageArea/>    

        {OpenFriendModal && <FriendModal/>}

        {OpenGroupModal && <GroupModal/>}

        {OpenSettingModal && <SettingModal/>}

        {/* <GroupSettingsModal/> */}

      </div>
  )
}

export default Dashboard;
