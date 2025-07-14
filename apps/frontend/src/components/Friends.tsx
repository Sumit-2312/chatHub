import { motion } from "framer-motion";
import { useRecoilState } from "recoil";
import { SelectedState } from "../recoil states/sidebar/sidebar";
import { MdOutlineGroup } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";
import { useDetalis } from "../recoil states/user details/user";

function Friends() {
  const [Selected] = useRecoilState(SelectedState);
  const [userDetail] = useRecoilState(useDetalis);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "20%", opacity: 1 }}
      exit={{ width: 0, opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="h-full bg-gray-950 flex flex-col gap-5 items-center justify-start overflow-hidden text-white py-5"
    >
      {/* Top Section */}
      <div className="top flex items-center justify-between w-full border-b px-10 pb-5 border-blue-950 text-white">
        <h1 className="text-2xl font-semibold">{Selected}</h1>
        {(Selected === "Chats" || Selected === "Friends") && (
          <div className="right flex items-center gap-5">
            {Selected === "Chats" && (
              <>
                <div title="Add new Group" className="hover:cursor-pointer border rounded-md p-1 border-gray-700 hover:bg-gray-800">
                  <MdOutlineGroup className="h-6 w-6" />
                </div>
                <div title="Add new Friend" className="hover:cursor-pointer border rounded-md p-1 border-gray-700 hover:bg-gray-800">
                  <CiCirclePlus className="h-6 w-6" />
                </div>
              </>
            )}
            {Selected === "Friends" && (
              <div title="Add new Friend" className="border hover:cursor-pointer rounded-md p-1 border-gray-700 hover:bg-gray-800">
                <CiCirclePlus className="h-6 w-6" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="middle w-full px-10">
        <input
          type="text"
          placeholder="Search"
          className="w-full focus:outline-none focus:ring-0 focus:border-none rounded-sm bg-gray-900 px-3 py-3 placeholder-gray-400"
        />
      </div>

      {/* Bottom List */}
      <div className="bottom scrollbar-hide w-full px-8 flex flex-col gap-3 overflow-y-auto h-full">
        {Selected === "Friends" &&
          userDetail.friends?.length > 0 &&
          userDetail.friends.map((friend: any) => (
            <div key={friend.id}>{friend.username}</div>
          ))}

        {Selected === "Chats" &&
          userDetail.rooms?.length > 0 &&
          userDetail.rooms.map((chat: any) => (
            <div key={chat.id}>{chat.name}</div>
          ))}

        {Selected === "Archieve" &&
          userDetail.archived?.length > 0 &&
          userDetail.archived.map((arch: any) => (
            <div key={arch.id}>{arch.name}</div>
          ))}

        {Selected === "Favourites" &&
          userDetail.favourites?.length > 0 &&
          userDetail.favourites.map((fav: any) => (
            <div key={fav.id}>{fav.name}</div>
          ))}

        {Selected === "Blocked" &&
          userDetail.blocked?.length > 0 &&
          userDetail.blocked.map((block: any) => (
            <div key={block.id}>{block.username}</div>
          ))}
      </div>
    </motion.div>
  );
}

export default Friends;
