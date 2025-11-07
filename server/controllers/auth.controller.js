import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import axios from "axios";

import jwt from "jsonwebtoken";
import { oAuth2Client } from "../config/google.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const createCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
export const signUp = async (req, res) => {
  try {
    const { email, password, userName } = req.body;
    if (!email || !password || !userName) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    const isUserExits = await User.findOne({ email });
    if (isUserExits) {
      return res
        .status(400)
        .json({ message: "User already exits", success: false });
    }
    const hashedPassWord = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashedPassWord,
    });

    const token = generateToken(user);
    createCookie(res, token);
    return res.status(200).json(
      {
        message: "User created successfully",
        success: true,
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          avatar: user.avatar,
        },
        token,
      },
      200
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const isUserExitsOrNot = await User.findOne({ email });
    if (!isUserExitsOrNot) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      isUserExitsOrNot.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Incorrect password",
        success: false,
      });
    }
    const token = generateToken(isUserExitsOrNot);
    createCookie(res, token);
    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      user: {
        _id: isUserExitsOrNot._id,
        userName: isUserExitsOrNot.userName,
        email: isUserExitsOrNot.email,
        avatar: isUserExitsOrNot.avatar,
      },
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

export const oAuthLogin = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Code is required",
        success: false,
      });
    }
    const googleToken = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(googleToken.tokens);

    const userDetails = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleToken.tokens.access_token}`,
        },
      }
    );

    const { email, name, picture } = userDetails.data;

    let isUserExits = await User.findOne({ email });

    if (isUserExits) {
      const token = generateToken(isUserExits);
      createCookie(res, token);
      return res.status(200).json({
        message: "User logged in successfully",
        success: true,
        user: {
          _id: isUserExits._id,
          userName: isUserExits.userName,
          email: isUserExits.email,
          avatar: isUserExits.avatar,
        },
        token,
      });
    }

    const user = await User.create({
      userName: name,
      email,
      avatar: picture,
    });

    const token = generateToken(user);
    createCookie(res, token);
    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
