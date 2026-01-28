import api from "./api";

let currentUser = null;

export const authService = {
  register: async (userData) => {
    try {
      const roleValue = userData.role === "Owner" ? 1 : 0;

      const response = await api.post("/Auth/register", {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        role: roleValue,
      });

      currentUser = response.data;
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/Auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      currentUser = response.data;
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },

  logout: async () => {
    try {
      await api.post("/Auth/logout");
      currentUser = null;
    } catch (error) {
      currentUser = null;
    }
  },

  getCurrentUser: async () => {
    if (currentUser) {
      return currentUser;
    }

    try {
      const response = await api.get("/User/me");
      currentUser = response.data;
      return currentUser;
    } catch (error) {
      currentUser = null;
      return null;
    }
  },
  isAuthenticated: async () => {
    const user = await authService.getCurrentUser();
    return !!user;
  },

  getUserRole: () => {
    return currentUser?.role;
  },
};
