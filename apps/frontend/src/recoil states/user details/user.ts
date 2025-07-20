import { atom } from "recoil";

export const useDetalis = atom({
    key:"userDetails",
    default: {
        id: "",
        username: "",
        email: "",
        profilePicture: "", 
        friends: [{
            id: "1",
            username:"Sumit",
            email: "sumitsongh@gmail.com",
            profilePicture: "",
            discription: "Hi i am using ChatHub!"
        }],
        rooms: [{
            id: "1",
            name:"Sumit",
            member:[{
            id: "1",
            username:"Sumit",
            email: "sumitsongh@gmail.com",
            profilePicture: "",
            discription: "Hi i am using ChatHub"
        }]
        }],
        archived: [{
            id: "",
            username:"",
            email: "",
            profilePicture: "",
            discription: ""
        }],
        blocked: [{
            id: "",
            username:"",
            email: "",
            profilePicture: "",
            discription: ""
        }],
        favourites: [{
            id: "",
            username:"",
            email: "",
            profilePicture: "",
            discription: ""
        }],
        discription: ""
    }
});