import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const getUserLogEdUserDetails = async (req, res) => {
  try {
    const id = req.user._id;
    if (!id) {
      return res.status(400).json({
        message: "User id is required",
        success: false,
      });
    }
    const user = await User.findById(id).populate("currentApiKey").select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
export const updateUserDetails = async (req, res) => {
  try {
    const id = req.user._id;
    if (!id) {
      return res.status(400).json({
        message: "User id is required",
        success: false,
      });
    }
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        message: "User id is required",
        success: false,
      });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const id = req.user._id;
    if (!id) {
      return res.status(400).json({
        message: "User id is required",
        success: false,
      });
    }
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Password is required",
        success: false,
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.password) {
      const isPassValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPassValid) {
        return res.status(400).json({
          message: "Incorrect password",
          success: false,
        });
      }
    }
    const hashedPassWord = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassWord;
    await user.save();
    return res.status(200).json({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
