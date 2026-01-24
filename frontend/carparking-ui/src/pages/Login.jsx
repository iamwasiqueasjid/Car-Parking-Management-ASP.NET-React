import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", formData);
    // TODO: Add API call here
    // For now, just navigate to dashboard
    alert(`Welcome back, ${formData.email}!`);
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>SIGN IN</h1>
            <p className="auth-subtitle">Sign in with email address</p>
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
                  placeholder="Enter your password"
                  required
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

            <div className="form-extras">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign In
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <div className="auth-footer">
            <p>
              By signing in you agree with{" "}
              <a href="#" className="auth-link">
                Terms and Conditions
              </a>
            </p>
            <p className="auth-switch">
              New to Car Parking?{" "}
              <a
                href="#"
                onClick={() => navigate("/register")}
                className="auth-link"
              >
                Create an account
              </a>{" "}
              and start your journey today
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

export default Login;
