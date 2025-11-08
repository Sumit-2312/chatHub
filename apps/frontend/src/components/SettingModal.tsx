import React, { useEffect, useState } from 'react';
import { FaUserEdit, FaLock, FaEye, FaEyeSlash, FaSave, FaTimes } from 'react-icons/fa';
import { useRecoilState } from 'recoil';
import SettingModalState from '../recoil states/modals/SettingModal';
import { useDetalis } from '../recoil states/user details/user';
import axios from 'axios';
import toast from 'react-hot-toast';

function SettingModal() {
  const [userDetails,setUserDetails] = useRecoilState(useDetalis);
  const [username, setUsername] = useState(userDetails.username || '');
  const [description, setDescription] = useState(userDetails.discription || '');
  const [email,setEmail] = useState(userDetails.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [OpenSettingModal, setOpenSettingModal] = useRecoilState(SettingModalState);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSave = async() => {
    try{
        const response = await axios.post('http://localhost:5000/user/updateProfile',{
            username,
            description,
            oldPassword,
            email,
            newPassword,
            confirmPassword,
            profilePicture
        },{
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        toast.success(response.data.message || "Profile updated successfully");
        setOpenSettingModal(false);
        setUserDetails(prev => ({
            ...prev,
            username,
            discription: description,
            profilePicture: profilePicture ? URL.createObjectURL(profilePicture) : prev.profilePicture
        }));
    }catch(err:any){
        toast.error(err.response.data.message || "An error occurred while updating profile");
        setOpenSettingModal(false);
    }
  };




  return (
      <div className='z-50 absolute h-screen w-screen bg-black bg-opacity-50 flex items-center justify-center'>
          <div className="max-w-md w-1/4 p-5 mx-auto bg-white shadow-xl rounded-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaUserEdit className="text-blue-600" /> Edit Profile
                </h2>

                {/* Username */}
                <div className="mb-4 relative">
                    <label className="block text-sm font-medium">Username</label>
                    <input
                    type="text"
                    className="w-full border px-3 py-2 rounded mt-1"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    />
                    <FaUserEdit className="absolute right-3 top-9 text-gray-500" />
                </div>

                {/* Email */}
                <div className="mb-4 relative">
                    <label className="block text-sm font-medium">Email</label>
                    <input
                    type="text"
                    className="w-full border px-3 py-2 rounded mt-1"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    />
                    <FaUserEdit className="absolute right-3 top-9 text-gray-500" />
                </div>

                {/* Description */}
                <div className="mb-4 relative">
                    <label className="block text-sm font-medium">Description</label>
                    <input
                    type="text"
                    className="w-full border px-3 py-2 rounded mt-1"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    />
                    <FaUserEdit className="absolute right-3 top-9 text-gray-500" />
                </div>

                {/* Profile Picture */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Profile Picture</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                {/*  Password */}
                <div className="mb-4 relative flex flex-col">
                    <label className="block text-sm font-medium">Old Password</label>

                    <div className='flex items-center border border-gray-300 rounded-md py-2 gap-3 px-3'>
                            <FaLock className=" text-gray-500" />
                            <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full rounded mt-1 outline-none focus:outline-none "
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            />
                            {showPassword ? (
                            <FaEyeSlash className="absolute right-3 top-9 cursor-pointer" onClick={togglePasswordVisibility} />
                            ) : (
                            <FaEye className="absolute right-3 top-9 cursor-pointer" onClick={togglePasswordVisibility} />
                            )}
                    </div>
                </div>


                <div className="mb-4 relative flex flex-col">
                    <label className="block text-sm font-medium">New Password</label>

                    <div className='flex items-center border border-gray-300 rounded-md py-2 gap-3 px-3'>
                            <FaLock className=" text-gray-500" />
                            <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full rounded mt-1 outline-none focus:outline-none "
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            />
                            {showPassword ? (
                            <FaEyeSlash className="absolute right-3 top-9 cursor-pointer" onClick={togglePasswordVisibility} />
                            ) : (
                            <FaEye className="absolute right-3 top-9 cursor-pointer" onClick={togglePasswordVisibility} />
                            )}
                    </div>
                </div>


                <div className="mb-4 relative flex flex-col">
                    <label className="block text-sm font-medium">Confirm Password</label>

                    <div className='flex items-center border border-gray-300 rounded-md py-2 gap-3 px-3'>
                            <FaLock className=" text-gray-500" />
                            <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full rounded mt-1 outline-none focus:outline-none "
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            />
                            {showPassword ? (
                            <FaEyeSlash className="absolute right-3 top-9 cursor-pointer" onClick={togglePasswordVisibility} />
                            ) : (
                            <FaEye className="absolute right-3 top-9 cursor-pointer" onClick={togglePasswordVisibility} />
                            )}
                    </div>
                </div>

                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={()=>{
                        setOpenSettingModal(false);
                    }}
                    >
                    <FaTimes /> Cancel
                    </button>
                    <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleSave}
                    >
                    <FaSave /> Save
                    </button>
                </div>
            </div>
      </div>
  );
}

export default SettingModal;
