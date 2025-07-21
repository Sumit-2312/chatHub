import { atom } from "recoil";

const Allmessages = atom({
    key: "messages",
    default : {
    id: "",
    username : "",
    email : "",
    chats:{
        "":[{
            messageType:"", // text, image, files
            content: "",
            sender: "",
            }]
    }
}
})

export default Allmessages;