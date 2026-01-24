import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ExitModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    vrm: "",
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
    console.log("Exit Data:", formData);
    // TODO: Add API call here to process exit
    // Example: axios.post('/api/movements/exit', { vrm: formData.vrm })
    alert(`Vehicle ${formData.vrm} exit processed!`);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ vrm: "" });
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
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Process Exit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExitModal;
