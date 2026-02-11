import SecurityIncident from "../models/SecurityIncident.model.js";

/* =========================================
   GET TOTAL ACTIVE INCIDENT COUNT
========================================= */
export const getActiveIncidentCount = async (req, res) => {
  try {
    const { apiKey } = req.params; // optional filter

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: "apiKey parameter is required",
      });
    }
    const filter = { status: "open" };

    // If apiKey provided → filter by service
    if (apiKey) {
      filter.apiKey = apiKey;
    }

    const count = await SecurityIncident.countDocuments(filter);

    return res.json({
      success: true,
      activeIncidents: count,
    });
  } catch (error) {
    console.error("Error fetching active incident count:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
/* =========================================
   GET TOTAL RESOLVED INCIDENT COUNT
========================================= */
export const getResolvedIncidentCount = async (req, res) => {
  try {
    const { apiKey } = req.params; // optional filter
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: "apiKey parameter is required",
      });
    }

    const filter = { status: "resolved" };

    if (apiKey) {
      filter.apiKey = apiKey;
    }

    const count = await SecurityIncident.countDocuments(filter);

    return res.json({
      success: true,
      resolvedIncidents: count,
    });
  } catch (error) {
    console.error("Error fetching resolved incident count:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   GET INCIDENT DISTRIBUTION BY ATTACK TYPE
========================================= */
export const getIncidentDistribution = async (req, res) => {
  try {
    const { apiKey } = req.params; // optional filter

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: "apiKey parameter is required",
      });
    }

    const matchStage = {};

    if (apiKey) {
      matchStage.apiKey = apiKey;
    }

    const result = await SecurityIncident.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$attackType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          attackType: "$_id",
          count: 1,
        },
      },
    ]);

    return res.json({
      success: true,
      distribution: result,
    });
  } catch (error) {
    console.error("Error fetching incident distribution:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   GET ALL INCIDENTS (WITH PAGINATION)
========================================= */
export const getAllIncidents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      apiKey,
      status,
      attackType,
      severity,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    if (apiKey) filter.apiKey = apiKey;
    if (status) filter.status = status;
    if (attackType) filter.attackType = attackType;
    if (severity) filter.severity = Number(severity);

    const skip = (Number(page) - 1) * Number(limit);

    const sortOrder = order === "asc" ? 1 : -1;

    const [incidents, total] = await Promise.all([
      SecurityIncident.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      SecurityIncident.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      incidents,
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   GET WEEKLY INCIDENT TREND (LAST 7 DAYS)
========================================= */
export const getWeeklyIncidentTrend = async (req, res) => {
  try {
    const { apiKey } = req.params; // optional filter

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const matchStage = {
      createdAt: { $gte: sevenDaysAgo },
    };

    if (apiKey) {
      matchStage.apiKey = apiKey;
    }

    const result = await SecurityIncident.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1 (Sun) → 7 (Sat)
          incidents: { $sum: 1 },
        },
      },
    ]);

    // Map MongoDB day numbers to names
    const dayMap = {
      1: "Sun",
      2: "Mon",
      3: "Tue",
      4: "Wed",
      5: "Thu",
      6: "Fri",
      7: "Sat",
    };

    // Initialize all days with 0
    const weekData = [
      { day: "Mon", incidents: 0 },
      { day: "Tue", incidents: 0 },
      { day: "Wed", incidents: 0 },
      { day: "Thu", incidents: 0 },
      { day: "Fri", incidents: 0 },
      { day: "Sat", incidents: 0 },
      { day: "Sun", incidents: 0 },
    ];

    result.forEach((item) => {
      const dayName = dayMap[item._id];
      const index = weekData.findIndex((d) => d.day === dayName);
      if (index !== -1) {
        weekData[index].incidents = item.incidents;
      }
    });

    return res.json({
      success: true,
      data: weekData,
    });
  } catch (error) {
    console.error("Error fetching weekly trend:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const resolveIncidentGroup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Incident ID required",
      });
    }

    // 1️⃣ Find the selected incident
    const incident = await SecurityIncident.findById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    // 2️⃣ Update all similar open incidents
    const result = await SecurityIncident.updateMany(
      {
        apiKey: incident.apiKey,
        endpoint: incident.endpoint,
        attackType: incident.attackType,
        status: "open",
      },
      {
        $set: { status: "resolved" },
      },
    );

    return res.json({
      success: true,
      message: "Similar incidents resolved successfully",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error resolving incidents:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
