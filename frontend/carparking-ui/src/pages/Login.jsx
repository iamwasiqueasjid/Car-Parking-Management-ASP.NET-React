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
    setError("");
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
      if (response.role === 1) {
        navigate("/dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (err) {
      setError(typeof err === "string" ? err : "Invalid email or password");
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
                  <img
                    src="/SVG/Shared/password.svg"
                    alt="Email"
                    width="20"
                    height="20"
                    className="input-icon"
                  />
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
