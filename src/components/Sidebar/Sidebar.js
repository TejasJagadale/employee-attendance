import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SettingsIcon from "@mui/icons-material/Settings";

const Sidebar = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    name: "",
    profileimg: "",
    role: "",
    userId: ""
  });
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authData");
    navigate("/");
  };
  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        console.log(parsedData);

        if (parsedData.data) {
          setEmployeeData({
            name: parsedData.data.name,
            profileimg: parsedData.data.profileimg,
            role: parsedData.data.role[0],
            userId: parsedData.data.user_id
          });
        }
      } catch (error) {
        console.error("Error parsing authData:", error);
      }
    }
  }, []);
  return (
    <>
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
        <div className="logoutbtn" onClick={handleLogout}>
          <PowerSettingsNewIcon />
        </div>
      </div>
      <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-content">
          <div className="duplicate">
            <div className="sidebar-header">
              {sidebarOpen ? (
                <>
                  <div>
                    <img
                      src={employeeData.profileimg}
                      alt="Profile"
                      className="employee-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "";
                      }}
                    />
                    <div className="sidebar-user-info">
                      <h3>{employeeData.name}</h3>
                      <p>{employeeData.role}</p>
                    </div>
                  </div>
                  <div>
                    <button
                      className="sidebar-toggle "
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      ✕
                    </button>
                  </div>
                </>
              ) : (
                <button
                  className="sidebar-toggle initialet"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {employeeData.name.charAt(0).toUpperCase()}
                </button>
              )}
            </div>
            <ul className="sidebar-menu">
              <li className="active">
                <span className="menu-icon">
                  <SpaceDashboardIcon />
                </span>
                {sidebarOpen && <span className="menu-text">Dashboard</span>}
              </li>
              <li>
                <span className="menu-icon">
                  <PeopleIcon />
                </span>
                {sidebarOpen && <span className="menu-text">Leave</span>}
              </li>
              <li>
                <span className="menu-icon">
                  <AssessmentIcon />
                </span>
                {sidebarOpen && <span className="menu-text">Permissions</span>}
              </li>
              <li>
                <span className="menu-icon">
                  <AccountBoxIcon />
                </span>
                {sidebarOpen && <span className="menu-text">Tasks</span>}
              </li>
              <li>
                <span className="menu-icon">
                  <SettingsIcon />
                </span>
                {sidebarOpen && <span className="menu-text">Settings</span>}
              </li>
            </ul>
          </div>
          <div className="navbar-right">
            {sidebarOpen ? (
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            ) : (
              <button onClick={handleLogout} className="logout-button-icon">
                <LogoutIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
