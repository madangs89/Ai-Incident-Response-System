import APIKey from "../models/apikeys.model.js";
import Incident from "../models/insident.model.js";

export const getAllIncidents = async (req, res) => {
  try {
    const user = req.user;

    const key = req?.params?.key;

    if (!user || !key) {
      return res.status(400).json({
        message: "User information or key is missing",
        success: false,
      });
    }

    const keyDetails = await APIKey.findOne({ key: key });

    if (!keyDetails) {
      return res.status(404).json({
        message: "API Key not found",
        success: false,
      });
    }

    if (keyDetails.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this API key",
        success: false,
      });
    }

    const allIncidents = await Incident.find({ key: keyDetails.key });
    return res.status(200).json({
      message: "Incidents fetched successfully",
      success: true,
      data: allIncidents,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Issue while fetching",
      success: false,
    });
  }
};

export const markIncidentAsSolved = async (req, res) => {
  try {
    const { incidentId } = req.params;

    const user = req.user;

    if (!user) {
      return res.status(400).json({
        message: "User information is missing",
        success: false,
      });
    }

    if (!incidentId) {
      return res.status(400).json({
        message: "Incident ID is missing",
        success: false,
      });
    }

    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found",
        success: false,
      });
    }
    incident.status = "solved";
    await incident.save();
    return res.status(200).json({
      message: "Incident marked as solved successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Issue while updating incident status",
      success: false,
    });
  }
};


