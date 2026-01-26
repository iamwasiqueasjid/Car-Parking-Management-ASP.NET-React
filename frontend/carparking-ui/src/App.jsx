import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "./services/authService";
import { operationService } from "./services/operationService";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import EntryModal from "./components/EntryModal";
import ExitModal from "./components/ExitModal";
import ParkingRateModal from "./components/ParkingRateModal";

function App() {
  const navigate = useNavigate();

  const [activePanel, setActivePanel] = useState("dashboard");
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isParkingRateModalOpen, setIsParkingRateModalOpen] = useState(false);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [exitLogs, setExitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vehicles, logs] = await Promise.all([
        operationService.getActiveVehicles(),
        operationService.getExitLogs(),
      ]);
      setActiveVehicles(vehicles);
      setExitLogs(logs);
      setError("");
    } catch (err) {
      setError(err || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format duration
  const formatDuration = (duration) => {
    const hours = Math.floor(duration.hours || 0);
    const minutes = Math.floor(duration.minutes || 0);
    return `${hours}h ${minutes}m`;
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const statContainers = [
    {
      title: "Active vehicles",
      score: activeVehicles.length,
      supportingLine: "Currently parked",
    },
    {
      title: "Total Capacity",
      score: 200,
      supportingLine: "71% occupied",
    },
    {
      title: "Revenue Today",
      score: 2845,
      supportingLine: "+15 % yesterday",
    },
    {
      title: "Average duration",
      score: 2.5,
      supportingLine: "-0.3 vs avg",
    },
  ];

  const paymentSummary = [
    {
      status: "Paid",
      amount: 1240,
      quantity: 85,
    },
    {
      status: "Pending",
      amount: 340,
      quantity: 18,
    },
    {
      status: "Failed",
      amount: 95,
      quantity: 3,
    },
  ];

  const statusBg = {
    Paid: "#d1e7dd", // green
    Pending: "#fff3cd", // yellow
    Failed: "#f8d7da", // red
  };

  const weeklyRevenue = [
    {
      day: "Monday",
      revenue: 2100,
    },
    {
      day: "Tuesday",
      revenue: 2400,
    },
    {
      day: "Wednesday",
      revenue: 1900,
    },
    {
      day: "Thursday",
      revenue: 2800,
    },
    {
      day: "Friday",
      revenue: 3100,
    },
    {
      day: "Saturday",
      revenue: 3400,
    },
    {
      day: "Sunday",
      revenue: 2200,
    },
  ];

  const getHeaderTitle = () => {
    switch (activePanel) {
      case "dashboard":
        return "Overview";
      case "operations":
        return "Operations";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div className="col-md-2 sidebar">
          <div className="sidebar-header">
            <h4 className="mb-0">Car Parking</h4>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`sidebar-btn ${activePanel === "dashboard" ? "active" : ""}`}
              onClick={() => setActivePanel("dashboard")}
            >
              <span>Dashboard</span>
            </button>
            <button
              className={`sidebar-btn ${activePanel === "operations" ? "active" : ""}`}
              onClick={() => setActivePanel("operations")}
            >
              <span>Operations</span>
            </button>
          </nav>

          {/* Logout Button at Bottom */}
          <div style={{ marginTop: "auto", padding: "1rem" }}>
            <button className="sidebar-btn" onClick={handleLogout}>
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
          {/* Dynamic Header */}
          <div className="page-header">
            <h2 className="mb-0">{getHeaderTitle()}</h2>
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

          {activePanel === "dashboard" && (
            <>
              <div className="content-wrapper">
                <div className="row">
                  {statContainers.map((item, index) => (
                    <div key={index} className="col-md-3 mb-4">
                      <div
                        className="card shadow-sm rounded-3 p-3"
                        id="statContainer"
                      >
                        <h5 className="card-title">{item.title}</h5>
                        <h2 className="card-text">{item.score}</h2>
                        <p className="text-muted">{item.supportingLine}</p>
                      </div>
                    </div>
                  ))}
                  <div className="row">
                    <div className="col-md-9 bg-grey">
                      <div className="card shadow-sm rounded-3 p-3">
                        <h6 className="fw-bold mb-3">
                          Currently Parked Vehicles
                        </h6>
                        {loading ? (
                          <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : error ? (
                          <div className="alert alert-warning" role="alert">
                            {error}
                          </div>
                        ) : activeVehicles.length === 0 ? (
                          <div className="alert alert-info" role="alert">
                            No vehicles currently parked
                          </div>
                        ) : (
                          <div className="col ">
                            {activeVehicles.map((item, index) => (
                              <div
                                key={index}
                                className="card shadow-sm rounded-3 p-3 mb-3"
                                style={{ backgroundColor: "#F5F9FB" }}
                              >
                                <h6 className="card-title fw-bold">
                                  {item.vrm.toUpperCase()}
                                </h6>

                                <div className="row">
                                  <div className="col">
                                    <p className="text-muted mb-1">Entry Time</p>
                                    <p className="fw-bold">
                                      {new Date(item.entryTime).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  <div className="col">
                                    <p className="text-muted mb-1">Duration</p>
                                    <p className="fw-bold">{formatDuration(item.duration)}</p>
                                  </div>
                                  <div className="col">
                                    <p className="text-muted mb-1">Zone</p>
                                    <p className="fw-bold">{item.zone || 'N/A'}</p>
                                  </div>
                                  {item.customerName && (
                                    <div className="col">
                                      <p className="text-muted mb-1">Customer</p>
                                      <p className="fw-bold">{item.customerName}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="card shadow-sm rounded-3 p-3 my-3">
                        <h6 className="fw-bold mb-3">Recent Exit Logs</h6>
                        {loading ? (
                          <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : exitLogs.length === 0 ? (
                          <div className="alert alert-info" role="alert">
                            No exit logs available
                          </div>
                        ) : (
                          <table className="table">
                            <thead>
                              <tr>
                                <th scope="col">VRM</th>
                                <th scope="col">Entry</th>
                                <th scope="col">Exit</th>
                                <th scope="col">Duration</th>
                                <th scope="col">Fee</th>
                                <th scope="col">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {exitLogs.slice(0, 10).map((item, index) => (
                                <tr key={index}>
                                  <th scope="row">{item.vrm.toUpperCase()}</th>
                                  <td className="text-muted">
                                    {new Date(item.entryTime).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="text-muted">
                                    {new Date(item.exitTime).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="text-muted">{formatDuration(item.duration)}</td>
                                  <td className="fw-bold">${item.parkingFee?.toFixed(2)}</td>
                                  <td className="text-muted ">
                                    <button
                                      className={`btn btn-sm ${item.isPaid ? "btn-success" : "btn-warning"}`}
                                    >
                                      {item.status}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card shadow-sm rounded-3 p-3 mb-3">
                        <h6 className="fw-bold mb-2">Payment Summary</h6>

                        {paymentSummary.map((item, index) => (
                          <div key={index} className="col mb-4">
                            <p className="mb-1">
                              {item.status === "Paid"
                                ? "Paid transaction"
                                : item.status === "Pending"
                                  ? "Pending transaction"
                                  : "Failed transaction"}
                            </p>
                            <p className="fw-bold mb-1">$ {item.amount}</p>
                            <span
                              className={`rounded-3 px-2 py-1`}
                              style={{ backgroundColor: statusBg[item.status] }}
                            >
                              {item.quantity} transactions
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="card shadow-sm rounded-3 p-3 mb-3">
                        <h6 className="fw-bold mb-3">Weekly Revenue</h6>
                        <table class="table">
                          <thead>
                            <tr>
                              <th scope="col">Day</th>
                              <th scope="col">Revenue</th>
                            </tr>
                          </thead>
                          {weeklyRevenue.map((item, index) => (
                            <tbody>
                              <tr key={index}>
                                <th scope="row">{item.day}</th>
                                <td className="text-muted">$ {item.revenue}</td>
                              </tr>
                            </tbody>
                          ))}
                        </table>
                      </div>
                      <div className="card shadow-sm rounded-3 p-3 mb-3">
                        <h6 className="fw-bold mb-3">Quick Actions</h6>
                        <button className="btn report mb-2">
                          Generate Report
                        </button>
                        <button className="btn data mb-2">Export Data</button>
                        <button className="btn settings mb-2 ">
                          View Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {activePanel === "operations" && (
            <div className="content-wrapper">
              <div className="card shadow-sm rounded-3 p-4 mb-4">
                <h4 className="fw-bold mb-3">Operations Management</h4>
                <p className="text-muted">
                  Manage your parking operations here.
                </p>
                <div className="row mt-4">
                  <div className="col-md-4 mb-3">
                    <div className="operation-card">
                      <h5>🚪 Entry Management</h5>
                      <p className="text-muted">Register new vehicle entries</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setIsEntryModalOpen(true)}
                      >
                        Record Entry
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="operation-card">
                      <h5>🚦 Exit Processing</h5>
                      <p className="text-muted">Process vehicle exits</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setIsExitModalOpen(true)}
                      >
                        Process Exit
                      </button>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="operation-card">
                      <h5>💰 Parking Rates</h5>
                      <p className="text-muted">Add new parking rates</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => setIsParkingRateModalOpen(true)}
                      >
                        Add Parking Rate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          <EntryModal
            isOpen={isEntryModalOpen}
            onClose={() => setIsEntryModalOpen(false)}
            onSuccess={fetchDashboardData}
          />
          <ExitModal
            isOpen={isExitModalOpen}
            onClose={() => setIsExitModalOpen(false)}
            onSuccess={fetchDashboardData}
          />
          <ParkingRateModal
            isOpen={isParkingRateModalOpen}
            onClose={() => setIsParkingRateModalOpen(false)}
            onSuccess={fetchDashboardData}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
