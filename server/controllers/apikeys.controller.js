import crypto from "crypto";
import APIKey from "../models/apikeys.model.js";

const generateKeys = () => {
  return crypto.randomBytes(32).toString("hex");
};
export const createAPIKey = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const { projectName } = req.body;
    if (!projectName) {
      return res.status(400).json({
        message: "Project name is required",
        success: false,
      });
    }

    const key = generateKeys();
    const apiKey = await APIKey.create({
      key,
      userId: user._id,
      projectName,
    });

    if (!apiKey) {
      return res.status(500).json({
        message: "Something went wrong",
        success: false,
      });
    }

    return res.status(200).json({
      message: "API key created successfully",
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const deleteAPIKey = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "API key id is required",
        success: false,
      });
    }
    const apiKey = await APIKey.findById(id);
    if (!apiKey) {
      return res.status(404).json({
        message: "API key not found",
        success: false,
      });
    }

    if (apiKey.userId.toString() !== user._id.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    await APIKey.findByIdAndDelete(id);

    return res.status(200).json({
      message: "API key deleted successfully",
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

export const updateAPIKey = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "API key id is required",
        success: false,
      });
    }
    const apiKey = await APIKey.findById(id);
    if (!apiKey) {
      return res.status(404).json({
        message: "API key not found",
        success: false,
      });
    }

    if (apiKey.userId.toString() !== user._id.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const newKey = generateKeys();
    apiKey.key = newKey;
    await apiKey.save();

    return res.status(200).json({
      message: "API key updated successfully",
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const getAPIKeys = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const data = await APIKey.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      message: "API keys fetched successfully",
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const verifyKeys = async (req, res) => {
  try {
    const key = req.get("x-api-key") || req.headers["x-api-key"];
    if (!key) {
      return res.status(400).json({
        message: "API key is required",
        success: false,
        valid: false,
      });
    }
    const apiKey = await APIKey.findOne({ key });
    if (!apiKey) {
      return res.status(404).json({
        message: "API key not found",
        success: false,
        valid: false,
      });
    }
    return res.status(200).json({
      message: "API key verified successfully",
      success: true,
      valid: true,
      data: apiKey,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      valid: false,
    });
  }
};
