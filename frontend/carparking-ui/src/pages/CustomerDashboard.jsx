import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { customerService } from "../services/customerService";
import ConfirmModal from "../components/ConfirmModal";
import AddCreditModal from "../components/AddCreditModal";
import "../App.css";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activePanel, setActivePanel] = useState("dashboard");
  const [registeredVRMs, setRegisteredVRMs] = useState([]);
  const [newVRM, setNewVRM] = useState("");
  const [vrmError, setVrmError] = useState("");
  const [vrmLoading, setVrmLoading] = useState(false);
  const [customerStats, setCustomerStats] = useState(null);
  const [parkingHistory, setParkingHistory] = useState([]);
  const [currentParking, setCurrentParking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });

  // Alert modal state (for success/error messages)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (title, message, type = "info") => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const showConfirm = (title, message, onConfirm, type = "warning") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  const loadRegisteredVRMs = async () => {
    try {
      const vrms = await customerService.getRegisteredVRMs();
      setRegisteredVRMs(vrms);
    } catch (error) {
      console.error("Failed to load VRMs:", error);
    }
  };

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [stats, history, parking, credit] = await Promise.all([
        customerService.getCustomerStats(),
        customerService.getParkingHistory(),
        customerService.getCurrentParking(),
        customerService.getCreditBalance(),
      ]);
      console.log("Parking history data:", history);
      console.log("Sample payment record:", history[0]);
      setCustomerStats(stats);
      setParkingHistory(history);
      setCurrentParking(parking);
      setCreditBalance(credit.creditBalance);
    } catch (error) {
      console.error("Failed to load customer data:", error);
    } finally {
      setLoading(false);
    }
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
      await loadRegisteredVRMs();
      await loadCustomerData();
    };

    loadUser();
  }, [navigate]);

  const handleAddVRM = async (e) => {
    e.preventDefault();
    setVrmError("");
    setVrmLoading(true);

    try {
      const response = await customerService.addVRM(newVRM);
      setRegisteredVRMs(response.vrms);
      setNewVRM("");
      showAlert(
        "Success",
        response.message || "VRM added successfully!",
        "success",
      );
    } catch (error) {
      setVrmError(error);
    } finally {
      setVrmLoading(false);
    }
  };

  const handleRemoveVRM = async (vrm) => {
    showConfirm(
      "Remove Vehicle",
      `Are you sure you want to remove ${vrm}?`,
      async () => {
        try {
          const response = await customerService.removeVRM(vrm);
          setRegisteredVRMs(response.vrms);
          showAlert(
            "Success",
            response.message || "VRM removed successfully!",
            "success",
          );
        } catch (error) {
          showAlert("Error", error, "danger");
        }
      },
      "danger",
    );
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const statusBg = {
    Paid: "#d1e7dd",
    Pending: "#fff3cd",
    Failed: "#f8d7da",
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const hours = Math.floor(duration.hours || 0);
    const minutes = Math.floor(duration.minutes || 0);
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statContainers = customerStats
    ? [
        {
          title: "Pending Payments",
          score: `$${customerStats.unpaidAmount.toFixed(2)}`,
          supportingLine: "Unpaid sessions",
        },
        {
          title: "Total Spent",
          score: `$${customerStats.totalSpent.toFixed(2)}`,
          supportingLine: "All time",
        },
        {
          title: "Total Visits",
          score: customerStats.totalVisits,
          supportingLine: "All parking sessions",
        },
        {
          title: "Active Parking",
          score: customerStats.currentlyParked ? 1 : 0,
          supportingLine: customerStats.currentlyParked
            ? "Currently parked"
            : "No active parking",
        },
      ]
    : [];

  const pendingPayments = parkingHistory.filter((h) => !h.isPaid) || [];
  const paidSessions = parkingHistory.filter((h) => h.isPaid) || [];
  
  console.log("Pending payments count:", pendingPayments.length);
  console.log("Pending payments:", pendingPayments);

  const handlePayParkingFee = async (vehicleId, amount) => {
    console.log("Payment initiated for vehicleId:", vehicleId, "amount:", amount);
    console.log("Current credit balance:", creditBalance);
    
    if (creditBalance < amount) {
      showAlert(
        "Insufficient Credits",
        `You need $${amount.toFixed(2)} but only have $${creditBalance.toFixed(2)}. Please add credits first.`,
        "warning",
      );
      return;
    }

    showConfirm(
      "Confirm Payment",
      `Pay $${amount.toFixed(2)} using your account credits?`,
      async () => {
        console.log("Payment confirmed, processing...");
        // Close the confirm modal first
        setConfirmModal({ ...confirmModal, isOpen: false });
        
        try {
          const response = await customerService.payParkingFee(vehicleId);
          console.log("Payment response:", response);
          showAlert("Success", response.message, "success");
          await loadCustomerData(); // Refresh data
        } catch (error) {
          console.error("Payment error in handler:", error);
          showAlert("Payment Failed", error, "danger");
        }
      },
      "info",
    );
  };

  const getHeaderTitle = () => {
    switch (activePanel) {
      case "dashboard":
        return "Overview";
      case "payments":
        return "Pending Payments";
      case "vehicles":
        return "My Vehicles";
      case "credit":
        return "Account Credit";
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
            <button
              className={`sidebar-btn ${activePanel === "credit" ? "active" : ""}`}
              onClick={() => setActivePanel("credit")}
            >
              <span>Account Credit</span>
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
              <div className="d-flex align-items-center me-3">
                <span className="badge bg-success px-3 py-2 fs-6">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="me-2"
                  >
                    <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z" />
                  </svg>
                  Credit: ${creditBalance.toFixed(2)}
                </span>
              </div>
              <button
                className="btn btn-sm btn-outline-primary me-3"
                onClick={loadCustomerData}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      className="me-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
                      />
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
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
                {loading && !customerStats ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
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

                    {/* Current Parking Status */}
                    {currentParking && currentParking.isParked && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <div className="alert alert-success">
                            <h6 className="fw-bold">Currently Parked</h6>
                            <div className="row mt-3">
                              <div className="col-md-3">
                                <strong>Vehicle:</strong>{" "}
                                {currentParking.vehicle.vrm}
                              </div>
                              <div className="col-md-3">
                                <strong>Entry:</strong>{" "}
                                {formatDateTime(
                                  currentParking.vehicle.entryTime,
                                )}
                              </div>
                              <div className="col-md-3">
                                <strong>Duration:</strong>{" "}
                                {formatDuration(
                                  currentParking.vehicle.duration,
                                )}
                              </div>
                              <div className="col-md-3">
                                <strong>Est. Fee:</strong> $
                                {currentParking.vehicle.estimatedFee?.toFixed(
                                  2,
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Parking Sessions */}
                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="card shadow-sm rounded-3 p-3">
                          <h6 className="fw-bold mb-3">
                            Recent Parking Sessions
                          </h6>
                          {paidSessions.length === 0 ? (
                            <div className="alert alert-info">
                              No parking history yet
                            </div>
                          ) : (
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
                                  {paidSessions
                                    .slice(0, 5)
                                    .map((session, index) => (
                                      <tr key={index}>
                                        <td className="fw-bold">
                                          {session.vrm}
                                        </td>
                                        <td>
                                          {formatDateTime(session.entryTime)}
                                        </td>
                                        <td>
                                          {formatDateTime(session.exitTime)}
                                        </td>
                                        <td>
                                          {formatDuration(session.duration)}
                                        </td>
                                        <td className="fw-bold">
                                          ${session.parkingFee?.toFixed(2)}
                                        </td>
                                        <td>
                                          <span
                                            className="badge rounded-pill"
                                            style={{
                                              backgroundColor: statusBg.Paid,
                                              color: "#0f5132",
                                            }}
                                          >
                                            Paid
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
                        <small>
                          Total amount due: $
                          {pendingPayments
                            .reduce((sum, p) => sum + (p.parkingFee || 0), 0)
                            .toFixed(2)}
                        </small>
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
                        {pendingPayments.length > 0 && (
                          <button className="btn btn-primary btn-sm">
                            Pay All ($
                            {pendingPayments
                              .reduce((sum, p) => sum + (p.parkingFee || 0), 0)
                              .toFixed(2)}
                            )
                          </button>
                        )}
                      </div>
                      {pendingPayments.length === 0 ? (
                        <div className="alert alert-success">
                          No pending payments
                        </div>
                      ) : (
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
                                  <td className="fw-bold">{payment.vrm}</td>
                                  <td>{formatDateTime(payment.entryTime)}</td>
                                  <td>{formatDateTime(payment.exitTime)}</td>
                                  <td>{formatDuration(payment.duration)}</td>
                                  <td className="fw-bold">
                                    ${payment.parkingFee?.toFixed(2)}
                                  </td>
                                  <td>
                                    <span
                                      className="badge rounded-pill"
                                      style={{
                                        backgroundColor: statusBg.Pending,
                                        color: "#664d03",
                                      }}
                                    >
                                      Pending
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-success"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handlePayParkingFee(
                                          payment.vehicleId,
                                          payment.parkingFee,
                                        );
                                      }}
                                    >
                                      Pay Now
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card shadow-sm rounded-3 p-3">
                      <h6 className="fw-bold mb-3">Payment History</h6>
                      {paidSessions.length === 0 ? (
                        <div className="alert alert-info">
                          No payment history yet
                        </div>
                      ) : (
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
                              {paidSessions.map((session, index) => (
                                <tr key={index}>
                                  <td className="fw-bold">{session.vrm}</td>
                                  <td>{formatDateTime(session.entryTime)}</td>
                                  <td>{formatDateTime(session.exitTime)}</td>
                                  <td>{formatDuration(session.duration)}</td>
                                  <td className="fw-bold">
                                    ${session.parkingFee?.toFixed(2)}
                                  </td>
                                  <td>
                                    <span
                                      className="badge rounded-pill"
                                      style={{
                                        backgroundColor: statusBg.Paid,
                                        color: "#0f5132",
                                      }}
                                    >
                                      Paid
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePanel === "credit" && (
              <>
                {/* Credit Balance Card */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div
                      className="card shadow-sm rounded-3 p-4 text-center"
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <h6 className="text-muted mb-2">Current Balance</h6>
                      <h1 className="display-4 fw-bold text-success mb-3">
                        ${creditBalance.toFixed(2)}
                      </h1>
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={() => setIsAddCreditModalOpen(true)}
                      >
                        💳 Add Credits
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card shadow-sm rounded-3 p-4">
                      <h6 className="fw-bold mb-3">How Account Credits Work</h6>
                      <ul className="mb-0">
                        <li className="mb-2">
                          Add money to your account from your bank account
                        </li>
                        <li className="mb-2">
                          Use credits to instantly pay parking fees
                        </li>
                        <li className="mb-2">
                          No need to pay with cash or card each time
                        </li>
                        <li className="mb-0">
                          Secure and convenient payment method
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="row">
                  <div className="col-12">
                    <div className="card shadow-sm rounded-3 p-3">
                      <h6 className="fw-bold mb-3">
                        Recent Payments with Credits
                      </h6>
                      {paidSessions.length === 0 ? (
                        <div className="alert alert-info">
                          No credit payments yet
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Vehicle</th>
                                <th>Duration</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paidSessions
                                .slice(0, 10)
                                .map((session, index) => (
                                  <tr key={index}>
                                    <td>{formatDateTime(session.exitTime)}</td>
                                    <td className="fw-bold">{session.vrm}</td>
                                    <td>{formatDuration(session.duration)}</td>
                                    <td className="fw-bold text-success">
                                      -${session.parkingFee?.toFixed(2)}
                                    </td>
                                    <td>
                                      <span className="badge rounded-pill bg-success">
                                        Paid
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCreditModal
        isOpen={isAddCreditModalOpen}
        onClose={() => setIsAddCreditModalOpen(false)}
        onSuccess={loadCustomerData}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
      <ConfirmModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        onConfirm={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="OK"
        cancelText=""
        type={alertModal.type}
      />
    </div>
  );
}

export default CustomerDashboard;
