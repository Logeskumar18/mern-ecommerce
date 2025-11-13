import express from "express";
import sendEmail from "../utils/sendEmail.js";  // ✅ No curly braces
import { sendWhatsApp } from "../utils/sendWhatsApp.js"; // this one can stay named if exported that way

const router = express.Router();

router.post("/email", async (req, res) => {
  const { to, subject, message } = req.body;
  await sendEmail(to, subject, message);
  res.json({ success: true, msg: "Email sent successfully" });
});

router.post("/whatsapp", async (req, res) => {
  const { phone, message } = req.body;
  await sendWhatsApp(phone, message);
  res.json({ success: true, msg: "WhatsApp message sent successfully" });
});

export default router;
