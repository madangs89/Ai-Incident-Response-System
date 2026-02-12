import { addJob } from "../Bullmq/logQueue.js";
import { apiLogsQueue } from "../Bullmq/queue.js";
import APIKey from "../models/apikeys.model.js";
import Log from "../models/log.model.js";

export const acceptLog = async (req, res) => {
  try {
    let data = req.body;
    console.log("received");

    if (data == null) {
      return res.status(400).json({ message: "Body required", success: false });
    }
    data = Array.isArray(data) ? data : [data];
    if (data.length === 0) {
      return res.status(400).json({ message: "Log is empty", success: false });
    }
    const apiKey =
      req.header("x-api-key") ||
      req.headers["x-api-key"] ||
      req.get("x-api-key");
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

export const getWeeklyLogTrend = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "API key is required",
      });
    }

    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate logs
    const logs = await Log.aggregate([
      {
        $match: {
          key,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$createdAt" }, // 1=Sun, 2=Mon...
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Create empty 7-day template
    const dayMap = {
      1: "Sun",
      2: "Mon",
      3: "Tue",
      4: "Wed",
      5: "Thu",
      6: "Fri",
      7: "Sat",
    };

    const result = [];

    // Fill all days (even if 0 logs)
    for (let i = 1; i <= 7; i++) {
      const found = logs.find((l) => l._id.day === i);
      result.push({
        day: dayMap[i],
        logs: found ? found.count : 0,
      });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching weekly log trend:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
