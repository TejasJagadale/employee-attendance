import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

const Navbar = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authData");
    navigate("/");
  };
  return (
    <div className="navbarr">
      <div className="navbar-leftadmin">
        <img
          src="/logomp.png"
          alt="Company Logo"
          className="company-logoadmin"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "";
          }}
        />
      </div>
      <div>
        {!sidebarOpen ? (
          <button
            className="sidebar-toggleadmin "
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        ) : (
          <button
            className="sidebar-toggleadmin"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ✕
          </button>
        )}
      </div>
      <div
        className="logoutbtn"
        onClick={handleLogout}
        style={{ color: "black" }}
      >
        <PowerSettingsNewIcon />
      </div>
    </div>
  );
};

export default Navbar;
