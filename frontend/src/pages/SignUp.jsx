import React from 'react'
import {useState} from 'react';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

function SignUp() {
  const primaryColor = "#ff4d2d"
  const hoverColor = "#e64323"
  const bgColor = "#fff9f6"
  const borderColor = "#ddd"

  const[showPassword, setShowPassword] = useState(false);
  

  return (
    <div
      className='min-h-screen flex items-center justify-center p-4 w-full'
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: primaryColor }}
        >
          Hungry.
        </h1>
        <p className='text-gray-600 mb-8'>Create Your account to get food deliveries</p>
       
       {/* name */}
        <div className='mb-4'>
            <label className=' block text-gray-700 font-medium mb-1' htmlFor='fullName'>Full Name</label>
            <input type="text" placeholder='Enter Your Full Name ' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' />
        </div>

       

        {/* email */}
          <div className='mb-4'>
            <label className=' block text-gray-700 font-medium mb-1' htmlFor='Email'>Email</label>
            <input type="email" placeholder='Enter Your Email ' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' />
        </div>

        {/* password */}
        
         <div className='mb-4'>
            <label className=' block text-gray-700 font-medium mb-1' htmlFor='Password'>Password</label>
            <div className='relative'>
            <input type={showPassword ? "text" : "password"} placeholder='Enter Your Password ' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' />
             <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
          type="button"
          onClick={()=>setShowPassword(!showPassword)}
          >
            {showPassword ?  <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
          </button>
            </div>
        </div>


         {/* mobile */}
         <div className='mb-4'>
            <label className=' block text-gray-700 font-medium mb-1' htmlFor='Mobile'>Mobile Number</label>
            <input type="number" placeholder='Enter Your Mobile Number ' className='w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500' />
        </div>
      </div>

      
    </div>
  )
}

export default SignUp