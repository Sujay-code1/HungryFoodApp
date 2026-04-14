/* eslint-disable no-empty */
import React, { useState } from 'react'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { serverUrl } from '../config';
import { toast } from "react-toastify";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  // 🔹 Send OTP
  const handleSendOtp = async () => {
    if (!email) {
      return toast.error("Please enter email");
    }

    try {
      setLoading(true);

      await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );

      toast.success("OTP sent successfully");
      setStep(2);

    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      return toast.error("Enter OTP");
    }

    try {
      setLoading(true);

       await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      toast.success("OTP verified");
      setStep(3);
       
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return toast.error("Fill all fields");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

       await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );

      toast.success("Password reset successful");

      setTimeout(() => {
        navigate("/signin");
      }, 1500);

    } catch (error) {
      toast.error(error?.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='w-full flex items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
      <div className='w-full max-w-md p-8 bg-white shadow-lg rounded-xl'>

        <div className='flex items-center gap-4 mb-6'>
          <IoMdArrowBack onClick={() => navigate("/signin")} size={30} className='text-[#ff4d2d] cursor-pointer ' />
          <h1 className='text-2xl font-bold text-[#ff4d2d]'>Forgot Password?</h1>
        </div>

        {/* STEP 1 - EMAIL */}
        {step === 1 && (
          <div>
            <div className='mb-6'>
              <label className='block mb-1 font-medium text-gray-700'>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder='Enter Your Email'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2 font-semibold rounded-lg bg-[#ff4d2d] text-white disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* STEP 2 - OTP */}
        {step === 2 && (
          <div>
            <div className='mb-6'>
              <label className='block mb-1 text-xl font-medium text-gray-700'>OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                placeholder='Enter Your OTP'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-2 font-semibold rounded-lg bg-[#ff4d2d] text-white disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {/* STEP 3 - RESET PASSWORD */}
        {step === 3 && (
          <div>
            <div className='mb-6'>
              <label className='block mb-1 text-xl font-medium text-gray-700'>New Password</label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder='Enter New Password'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
              />
            </div>

            <div className='mb-6'>
              <label className='block mb-1 text-xl font-medium text-gray-700'>Confirm Password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder='Confirm Password'
                className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-500'
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-2 font-semibold rounded-lg bg-[#ff4d2d] text-white disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ForgotPassword;