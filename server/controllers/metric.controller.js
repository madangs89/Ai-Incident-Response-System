import APIKey from "../models/apikeys.model.js";

export const MetricAccept = async (req, res) => {
  try {
    console.log("got metric logs");

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

    const data = req.body;

    if (data.length == 0) {
      return res.status(400).json({ message: "Log is empty", success: false });
    }

    const outputObj = {};

    data.forEach((items) => {
      const { endpoint, method, status, duration } = items;
      if (!outputObj[endpoint]) {
        outputObj[endpoint] = {
          endpoint,
          method,
          status,
          count: 1,
          totalDuration: duration,
          averageDuration: duration,
        };
      } else {
        outputObj[endpoint].count++;
        outputObj[endpoint].totalDuration += duration;
        outputObj[endpoint].averageDuration =
          outputObj[endpoint].totalDuration / outputObj[endpoint].count;
      }
    });

    console.log(outputObj);

    return res.status(200).json({
      message: "API key verified successfully",
      success: true,
      valid: true,
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
