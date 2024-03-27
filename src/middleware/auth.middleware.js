import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

export const verifyJWT =async (err, req, res, next)=>{

    try{
    const token= req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer','')
    if(!token){
        return res.status(401).json({success: false, message:`Unauthorized request`})
    }

    const verifiedToken= await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user= await User.findById(verifiedToken._id).select('-password -refreshToken')
    if(!user){
        return res.status(401).json({success: false, message:`Invalid access token`})
    }
    req.user = user
    next()
    }catch(err){
        res.status(500).json({success:false, message:err.meaasge})
    }
}

export default verifyJWT