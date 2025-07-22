import React, { useState } from "react";
import { FaUserEdit, FaPlus, FaTrash, FaRegImage } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { MdGroup } from "react-icons/md";
import { BiImage } from "react-icons/bi";

const GroupSettingsModal = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [groupName, setGroupName] = useState("Developers Hub");
  const [isEditingName, setIsEditingName] = useState(false);
  const [members, setMembers] = useState([
    { id: 1, name: "+91 72096 20028", about: "Limited Edition", img: "" },
    { id: 2, name: "+91 72191 43239", about: "Stay Humble", img: "" },
    { id: 3, name: "Shree Krishna", about: "+91 72600 87248", img: "" },
  ]);
  const [newMember, setNewMember] = useState("");

  const handleAddMember = () => {
    if (!newMember.trim()) return;
    setMembers([...members, { id: Date.now(), name: newMember, about: "Hey there! I’m using DevChat", img: "" }]);
    setNewMember("");
  };

  const handleRemoveMember = (id: number) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="flex w-[900px] h-[600px] bg-[#1E1E1E] text-white rounded-xl overflow-hidden shadow-lg border border-gray-700">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#2A2A2A] p-4 flex flex-col gap-4 border-r border-gray-700">
        <div
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
            activeTab === "overview" ? "bg-[#3B3B3B]" : ""
          }`}
        >
          <IoMdSettings className="text-lg" />
          <span>Overview</span>
        </div>
        <div
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
            activeTab === "members" ? "bg-[#3B3B3B]" : ""
          }`}
        >
          <MdGroup className="text-lg" />
          <span>Members</span>
        </div>
        <div
          onClick={() => setActiveTab("media")}
          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
            activeTab === "media" ? "bg-[#3B3B3B]" : ""
          }`}
        >
          <BiImage className="text-lg" />
          <span>Media</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {!isEditingName ? (
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  {groupName}
                  <FaUserEdit
                    onClick={() => setIsEditingName(true)}
                    className="cursor-pointer hover:text-blue-400"
                  />
                </h2>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="bg-gray-700 p-2 rounded-md text-white outline-none"
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="bg-blue-500 px-3 py-1 rounded-md"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-gray-400">Admin</h3>
              <p className="text-white">You</p>
            </div>
          </div>
        )}

        {/* Members */}
        {activeTab === "members" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold mb-2">Group Members ({members.length})</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter member name or number"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                className="flex-1 bg-gray-700 p-2 rounded-md text-white outline-none"
              />
              <button
                onClick={handleAddMember}
                className="bg-green-600 px-4 rounded-md hover:bg-green-700"
              >
                <FaPlus />
              </button>
            </div>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-gray-800 p-3 rounded-md"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-400">{member.about}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media */}
        {activeTab === "media" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold mb-2">Shared Media</h2>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((media) => (
                <div
                  key={media}
                  className="bg-gray-700 rounded-lg h-32 flex items-center justify-center text-gray-300 text-sm"
                >
                  <FaRegImage className="text-2xl" />
                  Media {media}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupSettingsModal;
