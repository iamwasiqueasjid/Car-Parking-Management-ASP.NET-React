import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: "Owner", // Default to Owner
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role: role,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register Data:", formData);
    // TODO: Add API call here
    // For now, just navigate to dashboard based on role
    alert(`Account created for ${formData.email}`);
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>CREATE ACCOUNT</h1>
            <p className="auth-subtitle">Register for car parking management</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 4H17C17.55 4 18 4.45 18 5V15C18 15.55 17.55 16 17 16H3C2.45 16 2 15.55 2 15V5C2 4.45 2.45 4 3 4Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M18 5L10 11L2 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 10C12.21 10 14 8.21 14 6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6C6 8.21 7.79 10 10 10ZM10 12C7.33 12 2 13.34 2 16V18H18V16C18 13.34 12.67 12 10 12Z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 7H14V5C14 2.79 12.21 1 10 1C7.79 1 6 2.79 6 5V7H5C3.9 7 3 7.9 3 9V17C3 18.1 3.9 19 5 19H15C16.1 19 17 18.1 17 17V9C17 7.9 16.1 7 15 7ZM10 14C8.9 14 8 13.1 8 12C8 10.9 8.9 10 10 10C11.1 10 12 10.9 12 12C12 13.1 11.1 14 10 14ZM11.1 7H8.9V5C8.9 3.84 9.84 2.9 11 2.9C12.16 2.9 13.1 3.84 13.1 5V7H11.1Z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPassword ? (
                      <path
                        d="M10 4C5.5 4 2 10 2 10s3.5 6 8 6 8-6 8-6-3.5-6-8-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6.5c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5z"
                        fill="currentColor"
                      />
                    ) : (
                      <path
                        d="M10 7c2.8 0 5 2.2 5 5 0 .7-.1 1.3-.4 1.9l2.9 2.9c1.5-1.3 2.7-3 3.4-4.8-1.6-4-5.3-7-9.9-7-1.3 0-2.5.2-3.6.6l2.1 2.1c.5-.2 1-.3 1.5-.3zm-8-2.7l2.3 2.3.5.5C3.2 8.4 2 10.1 1.1 12c1.6 4 5.3 7 9.9 7 1.4 0 2.7-.3 3.9-.7l.4.4 3 3 1.3-1.3L3.3 2.7 2 4zm5.5 5.5l1.5 1.5c0-.1 0-.3 0-.5 0-1.1.9-2 2-2 .2 0 .3 0 .5 0l1.5 1.5c-.4-.9-1.3-1.5-2.3-1.5-1.4 0-2.5 1.1-2.5 2.5 0 1 .6 1.9 1.5 2.3z"
                        fill="currentColor"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Phone No</label>
              <div className="input-with-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.5 18C14.3 18 12.1 17.3 10.2 16.1C8.3 14.8 6.7 13.2 5.4 11.3C4.1 9.4 3.4 7.2 3.4 5C3.4 4.7 3.5 4.5 3.7 4.3C3.9 4.1 4.1 4 4.4 4H7.4C7.6 4 7.8 4.1 8 4.2C8.1 4.3 8.2 4.5 8.3 4.7L9 7.3C9 7.5 9 7.7 9 7.8C9 8 8.9 8.1 8.8 8.2L7 9.9C7.5 10.7 8.1 11.4 8.8 12.1C9.5 12.8 10.2 13.4 11 13.9L12.7 12.2C12.8 12.1 13 12 13.2 12C13.3 12 13.5 12 13.7 12.1L16.2 12.8C16.4 12.9 16.6 13 16.7 13.2C16.8 13.4 16.9 13.6 16.9 13.8V16.8C16.9 17.1 16.8 17.3 16.6 17.5C16.4 17.7 16.2 17.8 15.9 17.8C15.8 18 15.7 18 15.5 18Z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-btn ${formData.role === "Owner" ? "active" : ""}`}
                  onClick={() => handleRoleSelect("Owner")}
                >
                  Owner
                </button>
                <button
                  type="button"
                  className={`role-btn ${formData.role === "Customer" ? "active" : ""}`}
                  onClick={() => handleRoleSelect("Customer")}
                >
                  Customer
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Create Account
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <div className="auth-footer">
            <p>
              By registering you agree with{" "}
              <a href="#" className="auth-link">
                Terms and Conditions
              </a>
            </p>
            <p className="auth-switch">
              Already have an account?{" "}
              <a
                href="#"
                onClick={() => navigate("/login")}
                className="auth-link"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <img src="/auth image.jpg" alt="Car Parking" className="auth-image" />
      </div>
    </div>
  );
}

export default Register;
