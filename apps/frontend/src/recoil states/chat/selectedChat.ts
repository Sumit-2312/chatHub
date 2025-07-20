import { atom } from "recoil";

 const selectedChat = atom({
    key: "SelectedChat",
    default: ""
})

export default selectedChat;