import api from "./api";

export const operationService = {
  // Record vehicle entry
  entry: async (vehicleData) => {
    try {
      const response = await api.post("/Movement/record-entry", {
        vrm: vehicleData.vrm,
        zone: vehicleData.zone || null,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to record vehicle entry";
    }
  },

  // Record vehicle exit
  exit: async (vrm) => {
    try {
      const response = await api.post(`/Movement/record-exit/${vrm}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to record vehicle exit";
    }
  },

  // Add new parking rate
  addRate: async (rateData) => {
    try {
      const response = await api.post("/ParkingRate/add-rate", {
        hourlyRate: rateData.hourlyRate,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to add parking rate";
    }
  },

  // Get all active vehicles (for owner dashboard)
  getActiveVehicles: async () => {
    try {
      const response = await api.get("/Movement/active-vehicles");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch active vehicles";
    }
  },

  // Get exit logs (for owner dashboard)
  getExitLogs: async () => {
    try {
      const response = await api.get("/Movement/exit-logs");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch exit logs";
    }
  },

  // Get current parking rate
  getCurrentRate: async () => {
    try {
      const response = await api.get("/ParkingRate/current-rate");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch current rate";
    }
  },

  // Get all parking rates
  getAllRates: async () => {
    try {
      const response = await api.get("/ParkingRate/get-rates");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch parking rates";
    }
  },
};
