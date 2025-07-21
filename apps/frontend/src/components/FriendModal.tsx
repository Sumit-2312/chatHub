import  { useState } from "react";
import { useRecoilState } from "recoil";
import AddFriendModal from "../recoil states/modals/AddFriendModal";
import toast from "react-hot-toast";
import axios from "axios";
import { useDetalis } from "../recoil states/user details/user";



function FriendModal() {
  const [username, setUsername] = useState("");
  const [isOpen,setIsOpen] = useRecoilState(AddFriendModal);
  const [loading,setLoading] = useState(false);
  const [userDetails, setUserDetails] = useRecoilState(useDetalis);
  
  const handleAdd = async() =>{
    setLoading(true);
    try{
        const response = await axios.post(`http://localhost:5000/user/addFriend`,{
          username: username.trim()
        },{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
        if(response.status === 200){
          setLoading(false);
          setUserDetails((prevDetails)=>{
            return{
              ...prevDetails,
              friends:[
                ...prevDetails.friends,
                {
                  id: response.data.id,
                  username: response.data.username,
                  email: response.data.email,
                  profilePicture: response.data.profilePicture || "",
                  discription: response.data.discription || "Hi, I am using ChatHub!"
                }
              ]
            }
          })
          toast.success("Friend added successfully");
          setIsOpen(false);
        }
        else{
          throw new Error(response.data.message || "Failed to add friend");
        }
    }
    catch(error:any){
      console.error("Error adding new freind: ",error);
      toast.error(error.response.data.message || "Failed to add friend");
      setLoading(false);
      setIsOpen(false);
    }
  }

  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div className="bg-gray-950 rounded-xl shadow-lg p-6 w-80">
        <h2 className="text-xl font-semibold mb-4 text-center text-white">
          Add New Friend
        </h2>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={()=>setIsOpen(false)}
            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-sm text-black font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className={` ${loading? "bg-green-300 text-black hover:cursor-not-allowed":"bg-blue-500 hover:bg-blue-700"} px-4 py-2 rounded-md font-semibold  text-white text-sm`}
          >
            {loading ? "Adding...": "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendModal;
