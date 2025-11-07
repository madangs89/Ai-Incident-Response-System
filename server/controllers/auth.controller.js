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
    let isPasswordCorrect;
    if (isUserExitsOrNot.password) {
      isPasswordCorrect = await bcrypt.compare(
        password,
        isUserExitsOrNot?.password
      );
    }
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
    console.log(error);
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
      "https://www.googleapis.com/oauth2/v3/userinfo",
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

export const isAuthenticated = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User is authenticated",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({
      message: "User logged out successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const gitLogin = async (req, res) => {
  const { code } = req.body;
  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GIT_CLIENT_ID,
        client_secret: process.env.GIT_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    let accessToken = tokenRes.data.access_token;
    if (!accessToken)
      return res.status(400).json({ message: "Invalid code", success: false });

    // Step 5: Get user info
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(userRes.data);

    const { avatar_url, name, email , login } = userRes.data;

    let finalEmail = email;

    // Step 3: If email is not returned, fetch from /user/emails
    if (!finalEmail) {
      const emailRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const primaryEmail = emailRes.data.find(
        (e) => e.primary && e.verified
      )?.email;

      if (primaryEmail) {
        finalEmail = primaryEmail;
      } else {
        // Step 4: Generate fallback email if still not found
        finalEmail = `user_${id}@github-temp.com`;
      }
    }

    console.log(finalEmail);
    

    let isUserExits = await User.findOne({ email: finalEmail });

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
      userName: name || login,
      email: finalEmail,
      avatar: avatar_url,
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
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Failed to authenticate", success: false });
  }
};
