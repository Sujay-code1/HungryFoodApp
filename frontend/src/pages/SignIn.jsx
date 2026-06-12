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

function SignIn() {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  // 🔹 Email/Password Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required ❌");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );

      const token = result.data?.token
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('token', token)
      }

      dispatch(setUserData(result.data.user || result.data))

      setEmail("");
      setPassword("");

      toast.success("Signin Successful 🎉");

      // Optional: redirect after login
      // navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google Sign In
  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName || result.user.email.split("@")[0],
          email: result.user.email,
          mobile: "",
          role: "user",
        },
        { withCredentials: true }
      );

      const token = data?.token
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('token', token)
      }

      dispatch(setUserData(data.user || data))

      toast.success("Google Sign-in Successful 🎉");

      // Optional: redirect
      // navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Google sign-in failed ❌");
    }
  };

  return (
    <div
      className="flex items-center justify-center w-full min-h-screen p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1
          className='flex items-center gap-2 text-xl font-bold text-white md:text-3xl'
          style={{ color: primaryColor }}
        >
          Hungry
          <SiFoodpanda size={30} className='md:text-3xl' />
        </h1>

        <p className="mb-8 text-gray-600">
          Create Your account to get food deliveries
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter Your Email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Password
          </label>

          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-500 -translate-y-1/2 cursor-pointer right-3 top-1/2 hover:text-gray-700"
            >
              {showPassword ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div
          onClick={() => navigate("/forgot-password")}
          className="mb-4 text-right text-[#ff4d2d] font-medium cursor-pointer"
        >
          Forgot Password?
        </div>

        {/* Sign In Button */}
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

        {/* Google Sign In */}
        <button
          onClick={handleGoogleAuth}
          className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-4 transition duration-200 border rounded-lg hover:bg-gray-100"
        >
          <FcGoogle size={20} />
          <span>Sign In with Google</span>
        </button>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;