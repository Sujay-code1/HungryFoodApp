import User from "../models/user.model.js"

export  const getCurrentUser = async(req, res)=>{
    try {
         console.log("req.userid:", req.userid)        
        console.log("req.userId:", req.userId)      
        console.log("cookies:", req.cookies)        

        const userId = req.userid
        if(!userId){
            return res.status(400).json({message:"user is not found"})
        }

        const user=await User.findById(userId).select('-password')
        if(!user){
            return res.status(400).json({message:"userId is not found"})
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`get current user error ${error}`})
    }
}

export const updateUserLocation = async(req, res)=>{
    try{
       const {lat, lon} = req.body
       const user = await User.findByIdAndUpdate(req.userid, {
        location:{
            type:'point',
            coordinates:[lon, lat]
        }
       });
       if(!user){
        return res.status(400).json({message:"user is not found"})
       }
    } catch (error){
       return res.status(500).json({message:`update user location error ${error}`})
    }
}
