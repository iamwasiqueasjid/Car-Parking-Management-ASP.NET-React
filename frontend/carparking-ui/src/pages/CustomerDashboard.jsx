import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "../App.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activePanel, setActivePanel] = useState("dashboard");

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    // Ensure only customers can access this page
    if (currentUser.role !== 0) {
      navigate("/dashboard");
      return;
    }
    
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div className="col-md-2 sidebar">
          <div className="sidebar-header">
            <h4 className="mb-0">Customer Portal</h4>
            <p className="text-muted small mb-0 mt-2">{user.fullName}</p>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`sidebar-btn ${activePanel === "dashboard" ? "active" : ""}`}
              onClick={() => setActivePanel("dashboard")}
            >
              <span>Dashboard</span>
            </button>
            <button
              className={`sidebar-btn ${activePanel === "vehicles" ? "active" : ""}`}
              onClick={() => setActivePanel("vehicles")}
            >
              <span>My Vehicles</span>
            </button>
            <button
              className={`sidebar-btn ${activePanel === "history" ? "active" : ""}`}
              onClick={() => setActivePanel("history")}
            >
              <span>Parking History</span>
            </button>
            <button
              className={`sidebar-btn ${activePanel === "payments" ? "active" : ""}`}
              onClick={() => setActivePanel("payments")}
            >
              <span>Payments</span>
            </button>
          </nav>
          
          {/* Logout Button at Bottom */}
          <div style={{ marginTop: "auto", padding: "1rem" }}>
            <button
              className="sidebar-btn"
              onClick={handleLogout}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-md-10 right-panel">
          {/* Page Header */}
          <div className="page-header">
            <h2 className="mb-0">
              {activePanel === "dashboard" && "Dashboard"}
              {activePanel === "vehicles" && "My Vehicles"}
              {activePanel === "history" && "Parking History"}
              {activePanel === "payments" && "Payments"}
            </h2>
            <div className="header-actions">
              <span className="text-muted">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="content-wrapper">
            {activePanel === "dashboard" && (
              <>
                {/* Stats Cards */}
                <div className="row g-4 mb-5">
                  <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <p className="text-muted mb-1">Active Parking</p>
                          <h3 className="fw-bold mb-0">0</h3>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: "#2563eb" }}>
                          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                          </svg>
                        </div>
                      </div>
                      <p className="text-muted small mb-0">No active sessions</p>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <p className="text-muted mb-1">Total Spent</p>
                          <h3 className="fw-bold mb-0">$0.00</h3>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: "#10b981" }}>
                          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                          </svg>
                        </div>
                      </div>
                      <p className="text-muted small mb-0">This month</p>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <p className="text-muted mb-1">Total Visits</p>
                          <h3 className="fw-bold mb-0">0</h3>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: "#f59e0b" }}>
                          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                          </svg>
                        </div>
                      </div>
                      <p className="text-muted small mb-0">All time</p>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-3">
                    <div className="card shadow-sm rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <p className="text-muted mb-1">Registered Vehicles</p>
                          <h3 className="fw-bold mb-0">0</h3>
                        </div>
                        <div className="p-3 rounded" style={{ backgroundColor: "#8b5cf6" }}>
                          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                      </div>
                      <p className="text-muted small mb-0">Add vehicle to start</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="row g-4 mb-4">
                  <div className="col-12">
                    <h5 className="fw-bold mb-3">Quick Actions</h5>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <button className="btn btn-lg w-100 p-4 border-0" style={{ backgroundColor: "#2563eb", color: "white" }}>
                      <div>
                        <svg width="48" height="48" fill="white" viewBox="0 0 24 24" className="mb-2">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        <h6 className="fw-bold mb-1">Add Vehicle</h6>
                        <small>Register new vehicle</small>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <button className="btn btn-lg w-100 p-4 border-0" style={{ backgroundColor: "#10b981", color: "white" }}>
                      <div>
                        <svg width="48" height="48" fill="white" viewBox="0 0 24 24" className="mb-2">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <h6 className="fw-bold mb-1">View History</h6>
                        <small>Parking history</small>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <button className="btn btn-lg w-100 p-4 border-0" style={{ backgroundColor: "#f59e0b", color: "white" }}>
                      <div>
                        <svg width="48" height="48" fill="white" viewBox="0 0 24 24" className="mb-2">
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                        </svg>
                        <h6 className="fw-bold mb-1">Payments</h6>
                        <small>View payments</small>
                      </div>
                    </button>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <button className="btn btn-lg w-100 p-4 border-0" style={{ backgroundColor: "#8b5cf6", color: "white" }}>
                      <div>
                        <svg width="48" height="48" fill="white" viewBox="0 0 24 24" className="mb-2">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        <h6 className="fw-bold mb-1">Profile</h6>
                        <small>Manage account</small>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="row">
                  <div className="col-12">
                    <div className="card shadow-sm rounded-3 p-4">
                      <h5 className="fw-bold mb-4">Recent Parking Sessions</h5>
                      <div className="text-center py-5">
                        <svg width="64" height="64" fill="#6b7280" viewBox="0 0 24 24" className="mb-3">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <p className="text-muted">No parking sessions yet</p>
                        <p className="text-muted small">Start by adding a vehicle and parking your car</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePanel === "vehicles" && (
              <div className="text-center py-5">
                <h4>My Vehicles</h4>
                <p className="text-muted">Vehicle management coming soon</p>
              </div>
            )}

            {activePanel === "history" && (
              <div className="text-center py-5">
                <h4>Parking History</h4>
                <p className="text-muted">History view coming soon</p>
              </div>
            )}

            {activePanel === "payments" && (
              <div className="text-center py-5">
                <h4>Payment Records</h4>
                <p className="text-muted">Payment history coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
