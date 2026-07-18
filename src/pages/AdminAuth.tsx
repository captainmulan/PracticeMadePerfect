import { useState, useEffect } from "react";
import Admin from "./Admin";
import "./Admin.css";

const ADMIN_PASSWORD = "admin123";
const AUTH_KEY = "admin_authenticated";

export default function AdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY);
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-container">
        <div className="admin-auth-box">
          <h2>Admin Access</h2>
          <p>Please enter the admin password to continue.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="admin-password-input"
            />
            {error && <p className="admin-auth-error">{error}</p>}
            <button type="submit" className="admin-auth-button">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Admin onLogout={handleLogout} />
  );
}
