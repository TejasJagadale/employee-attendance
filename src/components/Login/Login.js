import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Lottie from "lottie-react";
import loaderAnimation from "../../animations/plane.json";
import { toast } from "react-toastify";
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
  const [credentials, setCredentials] = useState({
    employeeId: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [animationData, setAnimationData] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetch("https://assets10.lottiefiles.com/packages/lf20_yr6zz3wv.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  if (!animationData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!credentials.employeeId || !credentials.password) {
      setError("Both Employee ID and Password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    console.log(credentials.employeeId, credentials.password);

    try {
      console.log(
        `https://dontsign.mpeoplesnet.com/api/login?${credentials.employeeId}&${credentials.password}`
      );

      const response = await fetch(
        `https://dontsign.mpeoplesnet.com/api/login?email=${credentials.employeeId}&password=${credentials.password}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials)
        }
      );

      console.log(response);

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log(data);

      if (data.data.role[0] === "Admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

      // Store the response data in localStorage
      localStorage.setItem("authData", JSON.stringify(data));
      localStorage.setItem("isAuthenticated", "true");
      toast.success("Login successful!");
      // Navigate to dashboard
    } catch (err) {
      // setError(err.message || 'Invalid credentials. Please try again.');
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center vh-100 text-dark lopages">
      <div className="container rounded-4 overflow-hidden login-wrapper">
        <div className="login-blur-container">
          {/* Left - Form */}
          <div className="col-md-6 p-1 login-form-area animate__animated animate__fadeInLeft text-secondary">
            <div className="text-center mb-4">
              <img
                src="/logo.jpg"
                alt="Company Logo"
                className="logo-img mb-2"
              />
              <h2 className="fw-bold text-dark fs-4">
                MPeoples Business Solution
              </h2>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label
                  htmlFor="employeeId"
                  className="form-label text-dark mb-3 fw-bold"
                >
                  Employee ID
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg custom-input"
                  id="employeeId"
                  name="employeeId"
                  placeholder="Enter your ID"
                  value={credentials.employeeId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4 text-secondary">
                <label
                  htmlFor="password"
                  className="form-label text-dark mb-3 fw-bold"
                >
                  Password
                </label>
                <div className="input-group text-dark">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg custom-input"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-40 btn-lg fw-bold mt-3"
                disabled={isLoading}
                style={{ backgroundColor: "#3f37c9", color: "white" }}
              >
                {isLoading ? "Logging in..." : "Login"}&nbsp;<LoginIcon />
              </button>
            </form>
          </div>

          {isLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
              style={{ zIndex: 1050 }}
            >
              <Lottie
                animationData={loaderAnimation}
                loop
                autoplay
                style={{ width: 400, height: 400 }}
              />
            </div>
          )}

          {/* Right - Animation */}
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-animation animate__animated animate__fadeInRight">
            <Lottie
              animationData={animationData}
              loop
              autoplay
              style={{ width: 500, height: 500 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
