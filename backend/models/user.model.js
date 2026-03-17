import mongoose from "mongoose";

const userSchema = new mongoose.schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
       type:String,
        required:true,
        unique:true 
    },

    password:{
        type:String,
    },

    mobile:{
        type:string,
        required:true
    },

    role:{
        type:string,
        enum:["user", "owner", "deliveryBoy"],
        required:true
    }


},{timestamps:true})

const User=mongoose.model("User", userSchema)