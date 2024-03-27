import {validate} from 'email-validator'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const registerUser =async (req, res)=>{
    //get userdetails from frontend
    //validation -not empty
    //check if user is already registered
    // validate files
    //upload them to clodinary
    //create user object- create entry in db
    //remove password and refresh token from response
    //if user is created successfully then return the response


    const {username, email, password} = req.body

    try{
        if(!username || !email || !password){
            return res.status(400).json({sucess: false, message: `Invalid credentials`})
        }
        if([username, email, password].some(e=>e?.trim()==='')){
            return res.status(400).json({sucess: false, message:`All fields are mandatory`})
        }
        if(!validate(email)){
            return res.status(400).json({sucess: false, message:`Provide a valid email`})
        }

        const isUserExist = await User.findOne({email})
        if(isUserExist){
            return res.status(409).json({success:false, meaasge: `user already exist`})
        }

        const avatarLocalPath = req?.files?.avatar[0]?.path
        const coverImageLocalPath = req?.files?.coverImage[0]?.path

        if(!avatarLocalPath ){
            res.status(404).json({success:false, message:`Avatar is required`})
        }

        const avatar= await uploadOnCloudinary(avatarLocalPath)
        const coverImage= await uploadOnCloudinary(coverImageLocalPath)
        if(!avatar){
            res.status(404).json({success:false, message:`avatar file is required`})
        }
        if(!coverImage){
            res.status(404).json({success:false, message:`coverImage file is required`})
        }
        const user= await User.create({
            username,
            email,
            password,
            avatar:avatar.url,
            coverImage: coverImage?.url || ''
        })
        //console.log(`user created`)
        const createdUser= await User.findById(user._id).select("-password -refreshToken")
        //console.log(createdUser)
        if(!createdUser){
            res.status(404).json({success:false, message:`Something went wrong`})
        }
        return res.status(201).json({sucess: true, data:createdUser})

    }catch(err){
        res.status(500).json({sucess: false, message: err.message});
    }
    
}

const login = async ( req, res) =>{
    // destructure data from req.body
    // username or email
    //find the user
    //check the password
    //generate the accesss and refresh token
    //send cookie
    try{
        const {username, email} = req.body
        if(!username || !email){
            return res.status(400).json({success:false, message:`Invalid credentials`})
        }
        if(!validate({email})){
            return res.status(400).json({success:false, message:`please provide a valid email`})
        }

        const user= await User.findOne({email})
        if(!user){
            return res.status(404).json({success:false, message:`user not found, please register`})
        }
        const isPasswordVerified= await user.isPassswordCorrect(password)
        if(!isPasswordVerified){
            return res.status(401).json({success:false, message:`check password again`})
        }

        const accessToken= await user.generateAccessToken()
        const refreshToken= await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        const loggedInUser= await User.findOne(user._id).select('-password -refreshToken')
        return res.status(200)
                .cookie('accessToken', accessToken, cookieOptions)
                .cookie('refreshToken',refreshToken, cookieOptions)
                .json({sucess:true, message:`loggedIn successfully`, data:loggedInUser})

    }catch(err){
        return res.status(500).json({success:false, message:err.message})
    }
}

const logOut = async (req, res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    )

    return res.status(200)
            .clearCookie('accessToken', cookieOptions)
            .clearCookie('refreshToken', cookieOptions)
            .json({success:true, message:`logOut sucessfully`})

}


export {registerUser, login, logOut}