import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { toast } from "react-toastify";
const OFFICE_LOCATION = {
  latitude: 11.6735742,
  longitude: 78.1330915,
  allowedRadius: 20
};
const Dashboard = () => {
  const navigate = useNavigate();
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [workingHours, setWorkingHours] = useState(0);
  const [remainingHours, setRemainingHours] = useState(9);
  const [isWorking, setIsWorking] = useState(false);
  const [timer, setTimer] = useState(null);
  const [employeeData, setEmployeeData] = useState({
    name: "",
    profileimg: "",
    role: "",
    userId: ""
  });
  const [locationError, setLocationError] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Add state for selected date
  const TOTAL_WORK_HOURS = 9;
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
        const todayAttendance = attendances.find(
          (entry) => entry.attendance_date === today
        ); 
        if (todayAttendance) {
          const { check_in, check_out } = todayAttendance;  
          // Convert time strings to Date objects for formatting
          const checkInDate = check_in ? new Date(`${today}T${check_in}`) : null;
          const checkOutDate = check_out ? new Date(`${today}T${check_out}`) : null;  
          setCheckInTime(checkInDate);
          setCheckOutTime(checkOutDate);
        } else {
          setCheckInTime(null);
          setCheckOutTime(null);
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
        const checkOutDate = check_out ? new Date(`${date}T${check_out}`) : null;  
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
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const loc1 = (lat1 * Math.PI) / 180;
    const loc2 = (lat2 * Math.PI) / 180;
    const loc3 = ((lat2 - lat1) * Math.PI) / 180;
    const loc4 = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(loc3 / 2) * Math.sin(loc3 / 2) +
      Math.cos(loc1) * Math.cos(loc2) * Math.sin(loc4 / 2) * Math.sin(loc4 / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const verifyLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const distance = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude
          );
          if (distance <= OFFICE_LOCATION.allowedRadius) {
            resolve(position);
          } else {
            reject(
              new Error(
                `You must be within ${
                  OFFICE_LOCATION.allowedRadius
                }m of the office to check in. Current distance: ${Math.round(
                  distance
                )}m`
              )
            );
          }
        },
        (error) => {
          reject(new Error("Unable to retrieve your location"));
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };
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
      setCheckInTime(now);
      setCheckOutTime(null);
      setIsWorking(true);
      localStorage.setItem("checkInTime", now.toString());
      startTimer(now);
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

      console.log(data);
      toast.success("Checked-in Successfully")
      
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
      toast.success("Checked-out Successfully")
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
  return (
    <div className="dashboard-container">
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
            <h1>Welcome, {employeeData.name}</h1>
            <p className="employee-role">{employeeData.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="date-picker-container">
        <label htmlFor="attendance-date">Select Date: </label>
        <input
          type="date"
          id="attendance-date"
          value={selectedDate}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]} // Don't allow future dates
        />
      </div>
      <div className="attendance-card">
        <h2>Attendance Tracking for {new Date(selectedDate).toLocaleDateString()}</h2>
        {locationError && <div className="error-message">{locationError}</div>}
        <div className="time-display">
          <div>
            <span className="time-label">Check-In:</span>
            <span className="time-value">{formatTime(checkInTime)}</span>
          </div>
          <div>
            <span className="time-label">Check-Out:</span>
            <span className="time-value">{formatTime(checkOutTime)}</span>
          </div>
        </div>
        <div className="hours-display">
          <div className="hours-box spent-hours">
            <span className="hours-label">Hours Worked</span>
            <span className="hours-value">{formatHours(workingHours)}</span>
          </div>
          <div className="hours-box remaining-hours">
            <span className="hours-label">Remaining</span>
            <span className="hours-value">{formatHours(remainingHours)}</span>
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
        <div className="location-info">
          <p>
            Office Location: Latitude {OFFICE_LOCATION.latitude}, Longitude{" "}
            {OFFICE_LOCATION.longitude}
          </p>
          <p>Allowed check-in radius: {OFFICE_LOCATION.allowedRadius}m</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
