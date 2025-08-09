import express from "express";
import { register, Login, Logout, sendVerifyOtp, verifyEmail, isAuthenticated, SendResetOtp, resetPassword, verifyResetOtp } from "../controller/authController.js";
import userAuth from "../middleware/userAuth.js";


const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", Login);
authRouter.post("/logout", Logout);
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp)
authRouter.post('/verify-account', userAuth,verifyEmail)
authRouter.get('/is-auth',userAuth,isAuthenticated)
authRouter.post('/send-reset-otp',SendResetOtp)
authRouter.post('/reset-password',resetPassword)
authRouter.post('/verify-reset-otp',verifyResetOtp)




export default authRouter ;
