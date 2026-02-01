import api from "./api";

export const operationService = {
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

  exit: async (vrm, paymentType, paymentMethod) => {
    try {
      const requestBody = {
        paymentType: paymentType,
      };

      // Only include paymentMethod if it's OnSpot payment
      if (paymentType === "OnSpot" && paymentMethod) {
        requestBody.paymentMethod = paymentMethod;
      }

      const response = await api.post(
        `/Movement/record-exit/${vrm}`,
        requestBody,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to record vehicle exit";
    }
  },

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
  getActiveVehicles: async () => {
    try {
      const response = await api.get("/Movement/active-vehicles");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch active vehicles";
    }
  },
  getExitLogs: async () => {
    try {
      const response = await api.get("/Movement/exit-logs");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch exit logs";
    }
  },
  getCurrentRate: async () => {
    try {
      const response = await api.get("/ParkingRate/current-rate");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch current rate";
    }
  },

  getAllRates: async () => {
    try {
      const response = await api.get("/ParkingRate/get-rates");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch parking rates";
    }
  },
};
