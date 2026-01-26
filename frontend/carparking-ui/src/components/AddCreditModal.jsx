import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { customerService } from "../services/customerService";
import ConfirmModal from "./ConfirmModal";

function AddCreditModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: "",
    bankAccountNumber: "",
    cardNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      const response = await customerService.addCredit(
        parseFloat(formData.amount),
        formData.bankAccountNumber,
        formData.cardNumber,
      );
      setSuccessMessage(
        response.message ||
          `Successfully added $${formData.amount} to your account!`,
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err || "Failed to add credit");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ amount: "", bankAccountNumber: "", cardNumber: "" });
    setError("");
    setLoading(false);
    setSuccessMessage("");
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
            <h5 className="modal-title">💳 Add Credits to Account</h5>
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
                <label htmlFor="amount" className="form-label">
                  Amount ($) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="10000"
                  className="form-control"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g., 100.00"
                  required
                />
                <div className="form-text">
                  Enter amount between $1 and $10,000
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="bankAccountNumber" className="form-label">
                  Bank Account Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890"
                  required
                />
                <div className="form-text">
                  This is a simulation - any number will work
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="cardNumber" className="form-label">
                  Card Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="e.g., 4111111111111111"
                  required
                />
                <div className="form-text">
                  This is a simulation - any number will work
                </div>
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
                  {loading ? "Processing..." : "Add Credit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!successMessage}
        onClose={() => {
          setSuccessMessage("");
          handleClose();
        }}
        onConfirm={() => {
          setSuccessMessage("");
          handleClose();
        }}
        title="Success"
        message={successMessage}
        confirmText="OK"
        cancelText=""
        type="success"
      />
    </div>
  );
}

export default AddCreditModal;
