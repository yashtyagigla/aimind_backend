// import nodemailer from "nodemailer";

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.BREVO_HOST,
//       port: process.env.BREVO_PORT,
//       secure: false,
//       auth: {
//         user: process.env.BREVO_USER,
//         pass: process.env.BREVO_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       html,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log("📧 Email sent:", info.messageId);
//     return info;

//   } catch (err) {
//     console.error("❌ EMAIL ERROR:", err);
//     throw new Error("Email could not be sent");
//   }
// };

import axios from "axios";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.EMAIL_FROM },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("📧 Email sent:", res.data.messageId || res.data);
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err.response?.data || err.message);
    throw new Error("Email could not be sent");
  }
};