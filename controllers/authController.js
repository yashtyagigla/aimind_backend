import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// ---------------------- SIGNUP ----------------------
export const signup = async (req, res) => {
  console.log("🔥 Signup route hit!");

  try {
    const { fullName, email, phone, password } = req.body;

    // ---------------- VALIDATIONS ----------------

    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate Phone Number (Indian)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Validate Password Strength
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters including letters and numbers",
      });
    }

    // --------------------------------------------------

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------------------- LOGIN ----------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// ---------------------- CURRENT USER ----------------------
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Current user fetched successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// // ---------------------- FORGOT PASSWORD ----------------------
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     // Generate plain reset token
//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // Hash & save token
//     user.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

//     await user.save({ validateBeforeSave: false });

//     // Frontend URL
//     const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//     // Print for testing
//     console.log("🔑 RESET TOKEN:", resetToken);
//     console.log("🔗 RESET URL:", resetURL);

//     // Send Email
//     await sendEmail({
//       to: user.email,
//       subject: "Reset Your AIMind Password",
//       html: `
//         <h2>Password Reset Request</h2>
//         <p>Click the link below to reset your password</p>
//         <a href="${resetURL}">Reset Password</a>
//         <p>This link will expire in 10 minutes.</p>
//       `,
//     });

//     res.json({ message: "Password reset link sent to email" });

//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email not found" });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    user.resetPasswordToken = crypto.createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save({ validateBeforeSave: false });

    // URL sent to frontend page
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("🔑 RESET TOKEN:", resetToken);
    console.log("🔗 RESET URL:", resetURL);

    await sendEmail({
      to: user.email,
      subject: "Reset Your AIMind Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the button below:</p>
        <a href="${resetURL}" style="
          display:inline-block;
          padding:10px 20px;
          background:#4f46e5;
          color:white;
          border-radius:5px;
          text-decoration:none;">
          Reset Password
        </a>
        <p>This link expires in 10 minutes.</p>
      `
    });

    res.json({ message: "Password reset email sent successfully" });

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// // ---------------------- RESET PASSWORD ----------------------
// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password, confirmPassword } = req.body;

//     // Confirm password check
//     if (!password || !confirmPassword) {
//       return res.status(400).json({ message: "Both fields are required" });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // Hash incoming token
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     // Find user with valid token
//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpire: { $gt: Date.now() },
//     });

//     if (!user)
//       return res.status(400).json({ message: "Invalid or expired token" });

//     // Hash new password
//     user.password = await bcrypt.hash(password, 10);

//     // Clear reset token fields
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save();

//     res.json({ message: "Password reset successful" });

//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// ---------------------- RESET PASSWORD ----------------------
// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newPassword, confirmPassword } = req.body;

//     // 1️⃣ Check both fields exist
//     if (!newPassword || !confirmPassword) {
//       return res.status(400).json({ message: "Both fields required" });
//     }

//     // 2️⃣ Check both passwords match
//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // 3️⃣ Optional → password strength
//     const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
//     if (!passwordRegex.test(newPassword)) {
//       return res.status(400).json({
//         message: "Password must be at least 6 characters and contain letters & numbers"
//       });
//     }

//     // 4️⃣ Hash incoming token
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     // 5️⃣ Find user with token + not expired
//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpire: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     // 6️⃣ Save new password
//     user.password = await bcrypt.hash(newPassword, 10);

//     // 7️⃣ Clear reset details
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save();

//     res.json({
//       message: "Password reset successful"
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

export const resetPassword = async (req, res) => {
  console.log("🔥 RESET PASSWORD HIT");
  console.log("Token:", req.params.token);
  console.log("Body:", req.body);

  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // 1️⃣ Validate fields
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Both fields required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 2️⃣ Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("Hashed Token =", hashedToken);

    // 3️⃣ Match user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    console.log("Matched User ID:", user?._id || "NO USER");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 4️⃣ Save new password
    user.password = await bcrypt.hash(newPassword, 10);

    // 5️⃣ Clear reset data
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log("✅ PASSWORD RESET SUCCESS");

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("❌ RESET ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;  // token se mila
    const { fullName, email, phone } = req.body;

    // Allowed fields only
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    // Update in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};