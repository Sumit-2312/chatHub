import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useDetalis } from "../recoil states/user details/user";
import { toast } from "react-hot-toast"
import AddGroupModal from "../recoil states/modals/AddGroupModal";
import axios from "axios";

const GroupModal = () => {
  const [userDetails,setUserDetails] = useRecoilState(useDetalis);
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupModal, setGroupModal] = useRecoilState(AddGroupModal);
  const [membersToshow, setMembersToshow] = useState<string[]>([]);

  useEffect(() => {
    setMembers([userDetails.id]); // current user added by default
    setMembersToshow([userDetails.username]); // current user shown by default
  }, [userDetails.username]);



  const addMember = () => {
    const trimmed = memberInput.trim();
    if (
      trimmed &&
      !members.includes(trimmed) &&
      userDetails.friends.some((f) => f.username === trimmed)
    ) {
      const memberId = userDetails.friends.find((f) => f.username === trimmed)?._id ;
      if (memberId) {
        setMembers((prev) => [...prev, memberId]);
        setMembersToshow((prev) => [...prev, trimmed]);
        setMemberInput("");
      } else {
        toast.error("User not found in your friends list!");
      }
    }
     else {
      toast.error("User not found in your friends list!");
    }
  };

  const removeMember = (username: string) => {
    if (username === userDetails.username) return; // don't remove self
    const memberId = userDetails.friends.find((f) => f.username === username)?._id;
    if (!memberId) return; // user not found in friends list
    setMembers((prev) => prev.filter((m) => m !== memberId));
    setMembersToshow((prev) => prev.filter((m) => m !== username));

  };

  const handleSubmit = async() => {
    if (members.length < 1) {
      toast.error("Please add at least one member.");
      return;
    };

    const nameToSend = members.length > 2 ? groupName.trim() : members[1];

    try{
      const response = await axios.post('http://localhost:5000/room/createRoom', {
        name: nameToSend,
        members: members.filter((m) => m !== userDetails.username), // exclude self
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setUserDetails((prev)=>{
        return{
          ...prev, rooms: [...prev.rooms,{
            id: response.data.room._id,
            name: response.data.room.name,
            member: response.data.room.members.map((m:any) => ({
              id: m._id,
              username: m.username,
              email: m.email,
              profilePicture: m.profilePicture || "",
              discription: m.discription || ""
            }))
          }]
        }
      })
      toast.success("Group created successfully!");
      setGroupModal(false);
    }catch(err:any){
      toast.error(err?.response?.data?.message || "Failed to create group.");
      setGroupModal(false);
      return;
    }

    if (members.length > 2 && !nameToSend) {
      toast.error("Please enter group name.");
      return;
    }


  };

  // Dynamic friend suggestions
  const filteredSuggestions = userDetails.friends.filter(
    (f) =>
      f.username
        .toLowerCase()
        .includes(memberInput.toLowerCase().trim()) &&
      !members.includes(f.username)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">

        <h2 className="text-xl font-semibold mb-4 text-center">Create Group</h2>

        {/* Add Member Input */}
        <div className="mb-2 relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              placeholder="Enter username"
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              onClick={addMember}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add
            </button>
          </div>

          {/* Suggestion Dropdown */}
          {filteredSuggestions.length > 0 && memberInput && (
            <div className="absolute top-full left-0 right-0 bg-white border shadow rounded mt-1 max-h-40 overflow-y-auto z-10">
              {filteredSuggestions.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    setMemberInput(f.username);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {f.username}
                </div>
              ))}
            </div>
          )}
        </div>

        {membersToshow.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">Members:</p>
            <ul className="space-y-1">
              {membersToshow.map((username, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{username}</span>
                  {username !== userDetails.username && (
                    <button
                      onClick={() => removeMember(username)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Group Name Input */}
        {membersToshow.length > 2 && (
          <div className="mb-4">
            <label className="block font-medium mb-1">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        )}

        {/* Auto-generated group name preview */}
        {membersToshow.length === 2 && (
          <div className="text-sm text-gray-600 italic mb-4">
            Group name will be: <strong>{membersToshow[1]}</strong>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
           onClick={()=>setGroupModal(false)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded text-white ${
              members.length < 1 ||
              (members.length > 2 && groupName.trim() === "")
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={
              members.length < 1 ||
              (members.length > 2 && groupName.trim() === "")
            }
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
