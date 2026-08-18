import jwt from "jsonwebtoken";

const isAuth = async(req,res,next)=>{
    try {

        console.log("cookies received:", req.cookies)
        let token = req.cookies.token
        // allow Authorization: Bearer <token> as fallback for SPA clients
        if(!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
            token = req.headers.authorization.split(' ')[1]
        }
        if(!token){
            return res.status(400).json({message:"token not found"})
        }
        const secret = process.env.JWT_SECRET || 'dev_secret'
        if (!process.env.JWT_SECRET) console.warn('WARNING: JWT_SECRET not set — using dev fallback for verification')
        const decodeToken = jwt.verify(token, secret)
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