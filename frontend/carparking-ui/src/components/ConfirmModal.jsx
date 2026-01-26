import { useEffect } from "react";
import "../App.css";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return "#dc3545";
      case "success":
        return "#28a745";
      case "info":
        return "#17a2b8";
      default:
        return "#ffc107";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "danger":
        return (
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        );
      case "success":
        return (
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
      case "info":
        return (
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="text-center mb-4">
            <div style={{ color: getIconColor() }}>{getIcon()}</div>
            <h3 className="mt-3 mb-2">{title}</h3>
            <p className="text-muted">{message}</p>
          </div>

          <div className="modal-footer d-flex gap-2 justify-content-end">
            {cancelText && (
              <button className="btn btn-secondary" onClick={onClose}>
                {cancelText}
              </button>
            )}
            <button
              className={`btn btn-${type === "danger" ? "danger" : type === "success" ? "success" : "primary"}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
