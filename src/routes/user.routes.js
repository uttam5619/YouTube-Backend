import {Router} from 'express'
import { registerUser, login, logOut } from '../controllers/user.controller.js'
import { upload } from '../middleware/multer.middleware.js'
import verifyJWT from '../middleware/auth.middleware.js'

const userRouter = Router()

userRouter.route('/register')
.post(
    upload.fields([ {name:'avatar',maxCount:1}, {name:'coverImage',maxCount:1} ]),
    registerUser
)

userRouter.route('/login').post(login)
userRouter.route('/logout').post(verifyJWT, logOut)

export default userRouter
