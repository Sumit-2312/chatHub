import { useEffect, useState } from "react";
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
import GroupSettingsModal from "../components/GroupSettingModal";
import websocketState from "../recoil states/websocket/websocket";

function Dashboard() {

    const navigate = useNavigate();
    const haveSelected = useRecoilValue(haveAnySelectedState);
    const [Open , setOpen ] = useState(true);
    const [userDtls, setUserDetails] = useRecoilState(useDetalis);
    const [OpenFriendModal,setOpenFriendModal] = useRecoilState(AddFriendModal);
    const [OpenGroupModal, setOpenGroupModal] = useRecoilState(AddGroupModal);
    const [OpenSettingModal, setOpenSettingModal] = useRecoilState(SettingModalState);
    const [ws,setWs] = useRecoilState(websocketState);

    useEffect(()=>{
        const token = localStorage.getItem("token");
        if( !token ) navigate('/login');
        else{
            const socket = new WebSocket(`http://localhost:8080?token=${localStorage.getItem("token")}`);

            socket.addEventListener("open",()=>{
                console.log("Connected to websocket server");
            })
            socket.addEventListener('error', function (event) {
              console.error('WebSocket error:', event);
            });
            socket.addEventListener('close', function (event) {
              console.log('WebSocket connection closed:', event);
            });
            setWs(socket);
        }
    },[]);

    useEffect(()=>{
        console.log("websocket's socket: ",ws);
    },[ws])

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
        const fetchUserDetails = async()=>{
            try{
                const response = await axios.get("http://localhost:5000/user/userDetails",{
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
                    id: response.data.user._id,
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

    useEffect(()=>{
        console.log(userDtls)
    },[userDtls]);


  return (
    <div className="flex items-center  w-screen h-screen overflow-hidden bg-black">
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
