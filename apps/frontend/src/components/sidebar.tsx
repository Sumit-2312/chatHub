import { BiMessageRoundedDetail } from "react-icons/bi"
import { CgProfile } from "react-icons/cg"
import SidebarItem from "./sidebarItem"
import { FiMessageCircle } from "react-icons/fi"
import {  IoIosStarOutline } from "react-icons/io"
import { BsArchive, BsPerson } from "react-icons/bs"
import { haveAnySelectedState, SelectedState } from "../recoil states/sidebar/sidebar"
import { useRecoilState, useRecoilValue } from "recoil"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import SettingModalState from "../recoil states/modals/SettingModal"
import { IoLogOutOutline } from "react-icons/io5"
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"


function Sidebar() {

    const [Selected, setSelected] = useRecoilState(SelectedState);
    const haveSelected = useRecoilValue(haveAnySelectedState);
    const [Open , setOpen ] = useState(true);
    const [OpenSettingModal, setOpenSettingModal] = useRecoilState(SettingModalState);
    const navigate = useNavigate();

    const handleOpenSettingModal = () => {
        setOpenSettingModal(true);
    }

    useEffect(()=>{
        if( haveSelected ) {
            setOpen(true);
        }  else {
            setOpen(false);
        }
    },[haveSelected]);

  return (
    <motion.div
      animate={{
        borderRightWidth : Open? "2px" : "0px",
        borderRightColor: Open ? "#030600" : "transparent",
      }}
     className="h-screen relative w-16 bg-gray-950 flex border-r  flex-col items-center justify-end py-5 px-2 ">


        <div className="top w-full flex flex-col justify-start gap-10 items-center h-full ">

            <div onClick={()=>{
                if( Selected != "" ){
                    setSelected("");
                }else setSelected("Chats");
                setOpen((prev)=>!prev);
            }} className="hover:cursor-pointer">
                <BiMessageRoundedDetail className="h-7 w-7 text-blue-500" />
            </div>

            <div className="flex flex-col gap-5 w-full  items-center justify-start">
                <SidebarItem
                title="Chats"
                icon={FiMessageCircle}
                isActive={Selected === "Chats"}
                onClick={() => {
                    if( Selected === 'Chats') return setSelected("");
                    else return setSelected("Chats");
                }}
                />
                <SidebarItem
                    title="Friends"
                    icon={BsPerson}
                    isActive={Selected === "Friends"}
                    onClick={() =>{
                        if( Selected === 'Friends') return setSelected("");
                        else return setSelected("Friends");
                    }}
                />
                <SidebarItem
                    title="Favourites"
                    icon={IoIosStarOutline}
                    isActive={Selected === "Favourites"}
                    onClick={() =>{
                        if( Selected === 'Favourites') return setSelected("");
                        else return setSelected("Favourites");
                    }}
                />
                <SidebarItem
                    title="Archive"
                    icon={BsArchive}
                    isActive={Selected === "Archieve"}
                    onClick={() => {
                        if( Selected === 'Archieve') return setSelected("");
                        else return setSelected("Archieve");
                    }}
                />
            </div>

        </div>

        <div className="bottom flex flex-col gap-3 ">
            <div className="profile-image h-7 w-7 hover:cursor-pointer rounded-full">
                <CgProfile title="Profile" onClick={handleOpenSettingModal} className="h-full w-full text-white" />
            </div>
            <div className="h-7 w-7 hover:cursor-pointer rounded-full relative">
                <IoLogOutOutline title="logout" onClick={()=>{
                    localStorage.removeItem("token");
                    navigate('/login');
                    toast.success("Logged out");
                }} className="h-full w-full text-white" />
            </div>
        </div>

    </motion.div>
  )
}

export default Sidebar