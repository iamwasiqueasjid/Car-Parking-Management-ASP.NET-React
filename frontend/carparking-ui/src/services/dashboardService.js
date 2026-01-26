import api from "./api";

export const dashboardService = {
  // Owner Dashboard APIs
  getOwnerStats: async () => {
    try {
      const response = await api.get("/Dashboard/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch dashboard stats";
    }
  },

  getWeeklyRevenue: async () => {
    try {
      const response = await api.get("/Dashboard/weekly-revenue");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch weekly revenue";
    }
  },

  getPaymentSummary: async () => {
    try {
      const response = await api.get("/Dashboard/payment-summary");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch payment summary";
    }
  },
};
