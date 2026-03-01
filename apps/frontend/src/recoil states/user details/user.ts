import { atom } from "recoil";

export const useDetalis = atom({
    key:"userDetails",
    default: {
        _id: "",
        username: "",
        email: "",
        profilePicture: "", 
        friends: [{
            _id: "1",
            username:"Sumit",
            email: "sumitsongh@gmail.com",
            pro_filePicture: "",
            discription: "Hi i am using ChatHub!"
        }],
        rooms: [{
            _id: "1",
            type: "private",
            name:"Sumit",
            members:[{
            id: "1",
            username:"Sumit",
            email: "sumitsongh@gmail.com",
            profilePicture: "",
            discription: "Hi i am using ChatHub"
        }]
        }],
        archived: [{
            _id: "",
            username:"",
            email: "",
            profilePicture: "",
            discription: ""
        }],
        blocked: [{
            _id: "",
            username:"",
            email: "",
            profilePicture: "",
            discription: ""
        }],
        favourites: [{
            _id: "",
            username:"",
            email: "",
            profilePicture: "",
            discription: ""
        }],
        discription: ""
    }
});