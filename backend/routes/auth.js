const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Detailed validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Name is required and cannot be empty",
      });
    }

    if (!email || email.trim().length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Email is required and cannot be empty",
      });
    }

    if (!password || password.length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Password is required and cannot be empty",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        message: "Please enter a valid email address",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password too weak",
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
        message: "A user with this email already exists",
      });
    }

    // Create user (password will be hashed automatically by the User model)
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user.userId);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error during registration",
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Detailed validation
    if (!email || email.trim().length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Email is required and cannot be empty",
      });
    }

    if (!password || password.length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Password is required and cannot be empty",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        message: "Please enter a valid email address",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate token
    const token = generateToken(user.userId);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error during login",
    });
  }
});

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { userId: req.user.userId },
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        userId: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      error: "Internal server error during profile update",
    });
  }
});

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Current password and new password are required",
      });
    }

    // Get user with password
    const user = await User.findOne({ userId: req.user.userId }).select(
      "+password"
    );

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: "Invalid current password",
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      error: "Internal server error during password change",
    });
  }
});

module.exports = router;
