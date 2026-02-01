import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { operationService } from "../services/operationService";

function ExitModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vrm: "",
    paymentType: "",
    paymentMethod: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exitInfo, setExitInfo] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleCheckVehicle = async (e) => {
    e.preventDefault();
    if (!formData.vrm.trim()) {
      setError("Please enter a VRM");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch vehicle info to check if it has a linked user
      const response = await operationService.getActiveVehicles();
      const vehicle = response.find(
        (v) =>
          v.vrm.toLowerCase() === formData.vrm.toLowerCase().replace(/\s/g, ""),
      );

      if (!vehicle) {
        setError("Vehicle not found or not currently parked");
        setLoading(false);
        return;
      }

      setVehicleInfo(vehicle);
    } catch (err) {
      setError(err || "Failed to fetch vehicle information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paymentType) {
      setError("Please select a payment type");
      return;
    }

    if (formData.paymentType === "OnSpot" && !formData.paymentMethod) {
      setError("Please select a payment method (Cash or Card)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await operationService.exit(
        formData.vrm,
        formData.paymentType,
        formData.paymentMethod,
      );
      setExitInfo(response.vehicle);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err || "Failed to process vehicle exit");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ vrm: "", paymentType: "", paymentMethod: "" });
    setError("");
    setLoading(false);
    setExitInfo(null);
    setVehicleInfo(null);
    onClose();
  };

  if (!isOpen) return null;

  const hasLinkedUser = vehicleInfo && vehicleInfo.customerName !== "Walk-in";

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Process Vehicle Exit</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {exitInfo && (
              <div className="alert alert-success" role="alert">
                <h6 className="alert-heading">Exit Recorded Successfully!</h6>
                <hr />
                <p className="mb-1">
                  <strong>VRM:</strong> {exitInfo.vrm.toUpperCase()}
                </p>
                {exitInfo.customerName && (
                  <p className="mb-1">
                    <strong>Customer:</strong> {exitInfo.customerName}
                  </p>
                )}
                <p className="mb-1">
                  <strong>Entry:</strong>{" "}
                  {new Date(exitInfo.entryTime).toLocaleString()}
                </p>
                <p className="mb-1">
                  <strong>Exit:</strong>{" "}
                  {new Date(exitInfo.exitTime).toLocaleString()}
                </p>
                <p className="mb-1">
                  <strong>Parking Fee:</strong> $
                  {exitInfo.parkingFee?.toFixed(2)}
                </p>
                <p className="mb-1">
                  <strong>Payment Type:</strong> {exitInfo.paymentType}
                </p>
                <p className="mb-0">
                  <strong>Payment Status:</strong>{" "}
                  <span
                    className={`badge ${exitInfo.isPaid ? "bg-success" : "bg-warning"}`}
                  >
                    {exitInfo.isPaid ? "Paid" : "Pending"}
                  </span>
                </p>
                {!exitInfo.isPaid && exitInfo.paymentType === "UserAccount" && (
                  <div className="alert alert-info mt-2 mb-0">
                    <small>
                      ℹ️ The customer will see this fee in their account and can
                      pay from their dashboard.
                    </small>
                  </div>
                )}
              </div>
            )}

            {!exitInfo && (
              <form onSubmit={vehicleInfo ? handleSubmit : handleCheckVehicle}>
                <div className="mb-3">
                  <label htmlFor="vrm" className="form-label">
                    Vehicle Registration Mark (VRM){" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="vrm"
                    name="vrm"
                    value={formData.vrm}
                    onChange={handleChange}
                    placeholder="e.g., AB21CDE"
                    required
                    disabled={vehicleInfo !== null}
                  />
                  <div className="form-text">
                    Enter the VRM of the vehicle that is exiting the parking lot
                  </div>
                </div>

                {vehicleInfo && (
                  <>
                    <div className="alert alert-info">
                      <strong>Customer:</strong>{" "}
                      {vehicleInfo.customerName || "Walk-in Customer"}
                      <br />
                      <strong>Entry Time:</strong>{" "}
                      {new Date(vehicleInfo.entryTime).toLocaleString()}
                      <br />
                      <strong>Zone:</strong> {vehicleInfo.zone || "N/A"}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Payment Type <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentType"
                            id="onSpotPayment"
                            value="OnSpot"
                            checked={formData.paymentType === "OnSpot"}
                            onChange={handleChange}
                          />
                          <label
                            htmlFor="onSpotPayment"
                            style={{
                              color: "#000",
                              fontSize: "14px",
                              cursor: "pointer",
                            }}
                          >
                            On-Spot Payment
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentType"
                            id="userAccountPayment"
                            value="UserAccount"
                            checked={formData.paymentType === "UserAccount"}
                            onChange={handleChange}
                            disabled={!hasLinkedUser}
                          />
                          <label
                            htmlFor="userAccountPayment"
                            style={{
                              color: "#000",
                              fontSize: "14px",
                              opacity: hasLinkedUser ? 1 : 0.5,
                              cursor: hasLinkedUser ? "pointer" : "not-allowed",
                            }}
                          >
                            User Account{" "}
                            {!hasLinkedUser && (
                              <span className="badge bg-secondary ms-1">
                                Not Available
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                      {!hasLinkedUser && (
                        <div className="form-text text-warning">
                          ⚠️ User account payment is only available for
                          registered customers
                        </div>
                      )}
                    </div>

                    {formData.paymentType === "OnSpot" && (
                      <div className="mb-3">
                        <label className="form-label">
                          Payment Method <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select payment method</option>
                          <option value="Cash">💵 Cash</option>
                          <option value="Card">💳 Card</option>
                        </select>
                      </div>
                    )}

                    {formData.paymentType === "UserAccount" && (
                      <div className="alert alert-info">
                        <small>
                          ℹ️ The parking fee will be automatically deducted from
                          the user's credit balance
                        </small>
                      </div>
                    )}
                  </>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  {vehicleInfo && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setVehicleInfo(null);
                        setFormData({
                          ...formData,
                          paymentType: "",
                          paymentMethod: "",
                        });
                      }}
                      disabled={loading}
                    >
                      Change Vehicle
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : vehicleInfo
                        ? "Process Exit & Payment"
                        : "Check Vehicle"}
                  </button>
                </div>
              </form>
            )}

            {exitInfo && (
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExitModal;
