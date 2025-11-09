import { addJob } from "../Bullmq/logQueue.js";
import APIKey from "../models/apikeys.model.js";

import { apiLogsQueue } from "../server.js";

export const acceptLog = async (req, res) => {
  try {
    console.log("req.body");
    console.log(req.body);
    let data = req.body;

    if (data == null) {
      return res.status(400).json({ message: "Body required", success: false });
    }
    data = Array.isArray(data) ? data : [data];
    if (data.length === 0) {
      return res.status(400).json({ message: "Log is empty", success: false });
    }
    const apiKey = req.header("x-api-key") || req.headers["x-api-key"] || req.get("x-api-key");
    if (!apiKey) {
      return res
        .status(400)
        .json({ message: "API key is required", success: false });
    }

    const isValid = await APIKey.findOne({ key: apiKey });
    if (!isValid) {
      return res.status(404).json({
        message: "API key not found",
        success: false,
        valid: false,
      });
    }

    const result = await addJob(data, apiLogsQueue, "log", apiKey);
    if (!result) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    return res.status(200).json({ message: "Log accepted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
