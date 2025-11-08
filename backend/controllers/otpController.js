import Otp from "../models/Otp.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP to email
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({ email, otp: hashedOtp });
    await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}. It expires in 5 minutes.`);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP (for login or password reset)
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "OTP expired or not found" });

    const valid = await bcrypt.compare(otp, record.otp);
    if (!valid) return res.status(401).json({ message: "Invalid OTP" });

    await Otp.deleteMany({ email }); // clear old OTPs

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = generateToken(user._id);
    res.json({ message: "OTP verified successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot password (set new password after OTP)
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "OTP expired or not found" });

    const valid = await bcrypt.compare(otp, record.otp);
    if (!valid) return res.status(401).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await Otp.deleteMany({ email });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
