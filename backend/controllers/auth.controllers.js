import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
export const signUp=async(req, res)=>{
    try{
     const{fullName, email, password, role, mobile}=req.body
     const user = await User.findOne({email})
     if(user){
        return res.status(400).json({message:"user already exit"})
     }

     if(password.length < 6){
        return res.status(400).json({message:"password must be atle3ast six characters"})
     }

     if(mobile.length < 10){
         return res.status(400).json({message:"Mobile Number must be atle3ast ten digits"})
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
        secure:flase,
        sameSite:strict,
        maxAge:7*24*60*1000,
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
        secure:flase,
        sameSite:strict,
        maxAge:7*24*60*1000,
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
    }catch (error){
       return res.status(500).json(`sign out error ${error}`)
    }
}