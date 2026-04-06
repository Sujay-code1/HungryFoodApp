import jwt from "jsonwebtoken";

const isAuth = async(req,res,next)=>{
    try {

        console.log("cookies received:", req.cookies)
        const token = req.cookies.token
        if(!token){
            return res.status(400).json({message:"token not found"})
        }
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        if(!decodeToken){
            return res.status(400).json({message:"token not verified"})
        }
        console.log("decoded token:", decodeToken)
        req.userid = decodeToken.id
        next()
    } catch (error) {
        return res.status(500).json({message:"isAuth error"})
    }
}

export default isAuth;