import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { customerService } from "../services/customerService";
import "../App.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activePanel, setActivePanel] = useState("dashboard");
  const [registeredVRMs, setRegisteredVRMs] = useState([]);
  const [newVRM, setNewVRM] = useState("");
  const [vrmError, setVrmError] = useState("");
  const [vrmLoading, setVrmLoading] = useState(false);

  // Dummy data - will be replaced with API calls
  const statContainers = [
    {
      title: "Pending Payments",
      score: "$45.50",
      supportingLine: "2 unpaid sessions",
    },
    {
      title: "This Week Spend",
      score: "$127.25",
      supportingLine: "8 parking sessions",
    },
    {
      title: "Total Visits",
      score: 42,
      supportingLine: "This month",
    },
    {
      title: "Active Parking",
      score: 1,
      supportingLine: "Currently parked",
    },
  ];

  const pendingPayments = [
    {
      vehiclePlate: "AB21CDE",
      entryTime: "Jan 24, 09:15 AM",
      exitTime: "Jan 24, 12:30 PM",
      duration: "3h 15m",
      fee: "$9.75",
      status: "Pending",
    },
    {
      vehiclePlate: "XY70MNO",
      entryTime: "Jan 23, 14:20 PM",
      exitTime: "Jan 23, 18:45 PM",
      duration: "4h 25m",
      fee: "$13.25",
      status: "Pending",
    },
    {
      vehiclePlate: "AB21CDE",
      entryTime: "Jan 22, 08:00 AM",
      exitTime: "Jan 22, 10:15 AM",
      duration: "2h 15m",
      fee: "$6.75",
      status: "Pending",
    },
  ];

  const recentSessions = [
    {
      vehiclePlate: "AB21CDE",
      entryTime: "Jan 20, 10:30 AM",
      exitTime: "Jan 20, 14:45 PM",
      duration: "4h 15m",
      fee: "$12.75",
      status: "Paid",
    },
    {
      vehiclePlate: "XY70MNO",
      entryTime: "Jan 19, 09:00 AM",
      exitTime: "Jan 19, 11:30 AM",
      duration: "2h 30m",
      fee: "$7.50",
      status: "Paid",
    },
    {
      vehiclePlate: "AB21CDE",
      entryTime: "Jan 18, 15:20 PM",
      exitTime: "Jan 18, 17:35 PM",
      duration: "2h 15m",
      fee: "$6.75",
      status: "Paid",
    },
  ];

  const weeklySpending = [
    { day: "Monday", amount: 15.5 },
    { day: "Tuesday", amount: 22.75 },
    { day: "Wednesday", amount: 18.25 },
    { day: "Thursday", amount: 25.0 },
    { day: "Friday", amount: 30.5 },
    { day: "Saturday", amount: 8.75 },
    { day: "Sunday", amount: 6.5 },
  ];

  const statusBg = {
    Paid: "#d1e7dd",
    Pending: "#fff3cd",
    Failed: "#f8d7da",
  };

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      if (currentUser.role !== 0) {
        navigate("/dashboard");
        return;
      }

      setUser(currentUser);
      loadRegisteredVRMs();
    };

    loadUser();
  }, [navigate]);

  const loadRegisteredVRMs = async () => {
    try {
      const vrms = await customerService.getRegisteredVRMs();
      setRegisteredVRMs(vrms);
    } catch (error) {
      console.error("Failed to load VRMs:", error);
    }
  };

  const handleAddVRM = async (e) => {
    e.preventDefault();
    setVrmError("");
    setVrmLoading(true);

    try {
      const response = await customerService.addVRM(newVRM);
      setRegisteredVRMs(response.vrms);
      setNewVRM("");
      alert(response.message || "VRM added successfully!");
    } catch (error) {
      setVrmError(error);
    } finally {
      setVrmLoading(false);
    }
  };

  const handleRemoveVRM = async (vrm) => {
    if (!confirm(`Are you sure you want to remove ${vrm}?`)) {
      return;
    }

    try {
      const response = await customerService.removeVRM(vrm);
      setRegisteredVRMs(response.vrms);
      alert(response.message || "VRM removed successfully!");
    } catch (error) {
      alert(error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const getHeaderTitle = () => {
    switch (activePanel) {
      case "dashboard":
        return "Overview";
      case "payments":
        return "Pending Payments";
      case "vehicles":
        return "My Vehicles";
      default:
        return "Dashboard";
    }
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
              className={`sidebar-btn ${activePanel === "payments" ? "active" : ""}`}
              onClick={() => setActivePanel("payments")}
            >
              <span>Payments</span>
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
          {/* Page Header */}
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

          {/* Main Content */}
          <div className="content-wrapper">
            {activePanel === "dashboard" && (
              <>
                {/* Stats Cards */}
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
                </div>

                {/* Weekly Spending Chart */}
                <div className="row">
                  <div className="col-md-9">
                    <div className="card shadow-sm rounded-3 p-3">
                      <h6 className="fw-bold mb-3">Weekly Spending</h6>
                      <div
                        className="row align-items-end"
                        style={{ height: "250px" }}
                      >
                        {weeklySpending.map((item, index) => {
                          const maxAmount = Math.max(
                            ...weeklySpending.map((d) => d.amount),
                          );
                          const height = (item.amount / maxAmount) * 200;
                          return (
                            <div key={index} className="col text-center">
                              <div
                                className="mb-2 mx-auto rounded-top"
                                style={{
                                  height: `${height}px`,
                                  width: "40px",
                                  backgroundColor: "#4a90e2",
                                }}
                              ></div>
                              <small className="text-muted d-block">
                                {item.day.slice(0, 3)}
                              </small>
                              <small className="fw-bold">${item.amount}</small>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="col-md-3">
                    <div className="card shadow-sm rounded-3 p-3">
                      <h6 className="fw-bold mb-3">Payment Status</h6>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Paid</span>
                          <span className="fw-bold text-success">$81.75</span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Pending</span>
                          <span className="fw-bold text-warning">$45.50</span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-warning"
                            style={{ width: "35%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold">Total</span>
                          <span className="fw-bold">$127.25</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Parking Sessions */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card shadow-sm rounded-3 p-3">
                      <h6 className="fw-bold mb-3">Recent Parking Sessions</h6>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Vehicle</th>
                              <th>Entry Time</th>
                              <th>Exit Time</th>
                              <th>Duration</th>
                              <th>Fee</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentSessions.map((session, index) => (
                              <tr key={index}>
                                <td className="fw-bold">
                                  {session.vehiclePlate}
                                </td>
                                <td>{session.entryTime}</td>
                                <td>{session.exitTime}</td>
                                <td>{session.duration}</td>
                                <td className="fw-bold">{session.fee}</td>
                                <td>
                                  <span
                                    className="badge rounded-pill"
                                    style={{
                                      backgroundColor: statusBg[session.status],
                                      color:
                                        session.status === "Paid"
                                          ? "#0f5132"
                                          : "#664d03",
                                    }}
                                  >
                                    {session.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePanel === "vehicles" && (
              <>
                {/* My Vehicles Header */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="alert alert-info d-flex align-items-center">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="me-2"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      <div>
                        <strong>Pre-register your vehicle plates</strong>
                        <br />
                        <small>
                          When the owner records your vehicle entry, it will
                          automatically be linked to your account
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add New VRM Form */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card shadow-sm rounded-3 p-4">
                      <h6 className="fw-bold mb-3">Register New Vehicle</h6>
                      {vrmError && (
                        <div className="alert alert-danger" role="alert">
                          {vrmError}
                        </div>
                      )}
                      <form onSubmit={handleAddVRM}>
                        <div className="mb-3">
                          <label htmlFor="vrm" className="form-label">
                            Vehicle Registration Mark (VRM)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="vrm"
                            value={newVRM}
                            onChange={(e) => {
                              setNewVRM(e.target.value);
                              setVrmError("");
                            }}
                            placeholder="e.g., ABC123, XY21ZZZ"
                            required
                            disabled={vrmLoading}
                          />
                          <div className="form-text">
                            Enter your vehicle's registration number
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={vrmLoading}
                        >
                          {vrmLoading ? "Adding..." : "Add Vehicle"}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card shadow-sm rounded-3 p-4">
                      <h6 className="fw-bold mb-3">How It Works</h6>
                      <ol className="mb-0">
                        <li className="mb-2">
                          Register your vehicle plate number here
                        </li>
                        <li className="mb-2">
                          When you arrive at the parking lot, the owner will
                          enter your VRM
                        </li>
                        <li className="mb-2">
                          Your vehicle will automatically be linked to your
                          account
                        </li>
                        <li className="mb-0">
                          You can view and pay for your parking sessions here
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Registered Vehicles List */}
                <div className="row">
                  <div className="col-12">
                    <div className="card shadow-sm rounded-3 p-3">
                      <h6 className="fw-bold mb-3">
                        Registered Vehicles ({registeredVRMs.length})
                      </h6>
                      {registeredVRMs.length === 0 ? (
                        <div className="alert alert-secondary" role="alert">
                          No vehicles registered yet. Add your first vehicle
                          above.
                        </div>
                      ) : (
                        <div className="row">
                          {registeredVRMs.map((vrm, index) => (
                            <div key={index} className="col-md-4 mb-3">
                              <div className="card border">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                  <div>
                                    <h5 className="mb-0 fw-bold">{vrm}</h5>
                                    <small className="text-muted">
                                      Registered Vehicle
                                    </small>
                                  </div>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveVRM(vrm)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePanel === "payments" && (
              <>
                {/* Pending Payments Header */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="alert alert-warning d-flex align-items-center">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="me-2"
                      >
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                      </svg>
                      <div>
                        <strong>
                          You have {pendingPayments.length} pending payments
                        </strong>
                        <br />
                        <small>Total amount due: $45.50</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Payments List */}
                <div className="row">
                  <div className="col-12">
                    <div className="card shadow-sm rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">Pending Payments</h6>
                        <button className="btn btn-primary btn-sm">
                          Pay All ($45.50)
                        </button>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Vehicle</th>
                              <th>Entry Time</th>
                              <th>Exit Time</th>
                              <th>Duration</th>
                              <th>Fee</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingPayments.map((payment, index) => (
                              <tr key={index}>
                                <td className="fw-bold">
                                  {payment.vehiclePlate}
                                </td>
                                <td>{payment.entryTime}</td>
                                <td>{payment.exitTime}</td>
                                <td>{payment.duration}</td>
                                <td className="fw-bold">{payment.fee}</td>
                                <td>
                                  <span
                                    className="badge rounded-pill"
                                    style={{
                                      backgroundColor: statusBg[payment.status],
                                      color: "#664d03",
                                    }}
                                  >
                                    {payment.status}
                                  </span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-success">
                                    Pay Now
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card shadow-sm rounded-3 p-3">
                      <h6 className="fw-bold mb-3">Payment History</h6>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Vehicle</th>
                              <th>Entry Time</th>
                              <th>Exit Time</th>
                              <th>Duration</th>
                              <th>Fee</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentSessions.map((session, index) => (
                              <tr key={index}>
                                <td className="fw-bold">
                                  {session.vehiclePlate}
                                </td>
                                <td>{session.entryTime}</td>
                                <td>{session.exitTime}</td>
                                <td>{session.duration}</td>
                                <td className="fw-bold">{session.fee}</td>
                                <td>
                                  <span
                                    className="badge rounded-pill"
                                    style={{
                                      backgroundColor: statusBg[session.status],
                                      color: "#0f5132",
                                    }}
                                  >
                                    {session.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
