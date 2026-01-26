import api from "./api";

export const customerService = {
  // Get registered VRMs for current customer
  getRegisteredVRMs: async () => {
    try {
      const response = await api.get("/Customer/registered-vrms");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch registered VRMs";
    }
  },

  // Add a VRM to customer's registered vehicles
  addVRM: async (vrm) => {
    try {
      const response = await api.post("/Customer/add-vrm", { vrm });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to add VRM";
    }
  },

  // Remove a VRM from customer's registered vehicles
  removeVRM: async (vrm) => {
    try {
      const response = await api.delete(`/Customer/remove-vrm/${vrm}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to remove VRM";
    }
  },

  // Get current parking status
  getCurrentParking: async () => {
    try {
      const response = await api.get("/Customer/current-parking");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch current parking";
    }
  },

  // Get parking history
  getParkingHistory: async () => {
    try {
      const response = await api.get("/Customer/parking-history");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch parking history";
    }
  },

  // Get customer stats
  getCustomerStats: async () => {
    try {
      const response = await api.get("/Customer/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch customer stats";
    }
  },
};
