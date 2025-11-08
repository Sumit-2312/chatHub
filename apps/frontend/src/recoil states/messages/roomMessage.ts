import { atom } from "recoil";

const Allmessages = atom<any[]>({
    key: "messages",
    default : []
})

export default Allmessages;