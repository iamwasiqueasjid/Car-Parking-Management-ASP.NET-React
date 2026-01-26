import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { operationService } from "../services/operationService";

function ExitModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vrm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exitInfo, setExitInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await operationService.exit(formData.vrm);
      setExitInfo(response.vehicle);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err || "Failed to process vehicle exit");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ vrm: "" });
    setError("");
    setLoading(false);
    setExitInfo(null);
    onClose();
  };

  if (!isOpen) return null;

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
            <h5 className="modal-title">🚦 Process Vehicle Exit</h5>
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
                  <strong>VRM:</strong> {exitInfo.vrm}
                </p>
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
                <p className="mb-0">
                  <strong>Payment Status:</strong>{" "}
                  {exitInfo.isPaid ? "Paid" : "Pending"}
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
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
                />
                <div className="form-text">
                  Enter the VRM of the vehicle that is exiting the parking lot
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  {exitInfo ? "Close" : "Cancel"}
                </button>
                {!exitInfo && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Process Exit"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExitModal;
