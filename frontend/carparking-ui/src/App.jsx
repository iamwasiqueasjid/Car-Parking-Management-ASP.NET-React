import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "./services/authService";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import OwnerDashboard from "./pages/OwnerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // If no user, show nothing (will redirect in useEffect)
  if (!currentUser) {
    return null;
  }

  // Route based on user role
  // Role 0 = Customer, Role 1 = Owner
  if (currentUser.role === 0) {
    return <CustomerDashboard />;
  }

  return <OwnerDashboard />;
}

export default App;
