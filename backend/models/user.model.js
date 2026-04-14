import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required:true,
    },
    email:{
       type:String,
        required:true,
        unique:true 
    },

    password:{
        type:String,
         required:false,
    },

    mobile:{
        type:String,
        required:false
    },

    role:{
        type:String,
        enum:["user", "owner", "deliveryBoy"],
        required:true
    },

    resetOtp:{
        type:String,

    },

    isOtpVerified:{
        type:Boolean,
        default:false,

    },

    otpExpires:{
        type:Date
    }


},{timestamps:true})

export  const User=mongoose.model("User", userSchema)