import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
// import * as XLSX from "xlsx";
// const OFFICE_LOCATION = {
//   latitude: 11.6735742,
//   longitude: 78.1330915,
//   allowedRadius: 20
// };
const Dashboard = () => {
  const navigate = useNavigate();
  const [monthlyReportData, setMonthlyReportData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [checkInLocation, setCheckInLocation] = useState("");
  const [checkOutLocation, setCheckOutLocation] = useState("");
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [workingHours, setWorkingHours] = useState(0);
  const [remainingHours, setRemainingHours] = useState(9);
  const [isWorking, setIsWorking] = useState(false);
  const [timer, setTimer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    name: "",
    profileimg: "",
    role: "",
    userId: ""
  });
  const [locationError, setLocationError] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7) // Default to current month (YYYY-MM)
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authData = localStorage.getItem("authData");
        const parsedData = JSON.parse(authData);
        const userid = parsedData.data.user_id;
        const today = new Date().toISOString().split("T")[0];
        const queryParams = new URLSearchParams({
          date: today,
          user_id: userid
        }).toString();

        const response = await fetch(
          `https://dontsign.mpeoplesnet.com/api/attendance-report-for-user-day?${queryParams}`
        );

        const result = await response.json();
        console.log(result);

        if (result.success && result.data.userinfo.length > 0) {
          const user = result.data.userinfo[0];
          const combinedData = user.attendances.map((attendance) => ({
            name: user.name,
            empid: user.empid,
            mobile: user.mobile,
            date: attendance.attendance_date,
            checkIn: attendance.check_in,
            checkOut: attendance.check_out,
            workedHours: attendance.worked_hours
          }));

          setMonthlyReportData(combinedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const generateMonthlyReport = async () => {
    try {
      const authData = localStorage.getItem("authData");
      const parsedData = JSON.parse(authData);
      const userid = parsedData.data.user_id;
      const today = new Date().toISOString().split("T")[0];
      const queryParams = new URLSearchParams({
        date: today,
        user_id: userid
      }).toString();
      // 1. Fetch attendance data for the selected month from your API
      const response = await fetch(
        `https://dontsign.mpeoplesnet.com/api/attendance-report-for-user-day?${queryParams}`
      );
      const result = await response.json();
      console.log(result);

      if (result.success && result.data.userinfo.length > 0) {
        const user = result.data.userinfo[0];
        const combinedData = user.attendances.map((attendance) => ({
          name: user.name,
          empid: user.empid,
          mobile: user.mobile,
          date: attendance.attendance_date,
          checkIn: attendance.check_in,
          checkOut: attendance.check_out,
          workedHours: attendance.worked_hours
        }));

        setMonthlyReportData(combinedData);
      }

      if (!result.success || !result.data.userinfo) {
        throw new Error(result.message || "Failed to fetch data");
      }

      // Flatten the data for CSV
      const flatData = flattenAttendanceData(result.data.userinfo);
      const csvContent = convertToCSV(flatData);

      // Download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `attendance_report_${reportMonth}.csv`);
    } catch (error) {
      console.error("Error generating report:", error);
      // Show error to user
      alert(`Error generating report: ${error.message}`);
    }
  };

  // const generateExcelReport = async () => {
  //   try {
  //     const authData = localStorage.getItem("authData");
  //     const parsedData = JSON.parse(authData);
  //     const userid = parsedData.data.user_id;
  //     const today = new Date().toISOString().split("T")[0];
  //     const queryParams = new URLSearchParams({
  //       date: today,
  //       user_id: userid
  //     }).toString();
  //     // 1. Fetch attendance data
  //     const response = await fetch(
  //       `https://dontsign.mpeoplesnet.com/api/attendance-report-for-user-day?${queryParams}`
  //     );
  //     const result = await response.json();

  //     if (!result.success || !result.data.userinfo) {
  //       throw new Error(result.message || "Failed to fetch data");
  //     }

  //     // Flatten the data for Excel
  //     const flatData = flattenAttendanceData(result.data.userinfo);

  //     // Create worksheet
  //     const ws = XLSX.utils.json_to_sheet(flatData);
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  //     // Download the file
  //     XLSX.writeFile(wb, `attendance_report_${reportMonth}.xlsx`);
  //   } catch (error) {
  //     console.error("Error generating Excel report:", error);
  //     alert(`Error generating Excel report: ${error.message}`);
  //   }
  // };

  // Helper function to flatten the nested structure
  const flattenAttendanceData = (userInfoArray) => {
    return userInfoArray.flatMap((user) => {
      return user.attendances.map((attendance) => ({
        "Employee ID": user.empid,
        "Employee Name": user.name,
        Mobile: user.mobile,
        Date: attendance.attendance_date,
        "Check-In Time": attendance.check_in || "N/A",
        "Check-Out Time": attendance.check_out || "N/A",
        "Worked Hours": attendance.worked_hours || "N/A",
        "Overtime Hours": attendance.overtimed_hours || "N/A",
        "Check-In Location": `${attendance.lat}, ${attendance.lon}`,
        "Check-Out Location": attendance.checkout_lat
          ? `${attendance.checkout_lat}, ${attendance.checkout_lon}`
          : "N/A",
        Status: attendance.type,
        "Late Check-In": attendance.late_checkin === "yes" ? "Yes" : "No",
        "Auto Check-Out": attendance.auto_checkout === "yes" ? "Yes" : "No"
      }));
    });
  };

  // Helper function to convert data to CSV
  const convertToCSV = (arr) => {
    if (!arr || arr.length === 0) return "";

    const headers = Object.keys(arr[0]).join(",");
    const rows = arr.map((obj) =>
      Object.values(obj)
        .map(
          (value) =>
            `"${value !== null ? value.toString().replace(/"/g, '""') : ""}"`
        )
        .join(",")
    );

    return [headers, ...rows].join("\n");
  };
  const TOTAL_WORK_HOURS = 9;
  const reverseGeocode = async (lat, lon) => {
    const apiKey = "pk.a02fb33a5b85e9dbe4c4a15dab83f4ea";
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lon}&format=json&accept-language=en`
    );
    const data = await response.json();
    return data.display_name || "Address not found";
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
  useEffect(() => {
    const sendData = async () => {
      try {
        const authData = localStorage.getItem("authData");
        const parsedData = JSON.parse(authData);
        const userid = parsedData.data.user_id;
        const today = new Date().toISOString().split("T")[0];
        const queryParams = new URLSearchParams({
          date: today,
          user_id: userid
        }).toString();

        const response = await fetch(
          `https://dontsign.mpeoplesnet.com/api/attendance-report-for-user-day?${queryParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`
            }
          }
        );

        const result = await response.json();
        console.log(result);

        const attendances = result?.data?.userinfo?.[0]?.attendances || [];
        const todayAtt = attendances.find(
          (entry) => entry.attendance_date === today
        );

        setTodayAttendance(todayAtt);

        if (todayAtt) {
          const { check_in, check_out, lat, lon, checkout_lat, checkout_lon } =
            todayAtt;

          // Convert time strings to Date objects for formatting
          const checkInDate = check_in
            ? new Date(`${today}T${check_in}`)
            : null;
          const checkOutDate = check_out
            ? new Date(`${today}T${check_out}`)
            : null;

          setCheckInTime(checkInDate);
          setCheckOutTime(checkOutDate);

          // Get location addresses
          if (lat && lon) {
            const inLocation = await reverseGeocode(lat, lon);
            setCheckInLocation(inLocation);
          }

          if (checkout_lat && checkout_lon) {
            const outLocation = await reverseGeocode(
              checkout_lat,
              checkout_lon
            );
            setCheckOutLocation(outLocation);
          }
        } else {
          setCheckInTime(null);
          setCheckOutTime(null);
          setCheckInLocation("");
          setCheckOutLocation("");
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };
    sendData();
  }, []);
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);
  const fetchAttendanceData = async (date) => {
    try {
      const authData = localStorage.getItem("authData");
      const parsedData = JSON.parse(authData);
      const userid = parsedData.data.user_id;

      const queryParams = new URLSearchParams({
        date: date,
        user_id: userid
      }).toString();

      const response = await fetch(
        `https://dontsign.mpeoplesnet.com/api/attendance-report-for-user-day?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          }
        }
      );

      const result = await response.json();
      const attendances = result?.data?.userinfo?.[0]?.attendances || [];
      const selectedDateAttendance = attendances.find(
        (entry) => entry.attendance_date === date
      );

      if (selectedDateAttendance) {
        const { check_in, check_out } = selectedDateAttendance;
        // Convert time strings to Date objects for formatting
        const checkInDate = check_in ? new Date(`${date}T${check_in}`) : null;
        console.log(checkInDate);

        const checkOutDate = check_out
          ? new Date(`${date}T${check_out}`)
          : null;
        console.log(checkOutDate);

        setCheckInTime(checkInDate);
        setCheckOutTime(checkOutDate);

        // Calculate working hours if both check-in and check-out exist
        if (checkInDate && checkOutDate) {
          const hoursWorked = (checkOutDate - checkInDate) / (1000 * 60 * 60);
          const worked = Math.min(hoursWorked, TOTAL_WORK_HOURS);
          const remaining = Math.max(TOTAL_WORK_HOURS - worked, 0);
          setWorkingHours(worked);
          setRemainingHours(remaining);
        } else if (checkInDate) {
          // If only check-in exists, start timer
          setIsWorking(true);
          startTimer(checkInDate);
        } else {
          setWorkingHours(0);
          setRemainingHours(TOTAL_WORK_HOURS);
        }
      } else {
        setCheckInTime(null);
        setCheckOutTime(null);
        setWorkingHours(0);
        setRemainingHours(TOTAL_WORK_HOURS);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  // const calculateDistance = (lat1, lon1, lat2, lon2) => {
  //   const R = 6371e3; // Earth radius in meters
  //   const loc1 = (lat1 * Math.PI) / 180;
  //   const loc2 = (lat2 * Math.PI) / 180;
  //   const loc3 = ((lat2 - lat1) * Math.PI) / 180;
  //   const loc4 = ((lon2 - lon1) * Math.PI) / 180;
  //   const a =
  //     Math.sin(loc3 / 2) * Math.sin(loc3 / 2) +
  //     Math.cos(loc1) * Math.cos(loc2) * Math.sin(loc4 / 2) * Math.sin(loc4 / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   return R * c;
  // };
  // const verifyLocation = () => {
  //   return new Promise((resolve, reject) => {
  //     if (!navigator.geolocation) {
  //       reject(new Error("Geolocation is not supported by your browser"));
  //       return;
  //     }
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const distance = calculateDistance(
  //           position.coords.latitude,
  //           position.coords.longitude,
  //           OFFICE_LOCATION.latitude,
  //           OFFICE_LOCATION.longitude
  //         );
  //         if (distance <= OFFICE_LOCATION.allowedRadius) {
  //           resolve(position);
  //         } else {
  //           reject(
  //             new Error(
  //               `You must be within ${
  //                 OFFICE_LOCATION.allowedRadius
  //               }m of the office to check in. Current distance: ${Math.round(
  //                 distance
  //               )}m`
  //             )
  //           );
  //         }
  //       },
  //       (error) => {
  //         reject(new Error("Unable to retrieve your location"));
  //       },
  //       { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  //     );
  //   });
  // };
  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    setLocationError("");
    try {
      // First get the current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      // await verifyLocation();
      const now = new Date();
      const today = new Date().toISOString().split("T")[0];
      const checkInTime = now.toTimeString().split(" ")[0]; // Get HH:MM:SS
      const payload = {
        user_id: employeeData.userId,
        company_id: 1,
        branch_id: 1,
        check_in: checkInTime,
        lat: position.coords.latitude.toString(),
        lon: position.coords.longitude.toString(),
        attendance_date: today
      };
      console.log(payload);
      const response = await fetch(
        "https://dontsign.mpeoplesnet.com/api/add-checkin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}` // If using token auth
          },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.ok) {
        setCheckInTime(now);
        setCheckOutTime(null);
        setIsWorking(true);
        localStorage.setItem("checkInTime", now.toString());
        startTimer(now);
      } else {
        toast.error("Error");
      }
      console.log(data);
      toast.success("Checked-in Successfully");
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setIsCheckingIn(false);
    }
  };
  const updateWorkHours = (startTime) => {
    const hoursWorked = (new Date() - startTime) / (1000 * 60 * 60);
    const worked = Math.min(hoursWorked, TOTAL_WORK_HOURS);
    const remaining = Math.max(TOTAL_WORK_HOURS - worked, 0);
    setWorkingHours(worked);
    setRemainingHours(remaining);
  };
  const startTimer = (startTime) => {
    if (timer) clearInterval(timer);
    updateWorkHours(startTime);
    const newTimer = setInterval(() => {
      updateWorkHours(startTime);
    }, 60000);
    setTimer(newTimer);
  };
  const handleCheckOut = async () => {
    // Added async here
    const now = new Date();
    setCheckOutTime(now);
    setIsWorking(false);
    localStorage.removeItem("checkInTime");
    if (timer) clearInterval(timer);

    updateWorkHours(checkInTime);
    try {
      // First get the current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // await verifyLocation();
      const today = new Date().toISOString().split("T")[0];
      const checkOutTime = now.toTimeString().split(" ")[0]; // Get HH:MM:SS
      const payload = {
        user_id: employeeData.userId,
        company_id: 1,
        branch_id: 1,
        check_out: checkOutTime, // Changed from check_in to check_out
        checkout_lat: position.coords.latitude.toString(),
        checkout_lon: position.coords.longitude.toString(),
        attendance_date: today,
        type: "present",
        worked_hours: workingHours
      };
      console.log(payload);
      const response = await fetch(
        "https://dontsign.mpeoplesnet.com/api/add-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      console.log(data);
      toast.success("Checked-out Successfully");
    } catch (error) {
      setLocationError(error.message);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authData");
    navigate("/");
  };
  const formatTime = (date) => {
    return date ? date.toLocaleTimeString() : "--:--:--";
  };
  const formatHours = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours % 1) * 60);
    return `${wholeHours}h ${minutes}m`;
  };
  const progressPercentage = Math.min(
    (workingHours / TOTAL_WORK_HOURS) * 100,
    100
  );
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

  const formatDayName = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
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

  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
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
  return (
    <div className="total">
      {/* Navbar */}
      <div className="navbarr">
        <div className="navbar-left">
          <img
            src="/logomp.png"
            alt="Company Logo"
            className="company-logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "";
            }}
          />
        </div>
        <div>
          {!sidebarOpen ? (
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          ) : (
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="duplicate">
            <div className="sidebar-header">
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
                  className="sidebar-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ✕
                </button>
              </div>
            </div>
            <ul className="sidebar-menu">
              <li className="active">Dashboard</li>
              <li>Attendance</li>
              <li>Reports</li>
              <li>Profile</li>
              <li>Settings</li>
            </ul>
          </div>
          <div className="navbar-right">
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="total1">
          <div className="employee-header">
            <div className="employee-profile">
              <img
                src={employeeData.profileimg}
                alt="Profile"
                className="employee-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                }}
              />
              <div className="employee-info">
                <h1>{employeeData.name}</h1>
                <p className="employee-role">{employeeData.role}</p>
              </div>
            </div>
            <div className="date-picker-container">
              <div>
                <label htmlFor="attendance-date">Select Date: </label>
                <input
                  type="date"
                  id="attendance-date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>
          <div className="report-section">
            <h3>Monthly Report</h3>
            <div className="report-controls">
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
              />
              <button
                onClick={generateMonthlyReport}
                className="download-button"
              >
                Download Monthly Report
              </button>
              {!showTable ? (
                <button
                  onClick={() => setShowTable(true)}
                  className="show-data-button"
                >
                  Show Data
                </button>
              ) : (
                <button
                  onClick={() => setShowTable(false)}
                  className="hide-data-button"
                >
                  Hide Data
                </button>
              )}
            </div>
          </div>
        </div>
        {showTable && monthlyReportData.length > 0 && (
          <div className="monthly-report-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Emp ID</th>
                  <th>Mobile</th>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours Worked</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReportData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.name}</td>
                    <td>{row.empid}</td>
                    <td>{row.mobile}</td>
                    <td>{row.date}</td>
                    <td>{row.checkIn || "—"}</td>
                    <td>{row.checkOut || "—"}</td>
                    <td>{row.workedHours || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="dashboard-container">
          <div className="week-view-container">
            <h3>Week of {getWeekRange(selectedDate)}</h3>
            <div className="week-days">
              {getWeekDates(selectedDate).map((date, index) => (
                <div
                  key={index}
                  className={`day-box ${
                    isSameDay(date, selectedDate) ? "active" : ""
                  }`}
                  onClick={() =>
                    handleDateChange({
                      target: { value: formatDateForInput(date) }
                    })
                  }
                >
                  <div className="day-name">{formatDayName(date)}</div>
                  <div className="day-date">{date.getDate()}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="attendance-card">
            <h2>
              Attendance Tracking for{" "}
              {new Date(selectedDate).toLocaleDateString()}
            </h2>
            {locationError && (
              <div className="error-message">{locationError}</div>
            )}
            <div className="time-display">
              <div className="time-display1">
                <span className="time-label">Check-In:</span>
                <span className="time-value">{formatTime(checkInTime)}</span>
                <div className="location-info">
                  {checkInLocation && (
                    <div className="time-display2">
                      <p className="locp">Location: {checkInLocation}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="time-display1">
                <span className="time-label">Check-Out:</span>
                <span className="time-value">{formatTime(checkOutTime)}</span>
                <div className="location-info">
                  {checkOutLocation && (
                    <div className="time-display2">
                      <p className="locp">Location: {checkOutLocation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="hours-display">
              <div className="hours-box spent-hours">
                <span className="hours-label">Hours Worked</span>
                <span className="hours-value">{formatHours(workingHours)}</span>
              </div>
              <div className="hours-box remaining-hours">
                <span className="hours-label">Remaining</span>
                <span className="hours-value">
                  {formatHours(remainingHours)}
                </span>
              </div>
            </div>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <span className="progress-text">
                {progressPercentage.toFixed(0)}% of workday completed
              </span>
            </div>
            <div className="action-buttons">
              {!isWorking ? (
                <button
                  onClick={handleCheckIn}
                  className="checkin-button"
                  disabled={isCheckingIn}
                >
                  {isCheckingIn ? "Verifying Location..." : "Check In"}
                </button>
              ) : (
                <button onClick={handleCheckOut} className="checkout-button">
                  Check Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
