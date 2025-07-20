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
            id: "",
            name:"",
            member:[{
            id: "",
            username:"",
            email: "",
            profilePicture: "",
            discription: ""
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