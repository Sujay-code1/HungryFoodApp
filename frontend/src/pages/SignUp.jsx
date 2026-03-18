import React from 'react'
import { useState } from 'react';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axios from 'axios'
import { serverUrl } from '../App';
import { toast } from "react-toastify";

function SignUp() {
  const primaryColor = "#ff4d2d"
  
  const bgColor = "#fff9f6"
  const borderColor = "#ddd"


  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [loading, setLoading] = useState(false);


  const handleSignUp = async (e) => {
    e.preventDefault();


    if (!fullName || !email || !password || !mobile) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobile,
          role
        },
        { withCredentials: true }

      );

      

      console.log("Signup Successful:", result.data);
      setFullName("");
      setEmail("");
      setPassword("");
      setMobile("");
      
      toast.success("Signup Successful 🎉");
    } catch (error) {

      console.error("Signup Error:", error.response?.data || error.message);
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

        {/* name */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700 ' htmlFor='fullName'>Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text" placeholder='Enter Your Full Name ' className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500' />
        </div>



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


        {/* mobile */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700 ' htmlFor='Mobile'>Mobile Number</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            type="tel" placeholder='Enter Your Mobile Number ' className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500' />
        </div>


        {/* role */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700 ' htmlFor='role'>Role</label>
          <div className='flex gap-2 '>
            {["user", "owner", "delivery Boy"].map((r) => (
              <button key={r} onClick={() => setRole(r)} className='flex-1 px-3 py-2 font-medium text-center transition-colors border rounded-lg'
                style={
                  role === r ? { backgroundColor: primaryColor, color: "white" } : { border: `1px solid ${primaryColor}`, color: "black" }
                } >{r}</button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignUp}
          
          disabled={loading}
          className="w-full py-2 font-semibold transition duration-200 rounded-lg"
          style={{
            backgroundColor: loading ? "#ccc" : primaryColor,
            color: "white",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <button

          className='flex items-center justify-center w-full gap-2 px-4 py-2 mt-4 transition duration-200 border rounded-lg-gray-200 hover:bg-gray-300'>
          <FcGoogle size={20} />
          <span>Sign up with Google</span>
        </button>

        <p className="mt-6 text-center text-gray-600">
          already have an account ?{" "}
          <Link to="/signin" className="font-semibold text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>


    </div>
  )
}

export default SignUp