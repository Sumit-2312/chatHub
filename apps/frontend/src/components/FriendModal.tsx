import  { useState } from "react";
import { useRecoilState } from "recoil";
import AddFriendModal from "../recoil states/modals/AddFriendModal";



function FriendModal() {
  const [username, setUsername] = useState("");
  const [isOpen,setIsOpen] = useRecoilState(AddFriendModal);
  const [loading,setLoading] = useState(false);
  
  const handleAdd = async() =>{
    setLoading(true);
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
