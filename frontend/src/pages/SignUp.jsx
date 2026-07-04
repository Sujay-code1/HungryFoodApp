import React, { useState } from 'react';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';
import { serverUrl } from '../config';
import { toast } from "react-toastify";
import { auth } from "/firebase.js"; 
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { SiFoodpanda } from "react-icons/si";

function SignUp() {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch()
  const navigate = useNavigate()

  // ✅ Validation functions
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidMobile = (mobile) =>
    /^[0-9]{10}$/.test(mobile);

  const handleSignUp = async (e) => {
    e.preventDefault();

    // ✅ Validations
    if (!fullName || !email || !password || !mobile) {
      return toast.error("All fields are required ❌");
    }

    if (fullName.length < 3) {
      return toast.error("Full name must be at least 3 characters ❌");
    }

    if (!isValidEmail(email)) {
      return toast.error("Invalid email format ❌");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters ❌");
    }

    if (!isValidMobile(mobile)) {
      return toast.error("Mobile number must be 10 digits ❌");
    }

    try {
      setLoading(true);

      await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true }
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setMobile("");
      setRole("user");

      toast.success("Signup Successful 🎉");
      navigate('/signin');
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    // ✅ Mobile validation before Google auth
    if (!mobile) {
      return toast.error("Mobile number is required ❌");
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return toast.error("Mobile number must be 10 digits ❌");
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          mobile,
          role,
        },
        { withCredentials: true }
      );

      toast.success("Google Signup Successful 🎉");
      navigate('/signin');
    } catch (error) {
      toast.error(error.response?.data?.message || "Google signup failed ❌");
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
        <h1 className='flex items-center gap-2 text-xl font-bold text-white md:text-3xl' style={{ color: primaryColor }}>
          Hungry
          <SiFoodpanda size={30} className='md:text-3xl' />
        </h1>

        <p className='mb-8 text-gray-600'>
          Create Your account to get food deliveries
        </p>

        {/* Name */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700'>
            Full Name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            placeholder='Enter Your Full Name'
            className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
          />
        </div>

        {/* Email */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700'>
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder='Enter Your Email'
            className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
          />
        </div>

        {/* Password */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700'>
            Password
          </label>
          <div className='relative'>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder='Enter Your Password'
              className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-500 -translate-y-1/2 cursor-pointer right-3 top-1/2"
            >
              {showPassword ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700'>
            Mobile Number
          </label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            type="tel"
            placeholder='Enter Your Mobile Number'
            className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
          />
        </div>

        {/* Role */}
        <div className='mb-4'>
          <label className='block mb-1 font-medium text-gray-700'>
            Role
          </label>
          <div className='flex gap-2'>
            {[
              { label: 'User', value: 'user' },
              { label: 'Owner', value: 'owner' },
              { label: 'Delivery Boy', value: 'deliveryBoy' },
            ].map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => setRole(option.value)}
                className='flex-1 px-3 py-2 font-medium text-center border rounded-lg'
                style={
                  role === option.value
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { border: `1px solid ${primaryColor}` }
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sign Up */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-2 font-semibold rounded-lg"
          style={{
            backgroundColor: loading ? "#ccc" : primaryColor,
            color: "white"
          }}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Google */}
        <button
          onClick={handleGoogleAuth}
          className='flex items-center justify-center w-full gap-2 px-4 py-2 mt-4 border rounded-lg hover:bg-gray-100'
        >
          <FcGoogle size={20} />
          <span>Sign up with Google</span>
        </button>

        {/* Link */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;

