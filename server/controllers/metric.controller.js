import APIKey from "../models/apikeys.model.js";
import Metric from "../models/metrix.model.js";

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
    console.log(data);
    

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
          errorCount: status >= 400 && status <= 599 ? 1 : 0,
          totalDuration: duration,
          averageDuration: duration,
        };
      } else {
        outputObj[endpoint].count++;
        outputObj[endpoint].totalDuration += duration;
        outputObj[endpoint].averageDuration =
          outputObj[endpoint].totalDuration / outputObj[endpoint].count;
        if (status >= 400 && status <= 599) {
          outputObj[endpoint].errorCount++;
        }
      }
    });

    console.log(outputObj);

    const bulkOps = Object.values(outputObj).map((item) => {
      const filters = {
        apiKey,
        endpoint: item.endpoint,
        method: item.method,
      };

      const countInc = item.count;
      const errorCountInc = item.errorCount;
      const totalDurationInc = item.totalDuration;

      const updatePipeline = [
        {
          $set: {
            totalDuration: {
              $add: [{ $ifNull: ["$totalDuration", 0] }, totalDurationInc],
            },
            count: { $add: [{ $ifNull: ["$count", 0] }, countInc] },
            errorCount: {
              $add: [{ $ifNull: ["$errorCount", 0] }, errorCountInc],
            },
          },
        },
        {
          $set: {
            avgDuration: {
              $cond: [
                { $eq: ["$count", 0] },
                0,
                { $divide: ["$totalDuration", "$count"] },
              ],
            },
          },
        },
        // Replace $setOnInsert with $set + $ifNull
        {
          $set: {
            apiKey: { $ifNull: ["$apiKey", apiKey] },
            endpoint: { $ifNull: ["$endpoint", item.endpoint] },
            method: { $ifNull: ["$method", item.method] },
          },
        },
      ];

      return {
        updateOne: {
          filter: filters,
          update: updatePipeline,
          upsert: true,
        },
      };
    });

    const bulkResult = await Metric.bulkWrite(bulkOps, { ordered: false });

    console.log("bulkWrite result:", bulkResult);
    return res.status(200).json({
      message: "Metrics processed",
      success: true,
      result: bulkResult,
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
