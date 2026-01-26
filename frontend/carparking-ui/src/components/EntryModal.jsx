import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { operationService } from "../services/operationService";

function EntryModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vrm: "",
    zone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const response = await operationService.entry(formData);
      alert(
        response.message ||
          `Vehicle ${formData.vrm} entry recorded successfully!`,
      );
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err || "Failed to record vehicle entry");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ vrm: "", zone: "" });
    setError("");
    setLoading(false);
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
            <h5 className="modal-title">🚪 Record Vehicle Entry</h5>
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
              </div>
              <div className="mb-3">
                <label htmlFor="zone" className="form-label">
                  Parking Zone
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  placeholder="e.g., A, B"
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Recording..." : "Record Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EntryModal;
