import express from "express";
import { register, login ,getProfile,logout,updateProfile} from "../controller/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";
const authRouter=express.Router();

//Register User
authRouter.post('/register',register);
//Login User
authRouter.post('/login',login);
//Log Out USer
authRouter.post('/logout',logout);
//Get Profile User
authRouter.get('/getProfile',authMiddleware,getProfile);
//update Profile User
authRouter.patch("/updateProfile",authMiddleware,upload.single("image"),updateProfile);

export default authRouter;