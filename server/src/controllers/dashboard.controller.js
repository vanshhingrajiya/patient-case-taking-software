import { Patient } from "../models/index.js";

export const getDoctorStats = async (req, res) => {
  try {
    const patientCount = await Patient.countDocuments();
    
    // AI Flagged and Abnormal are dummy data for now
    const aiFlaggedCount = 5;
    const abnormalReportsCount = 3;

    return res.status(200).json({
      success: true,
      data: {
        patientCount,
        aiFlaggedCount,
        abnormalReportsCount
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats"
    });
  }
};
