
import bcrypt from 'bcryptjs'
import User from "../models/user.model.js"
import { genToken } from "../utils/token.js";
import { sentOtpMail } from '../utils/mail.js';


export const signUp = async (req, res) => {
   try {
      const { fullName, email, password, role, mobile } = req.body
      const allowedRoles = ["user", "owner", "deliveryBoy"]
      const userRole = allowedRoles.includes(role) ? role : "user"

      if (!fullName || !email || !password || !mobile) {
         return res.status(400).json({ message: "Invalid data", success: false });
      }




      let user = await User.findOne({ email })
      if (user) {
         return res.status(400).json({ message: "user already exit" })
      }

      if (password.length < 6) {
         return res.status(400).json({ message: "password must be atle3ast six characters" })
      }

      if (typeof mobile !== "string" || mobile.trim().length < 10) {
         return res.status(400).json({ message: "Mobile Number must be atleast ten digits" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      user = await User.create({
         fullName,
         email,
         role: userRole,
         mobile,
         password: hashedPassword
      })

      const token = await genToken(user._id)
      res.cookie("token", token, {
         secure: false,
         sameSite: "lax",
         maxAge: 7 * 24 * 60 * 60 * 1000,
         httpOnly: true
      })

      return res.status(201).json({ user, token })
   } catch (error) {
      return res.status(500).json(`sign up error ${error}`)
   }
}


export const signIn = async (req, res) => {
   try {
      const { email, password } = req.body

      if (!email || !password) {
         return res.status(400).json({ message: "Invalid data", success: false });
      }


      const user = await User.findOne({ email })
      if (!user) {
         return res.status(400).json({ message: "user does not exit" })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
         return res.status(400).json({ message: "incorrect password" })
      }

      const token = await genToken(user._id)
      res.cookie("token", token, {
         secure: false,
         sameSite: "lax",
         maxAge: 7 * 24 * 60 * 60 * 1000,
         httpOnly: true
      })

      return res.status(200).json({ user, token })
   } catch (error) {
      return res.status(500).json(`sign in error ${error}`)
   }
}

export const signOut = async (req, res) => {
   try {
      res.clearCookie("token")
      return res.status(200).json({ message: "Signed out successfully" })

   } catch (error) {
      return res.status(500).json(`sign out error ${error}`)
   }
}


export const sendOtp = async (req, res) => {
   try {
      const { email } = req.body
      const user = await User.findOne({ email })
      if (!user) {
         return res.status(400).json({ message: "user does not exit" })
      }
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      user.resetOtp = otp
      user.otpExpires = Date.now() + 5 * 60 * 1000
      user.isOtpVerified = false
      await user.save()
      await sentOtpMail(email, otp)
      return res.status(200).json({ message: "otp sent sucessfully" })
   } catch (error) {
      console.log("SEND OTP ERROR:", error)
      return res.status(500).json({ message: error.message });
   }
}

export const verifyOtp = async (req, res) => {
   try {
      const { email, otp } = req.body
      const user = await User.findOne({ email })
      if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
         return res.status(400).json({ message: "invalid/expired otp" })
      }
      user.isOtpVerified = true
      user.resetOtp = undefined
      user.otpExpires = undefined
      await user.save();
      return res.status(200).json({ message: "otp varify successfully" })
   } catch (error) {
      return res.status(500).json(`otp error ${error}`)
   }
}

export const resetPassword = async (req, res) => {

   try {
      const { email, newPassword } = req.body;

      const user = await User.findOne({ email });

      if (!user || !user.isOtpVerified) {
         return res.status(400).json({ message: "Unauthorized" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.isOtpVerified = false;

      await user.save();

      res.status(200).json({ message: "Password reset successful" });

   } catch (error) {
      return res.status(500).json(`reset password error ${error}`)
   }
}

export const googleAuth = async (req, res) => {
    try {
      const { fullName, email, mobile, role } = req.body
      const allowedRoles = ["user", "owner", "deliveryBoy"]
      const userRole = allowedRoles.includes(role) ? role : "user"
      let user = await User.findOne({ email })
      if (!user) {
        user = await User.create({
         fullName: fullName || email.split("@")[0],
         email,
         mobile: mobile || "",
         role: userRole,
        })
      }

       const token = await genToken(user._id)
      res.cookie("token", token, {
         secure: false,
         sameSite: "lax",
         maxAge: 7 * 24 * 60 * 60 * 1000,
         httpOnly: true
      })

     return res.status(200).json({ user, token })
  



    } catch (error) {
      return res.status(500).json(`googleAuth error ${error}`)
    }
}

