import dotenv from "dotenv"
dotenv.config() 
import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true, // Use true for port 465, false for port 587
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
    
});

export const sentOtpMail = async (to, otp) => {
    try {
    await transporter.sendMail({
      from: process.env.MAIL,
      to,
      subject: "Reset Your Password",
      html: `<p>Your OTP is <b>${otp}</b></p>`
    });

    console.log("Email sent successfully");

  } catch (error) {
    console.log("MAIL ERROR:", error);
    throw error; // VERY IMPORTANT
  }
}