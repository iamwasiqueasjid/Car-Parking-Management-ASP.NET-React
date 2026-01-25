import api from "./api";

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      // Map frontend role to backend enum (0 = Customer, 1 = Owner)
      const roleValue = userData.role === "Owner" ? 1 : 0;

      const response = await api.post("/Auth/register", {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber,
        role: roleValue,
      });

      // Save token and user data
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

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

      // Save token and user data
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get user role
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role; // 0 = Customer, 1 = Owner
  },
};
