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
                <img
                  src="/SVG/Shared/Email.svg"
                  alt="Email"
                  width="20"
                  height="20"
                />
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
                  <img
                    src={
                      showPassword
                        ? "/SVG/Shared/show.svg"
                        : "/SVG/Shared/hide.svg"
                    }
                    alt={showPassword ? "Hide password" : "Show password"}
                    width="20"
                    height="20"
                  />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Phone No</label>
              <div className="input-with-icon">
                <img
                  src="/SVG/signup/Phone.svg"
                  alt="Phone"
                  width="20"
                  height="20"
                />
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
