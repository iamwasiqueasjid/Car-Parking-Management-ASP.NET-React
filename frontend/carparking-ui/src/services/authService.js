import api from "./api";

// In-memory user state (populated after login/register)
let currentUser = null;

export const authService = {
  // Register new user
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

      // Store user data in memory (token is in HttpOnly cookie)
      currentUser = response.data;
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post("/Auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      // Store user data in memory (token is in HttpOnly cookie)
      currentUser = response.data;
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/Auth/logout");
      currentUser = null;
    } catch (error) {
      // Even if logout fails, clear user data
      currentUser = null;
    }
  },

  // Get current user from API
  getCurrentUser: async () => {
    if (currentUser) {
      return currentUser;
    }

    try {
      const response = await api.get("/Auth/me");
      currentUser = response.data;
      return currentUser;
    } catch (error) {
      currentUser = null;
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const user = await authService.getCurrentUser();
    return !!user;
  },

  // Get user role
  getUserRole: () => {
    return currentUser?.role; // 0 = Customer, 1 = Owner
  },
};
