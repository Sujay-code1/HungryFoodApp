import React from 'react'
import { useState } from 'react';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axios from 'axios'
import { serverUrl } from '../App';
import { toast } from "react-toastify";

function SignIn() {
  const primaryColor = "#ff4d2d"
  
  const bgColor = "#fff9f6"
  const borderColor = "#ddd"

 const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  

 
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false);


  const handleSignIn = async (e) => {
    e.preventDefault();


    if ( !email || !password ) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
         
          email,
          password,
         
        },
        { withCredentials: true }

      );

      

      console.log("Sigin Successful:", result.data);
      
      setEmail("");
      setPassword("");
     
      
      toast.success("Signin Successful 🎉");
    } catch (error) {

      console.error("Sigin Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='flex items-center justify-center w-full min-h-screen p-4'
      style={{ backgroundColor: bgColor }}
    >
      <div
        
        className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1
          className="mb-2 text-3xl font-bold"
          style={{ color: primaryColor }}
        >
          Hungry.
        </h1>
        <p className='mb-8 text-gray-600'>Create Your account to get food deliveries</p>

       



        {/* email */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700 ' htmlFor='Email'>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email" placeholder='Enter Your Email ' className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500' />
        </div>

        {/* password */}

        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700 ' htmlFor='Password'>Password</label>
          <div className='relative'>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"} placeholder='Enter Your Password ' className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500' />
            <button className="absolute text-gray-500 -translate-y-1/2 cursor-pointer right-3 top-1/2 hover:text-gray-700"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
            </button>
          </div>
        </div>

        {/* forgot password */}
        <div
        onClick={()=>navigate("/forgot-password")}
         className='mb-4 text-right text-[#ff4d2d] font-medium cursor-pointer'>
          Forgot Password?
        </div>


       


       
        <button
          onClick={handleSignIn}
          
          disabled={loading}
          className="w-full py-2 font-semibold transition duration-200 rounded-lg"
          style={{
            backgroundColor: loading ? "#ccc" : primaryColor,
            color: "white",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <button

          className='flex items-center justify-center w-full gap-2 px-4 py-2 mt-4 transition duration-200 border rounded-lg-gray-200 hover:bg-gray-300'>
          <FcGoogle size={20} />
          <span>Sign In with Google</span>
        </button>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account ?{" "}
          <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>


    </div>
  )
}

export default SignIn
