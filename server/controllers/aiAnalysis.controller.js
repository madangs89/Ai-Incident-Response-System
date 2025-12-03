import AIAnalysis from "../models/AIAnalysis.model.js";

export const getAiAnalysis = async (req, res) => {
  try {
    const id = req?.params?.id;
    if (!id) {
      return res.status(400).json({
        message: "Id is required",
        success: false,
      });
    }
    const aiData = await AIAnalysis.findOne({ incidentId: id });
    if (aiData) {
      return res.status(200).json({
        message: "AI Analysis fetched successfully",
        success: true,
        data: aiData,
      });
    } else {
      return res.status(404).json({
        message: "AI Analysis not found",
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server Error while fetching ai analysis",
      success: false,
    });
  }
};
