import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Navigate based on user role (0 = Customer, 1 = Owner)
      if (response.user.role === 1) {
        navigate("/dashboard"); // Owner dashboard
      } else {
        navigate("/customer-dashboard"); // Customer dashboard
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid auth-container">
      <div className="row min-vh-100">
        {/* Left Side - Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center auth-left">
          <div
            className="auth-form-wrapper w-100"
            style={{ maxWidth: "480px" }}
          >
            <div className="mb-5">
              <h1 className="fw-bold mb-2 text-white">SIGN IN</h1>
              <p className="text-muted mb-0">Sign in with email address</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="mb-4">
                <label className="form-label text-light fw-medium">
                  Email Address
                </label>
                <div className="input-with-icon position-relative">
                  <img
                    src="/SVG/Shared/Email.svg"
                    alt="Email"
                    width="20"
                    height="20"
                    className="input-icon"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control form-control-lg custom-input ps-5"
                    placeholder="yourname@gmail.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="form-label text-light fw-medium">
                  Password
                </label>
                <div className="input-with-icon position-relative">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="input-icon"
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
                    className="form-control form-control-lg custom-input ps-5 pe-5"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-link password-toggle position-absolute end-0 top-50 translate-middle-y"
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

              {/* Remember Me & Forgot Password */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="form-check-input custom-checkbox"
                    id="rememberMe"
                  />
                  <label
                    className="form-check-label text-light"
                    htmlFor="rememberMe"
                  >
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-decoration-none forgot-link">
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-lg w-100 mb-4 gradient-btn"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="position-relative text-center my-4">
              <hr className="text-secondary" />
              <span className="position-absolute top-50 start-50 translate-middle bg-dark px-3 text-muted small">
                Or continue with
              </span>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-muted small mb-3">
                By signing in you agree with{" "}
                <a href="#" className="text-decoration-none auth-link">
                  Terms and Conditions
                </a>
              </p>
              <p className="text-muted small mb-0">
                New to Car Parking?{" "}
                <a
                  href="#"
                  onClick={() => navigate("/register")}
                  className="text-decoration-none auth-link"
                >
                  Create an account
                </a>{" "}
                and start your journey today
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="col-lg-6 d-none d-lg-block p-0 auth-right">
          <img
            src="/auth image.jpg"
            alt="Car Parking"
            className="w-100 h-100 object-fit-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
