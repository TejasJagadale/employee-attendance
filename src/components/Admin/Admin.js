import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Admin/Admin.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Skeleton } from "@mui/material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Admin = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userImages, setUserImages] = useState([]);
  const [employeeData, setEmployeeData] = useState({
    name: "",
    profileimg: "",
    role: "",
    userId: ""
  });
  const navigate = useNavigate();
  const formatDayName = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
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
  const getWeekDates = (date) => {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();
    const startDate = new Date(currentDate);
    startDate.setDate(
      currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    ); // Adjust to Monday as first day

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };
  const getWeekRange = (date) => {
    const weekDates = getWeekDates(date);
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()} ${start.toLocaleDateString("en-US", {
      month: "short"
    })} - 
            ${end.getDate()} ${end.toLocaleDateString("en-US", {
      month: "short"
    })}`;
  };
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authData");
    navigate("/");
  };
  const fetchReportData = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://dontsign.mpeoplesnet.com/api/report-for-date?date=${date}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const data = await response.json();
      console.log(data);

      // Filter the data to only include records matching the selected date
      const filteredData = {
        ...data.data,
        presentUsers: data.data.presentUsers
          .map((user) => ({
            ...user,
            attendances: user.attendances.filter(
              (att) => att.attendance_date === date
            )
          }))
          .filter((user) => user.attendances.length > 0),
        absentUsers: data.data.absentUsers // absent users typically don't have attendance records
      };
      console.log(filteredData);

      setReportData(filteredData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchImage = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://dontsign.mpeoplesnet.com/api/list-user`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const data = await response.json();
      console.log(data.data.userList);

      setUserImages(data.data.userList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, []);

  useEffect(() => {
    // Fetch data whenever selectedDate changes
    fetchReportData(selectedDate);
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="totaladmin">
        {/* Navbar Skeleton */}
        <div className="navbarr" style={{ padding: "10px 20px" }}>
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="circular" width={30} height={30} />
        </div>

        {/* Profile Section Skeleton */}
        <div className="firstboxadmin" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Skeleton variant="circular" width={80} height={80} />
              <div style={{ marginLeft: "16px" }}>
                <Skeleton variant="text" width={200} height={30} />
                <Skeleton variant="text" width={150} height={20} />
              </div>
            </div>
            <Skeleton variant="rectangular" width={200} height={40} />
          </div>

          {/* Stats Skeleton */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px"
            }}
          >
            <Skeleton variant="rectangular" width={200} height={100} />
            <Skeleton variant="rectangular" width={200} height={100} />
            <Skeleton variant="rectangular" width={200} height={100} />
          </div>
        </div>

        {/* Week View Skeleton */}
        <div style={{ padding: "20px" }}>
          <Skeleton variant="text" width="30%" height={30} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px"
            }}
          >
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={200} height={80} />
            ))}
          </div>
        </div>

        {/* Report Sections Skeleton */}
        <div style={{ padding: "20px" }}>
          <Skeleton variant="text" width={200} height={30} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px"
            }}
          >
            <Skeleton variant="rectangular" width={600} height={300} />
            <Skeleton variant="rectangular" width={600} height={300} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!reportData) {
    return <div className="no-data">No report data available</div>;
  }

  const totalPresent = reportData.presentUsers.length;
  const totalAbsent = reportData.absentUsers.length;
  const totalUsers = totalPresent + totalAbsent;

  const pieChartData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [totalPresent, totalAbsent],
        backgroundColor: ["#4CAF50", "#F44336"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 1
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  return (
    <div className="totaladmin">
      <Sidebar />
      <div className="main-content1">
        <div className="firstboxadmin">
          <div className="employee-headeradmin">
            <div className="employee-profileadmin">
              <img
                src={employeeData.profileimg}
                alt="Profile"
                className="employee-imageadmin"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                }}
              />
              <div className="employee-infoadmin">
                <h1>{employeeData.name}</h1>
                <p className="employee-roleadmin">{employeeData.role}</p>
              </div>
            </div>
            <div className="date-picker-containeradmin">
              <div>
                <label htmlFor="attendance-dateadmin">Select Date: </label>
                <input
                  type="date"
                  id="attendance-dateadmin"
                  value={selectedDate}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>
          <div className="employee-headeradmin1">
            <div className="emphead2">
              <div className="stats-containeradmin">
                <div className="stat-cardadmin">
                  <h4>Total Employees</h4>
                  <p className="stat-valueadmin">{totalUsers}</p>
                </div>
                <div className="stat-cardadmin presentadmin">
                  <h4>Present Today</h4>
                  <p className="stat-valueadmin">{totalPresent}</p>
                </div>
                <div className="stat-cardadmin absentadmin">
                  <h4>Absent Today</h4>
                  <p className="stat-valueadmin">{totalAbsent}</p>
                </div>
              </div>

              <div
                className="chart-containeradmin"
                style={{ width: "150px", height: "140px" }}
              >
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-containeradmin">
          <div className="week-view-containeradmin">
            <h3>Week of {getWeekRange(selectedDate)}</h3>
            <div className="week-daysadmin">
              {getWeekDates(selectedDate).map((date, index) => {
                const isActive = isSameDay(date, selectedDate);
                const isPast =
                  date < new Date() && !isSameDay(date, new Date());
                return (
                  <div
                    key={index}
                    className={`day-boxadmin ${isActive ? "active" : ""} ${
                      isPast ? "past-dateadmin" : ""
                    }`}
                    onClick={() =>
                      handleDateChange({
                        target: { value: formatDateForInput(date) }
                      })
                    }
                  >
                    <div className="day-nameadmin">{formatDayName(date)}</div>
                    <div className="day-dateadmin">{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="total1admin">
          <div className="report-sectionadmin">
            <h3>Employees Daily Report</h3>
            <div className="users-containeradmin">
              <div className="users-sectionadmin">
                <h4>Present Employees ({totalPresent})</h4>
                <div className="users-listadmin">
                  {reportData.presentUsers.map((user) => {
                    // Find the user in the image data
                    const userWithImage = userImages.find(
                      (imgUser) => imgUser.id === user.id
                    );

                    return (
                      <div key={user.id} className="user-card presentadmin">
                        {/* Add the image at the top of the user card */}
                        <div className="user-card1">
                          {userWithImage?.profile_img && (
                            <div className="user-imageadmin">
                              <img
                                src={userWithImage.profile_img}
                                alt={user.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "path/to/default/image.jpg";
                                }}
                              />
                            </div>
                          )}
                          <div className="user-infoadmin">
                            <span className="user-nameadmin">{user.name}</span>
                            <span className="user-idadmin">{user.empid}</span>
                          </div>
                        </div>
                        {user.attendances.length > 0 && (
                          <div className="attendance-infoadmin">
                            <span>
                              Check-in: {user.attendances[0].check_in}
                            </span>
                            <span>
                              Check-out:{" "}
                              {user.attendances[0].check_out ||
                                "Not checked out"}
                            </span>
                            <span>
                              Worked:{" "}
                              {user.attendances[0].worked_hours || "N/A"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="users-sectionadmin">
                <h4>Absent Employees ({totalAbsent})</h4>
                <div className="users-listadmin">
                  {reportData.absentUsers.map((user) => (
                    <div key={user.id} className="user-card absentadmin">
                      <div className="user-infoadmin">
                        <span className="user-nameadmin">{user.name}</span>
                        <span className="user-idadmin">{user.empid}</span>
                      </div>
                      <div className="attendance-infoadmin">
                        <span>No attendance recorded</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
