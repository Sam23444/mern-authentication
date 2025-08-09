import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

// ✅ REGISTER USER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing credentials." });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      verifyOtp: '',
      verifyOtpExpireAt: 0,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to my Website',
      text: `Welcome to my website. Your account has been created with email id: ${email}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ LOGIN USER
export const Login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid password." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Login successful.", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ LOGOUT USER
export const Logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const sendVerifyOtp = async (req, res) => {
  try {
    // ✅ Get userId from middleware instead of body
    const userId = req.userId; // ✅ use the value from middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: "User ID not found. Please log in again." });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified." });
    }

    // ✅ Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // valid for 24h
    await user.save();

    console.log(`📧 OTP generated for ${user.email}: ${otp}`);

    // ✅ Send OTP email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your OTP is ${otp}. It is valid for 24 hours.`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Verification OTP sent to email.' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const verifyEmail = async (req, res) => {
  const { otp } = req.body; // ✅ Only expect OTP from the request body
  const userId = req.userId; // ✅ Extract user ID from middleware

  if (!otp) {
    return res.status(400).json({ success: false, message: "OTP is required." });
  }

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // ✅ If already verified
    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified." });
    }

    // ✅ OTP expiration check
    if (!user.verifyOtp || user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    // ✅ Validate OTP
    if (String(user.verifyOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // ✅ Mark user as verified
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};




export const isAuthenticated = async (req, res) => {
  try {
    // ✅ Safely extract token from header, cookie, or body
    let token = null;

    // 1. Check Authorization Header
    if (req.headers['authorization']?.startsWith("Bearer ")) {
      token = req.headers['authorization'].split(" ")[1];
    }

    // 2. Check Cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. Check Body (only if it exists and contains a token)
    if (!token && req.body && typeof req.body === 'object' && req.body.token) {
      token = req.body.token;
    }

    // ✅ No token found
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided." });
    }

    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach userId to request for downstream usage
    req.userId = decoded.id;

    // ✅ Respond with success
    return res.json({
      success: true,
      message: "User is authenticated.",
      userId: req.userId,
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed: " + error.message,
    });
  }
};



export const SendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    // ✅ Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 16 * 60 * 1000; // 16 minutes

    await user.save();

    

    // ✅ Send OTP Email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed.`
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP, and new password are required."
    });
  }

  try {
    const user = await UserModel.findOne({ email });

    // ✅ Check if user exists
    if (!user) {
      return res.json({
        success: false,
        message: "User not found."
      });
    }

    // ✅ Check OTP
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP."
      });
    }

    // ✅ Check if OTP expired
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired. Please request a new one."
      });
    }

    // ✅ Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully."
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    });
  }
};



export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Missing email or OTP" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};
