import express from "express";
import bcrypt from "bcrypt";
import User from "../models/Users.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name ||
      !email ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Name, email, and password of at least 8 characters are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered!",
      });
    }

    const hashed_password = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashed_password,
    });

    res.status(201).json({
      message: "User signed up successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered!",
      });
    }

    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

userRoutes.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "6h" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default userRoutes;
