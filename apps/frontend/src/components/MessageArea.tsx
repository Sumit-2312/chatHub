import { FaSmile, FaMicrophone, FaPaperclip } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

function MessageArea() {
  return (
    <div className="h-screen w-full bg-gray-100 text-black flex flex-col">

{/* -------------------------------------------------------Top Navbar----------------------------------------------------------------------- */}
      <div className="flex items-center justify-between px-4 h-14 bg-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <img
            src="https://via.placeholder.com/36"
            alt="profile"
            className="w-9 h-9 rounded-full"
          />
          <div>
            <div className="font-medium">Friend's Name</div>
            <div className="text-xs text-gray-600">online</div>
          </div>
        </div>

      </div>

{/* --------------------------------------------------------Chat Section--------------------------------------------------------------------- */}

      <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
        {/* Sample Chat Bubbles */}
        <div className="flex justify-start mb-2">
          <div className="bg-white p-2 rounded-lg shadow max-w-xs">
            Hello! How are you?
          </div>
        </div>
        <div className="flex justify-end mb-2">
          <div className="bg-green-200 p-2 rounded-lg shadow max-w-xs">
            I'm good, thanks! You?
          </div>
        </div>
      </div>

{/* --------------------------------------------------------Input Area----------------------------------------------------------------------- */}
      <div className="flex items-center px-5 py-2 bg-white border-t gap-5">
        <FaSmile className="text-xl text-gray-500 cursor-pointer" />


    {/* ------------------------------------------------File Upload Button---------------------------------------------------------- */}

        <label htmlFor="file-upload" className="cursor-pointer text-gray-500">
          <FaPaperclip className="text-xl" />
        </label>

        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="image/*, .pdf, .doc, .docx"
        />

    {/* ----------------------------------------------------------------------------------------------------------------------------- */}

        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        <IoSend className="text-xl text-blue-500 cursor-pointer" />

    {/* ----------------------------------------------------------------------------------------------------------------------------- */}

      </div>

      
    </div>
  );
}

export default MessageArea;
