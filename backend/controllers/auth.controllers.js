
import bcrypt from 'bcryptjs'
import {User} from "../models/user.model.js"
import {genToken} from "../utils/token.js"; 


export const signUp=async(req, res)=>{
    try{
     const{fullName, email, password, role, mobile}=req.body
     
     if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Invalid data", success: false });
    }

    


     let user = await User.findOne({email})
     if(user){
        return res.status(400).json({message:"user already exit"})
     }

     if(password.length < 6){
        return res.status(400).json({message:"password must be atle3ast six characters"})
     }

     if(mobile.length < 10){
         return res.status(400).json({message:"Mobile Number must be atleast ten digits"})
     }

     const hashedPassword = await bcrypt.hash(password,10)
     user = await User.create({
        fullName,
        email,
        role,
        mobile,
        password:hashedPassword
     })

     const token = await genToken(user._id)
     res.cookie("token", token,{
        secure:false,
        sameSite:"lax",
        maxAge:7*24*60*60*1000,
        httpOnly:true
     })

     return res.status(201).json(user)
    }catch(error){
         return res.status(500).json(`sign up error ${error}`)
    }
}


export const signIn=async(req, res)=>{
    try{
     const{ email, password, }=req.body

     if (!email || !password) {
      return res.status(400).json({ message: "Invalid data", success: false });
    }


     const user = await User.findOne({email})
     if(!user){
        return res.status(400).json({message:"user does not exit"})
     }

    const isMatch = await bcrypt.compare(password, user.password)
     
    if(!isMatch){
        return res.status(400).json({message:"incorrect password"}) 
    }
    
     const token = await genToken(user._id)
     res.cookie("token", token,{
        secure:false,
        sameSite:"lax",
        maxAge:7*24*60*60*1000,
        httpOnly:true
     })

     return res.status(200).json(user)
    }catch(error){
         return res.status(500).json(`sign up error ${error}`)
    }
}

export const signOut = async(req, res)=>{
    try{
    res.clearCookie("token")
    return res.status(200).json({ message: "Signed out successfully" })

    }catch (error){
       return res.status(500).json(`sign out error ${error}`)
    }
}