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

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }
  if (currentUser.role === 0) {
    return <CustomerDashboard />;
  }

  return <OwnerDashboard />;
}

export default App;
