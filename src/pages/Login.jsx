import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import psebLogo from "../assets/pseb-logo.svg";
import techDestinationLogo from "../assets/techdestination-logo-corrected.svg";
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Login failed"
        );

        return;
      }

      if (
        !data.token ||
        !data.user
      ) {
        setError(
          "Invalid login response from server"
        );

        return;
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user
        )
      );

      if (
        data.user.role ===
        "Administrator"
      ) {
        navigate(
          "/admin-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      if (
        data.user.role ===
        "Operator"
      ) {
        navigate(
          "/operator-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      if (
        data.user.role ===
        "Viewer"
      ) {
        navigate(
          "/viewer-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      setError(
        "User role not recognized"
      );
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-top-logos">
      
     <img
  src={techDestinationLogo}
  alt="TechDestination"
  className="techdestination-logo"
/>
          

        <img
  src={psebLogo}
  alt="Pakistan Software Export Board"
  className="pseb-logo"
/>
        </div>

        <h1 className="login-title">
          Welcome Back
        </h1>

        <div className="login-underline"></div>

        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label>
              USERNAME / EMAIL
            </label>

            <input
              type="email"
              placeholder="Enter assigned email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label>
              PASSWORD
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "SIGNING IN..."
              : "SIGN IN"}
          </button>
        </form>

        <div className="login-footer-text">
          Pakistan Software Export Board
        </div>

      
      </div>
    </div>
  );
}

export default Login;