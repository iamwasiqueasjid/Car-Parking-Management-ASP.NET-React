import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ParkingRateModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    hourlyRate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Parking Rate Data:", formData);
    // TODO: Add API call here to add parking rate
    // Example: axios.post('/api/parkingrates', { hourlyRate: parseFloat(formData.hourlyRate) })
    alert(`Parking rate of $${formData.hourlyRate}/hour added successfully!`);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ hourlyRate: "" });
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
            <h5 className="modal-title">💰 Add New Parking Rate</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="hourlyRate" className="form-label">
                  Hourly Rate ($) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="e.g., 3.00"
                  required
                />
                <div className="form-text">
                  Enter the hourly parking rate in dollars
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParkingRateModal;
