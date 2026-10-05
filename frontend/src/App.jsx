import {
  useCallback,
  useEffect,
  useState,
} from "react";

import "./App.css";

import Register from "./Register";
import Login from "./Login";
import Landing from "./Landing";

const API = "https://smart-lifestyle-tracker.onrender.com/api";

const DEFAULT_HABITS = [
  "Study",
  "Exercise",
  "Reading",
  "Drink Water",
  "Meditation",
];

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [user, setUser] = useState(function () {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (!savedUser || !savedToken) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const [authScreen, setAuthScreen] = useState("landing");

  // =========================
  // PROFILE
  // =========================

  const [showProfile, setShowProfile] = useState(false);

  // =========================
  // CHANGE PASSWORD
  // =========================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // =========================
  // HABITS (CUSTOM / USER CHOICE)
  // =========================

  const [habits, setHabits] = useState(function () {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      return DEFAULT_HABITS;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      const savedHabits = localStorage.getItem(
        "userHabits_" + parsedUser.id
      );
      if (savedHabits) {
        const parsedHabits = JSON.parse(savedHabits);
        if (Array.isArray(parsedHabits) && parsedHabits.length > 0) {
          return parsedHabits;
        }
      }
      return DEFAULT_HABITS;
    } catch (error) {
      return DEFAULT_HABITS;
    }
  });

  const [newHabitName, setNewHabitName] = useState("");

  // =========================
  // SELECTED MONTH
  // =========================

  const [selectedMonth, setSelectedMonth] = useState(function () {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return "2026-09";
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      return (
        localStorage.getItem("selectedMonth_" + parsedUser.id) ||
        "2026-09"
      );
    } catch (error) {
      return "2026-09";
    }
  });

  // =========================
  // SELECTED DAY
  // =========================

  const [selectedDay, setSelectedDay] = useState(function () {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return 1;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      return (
        Number(localStorage.getItem("selectedDay_" + parsedUser.id)) || 1
      );
    } catch (error) {
      return 1;
    }
  });

  // =========================
  // DATA
  // =========================

  const [completed, setCompleted] = useState({});
  const [sleep, setSleep] = useState({});
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);

  // =========================
  // NOTE EDITING
  // =========================

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // =========================
  // DAYS IN MONTH
  // =========================

  const monthParts = selectedMonth.split("-");
  const selectedYear = Number(monthParts[0]);
  const selectedMonthNumber = Number(monthParts[1]);

  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonthNumber,
    0
  ).getDate();

  const days = Array.from(
    { length: daysInSelectedMonth },
    function (_, index) {
      return index + 1;
    }
  );

  // =========================
  // AUTH HEADERS
  // =========================

  function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
  }

  // =========================
  // REGISTER SUCCESS
  // =========================

  function handleRegisterSuccess(registeredUser) {
    setUser(registeredUser);

    const userMonth =
      localStorage.getItem("selectedMonth_" + registeredUser.id) ||
      "2026-09";

    const userDay =
      Number(
        localStorage.getItem("selectedDay_" + registeredUser.id)
      ) || 1;

    setSelectedMonth(userMonth);
    setSelectedDay(userDay);

    const savedUserHabits = localStorage.getItem(
      "userHabits_" + registeredUser.id
    );
    if (savedUserHabits) {
      try {
        const parsed = JSON.parse(savedUserHabits);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHabits(parsed);
        } else {
          setHabits(DEFAULT_HABITS);
        }
      } catch (e) {
        setHabits(DEFAULT_HABITS);
      }
    } else {
      setHabits(DEFAULT_HABITS);
    }

    setCompleted({});
    setSleep({});
    setSavedNotes([]);
    setNotes("");
    setEditingNoteId(null);
    setEditingNoteText("");
    setShowProfile(false);

    setCurrentPassword("");
    setNewPassword("");
    setPasswordMessage("");
    setPasswordError("");
    setChangingPassword(false);

    setAuthScreen("dashboard");
  }

  // =========================
  // LOGIN SUCCESS
  // =========================

  function handleLoginSuccess(loggedInUser) {
    setUser(loggedInUser);

    const userMonth =
      localStorage.getItem("selectedMonth_" + loggedInUser.id) ||
      "2026-09";

    const userDay =
      Number(
        localStorage.getItem("selectedDay_" + loggedInUser.id)
      ) || 1;

    setSelectedMonth(userMonth);
    setSelectedDay(userDay);

    const savedUserHabits = localStorage.getItem(
      "userHabits_" + loggedInUser.id
    );
    if (savedUserHabits) {
      try {
        const parsed = JSON.parse(savedUserHabits);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHabits(parsed);
        } else {
          setHabits(DEFAULT_HABITS);
        }
      } catch (e) {
        setHabits(DEFAULT_HABITS);
      }
    } else {
      setHabits(DEFAULT_HABITS);
    }

    setCompleted({});
    setSleep({});
    setSavedNotes([]);
    setNotes("");
    setEditingNoteId(null);
    setEditingNoteText("");
    setShowProfile(false);

    setCurrentPassword("");
    setNewPassword("");
    setPasswordMessage("");
    setPasswordError("");
    setChangingPassword(false);

    setAuthScreen("dashboard");
  }

  // =========================
  // LOGOUT
  // =========================

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setAuthScreen("login");
    setShowProfile(false);

    setHabits(DEFAULT_HABITS);
    setNewHabitName("");
    setCompleted({});
    setSleep({});
    setSavedNotes([]);
    setNotes("");
    setEditingNoteId(null);
    setEditingNoteText("");

    setCurrentPassword("");
    setNewPassword("");
    setPasswordMessage("");
    setPasswordError("");
    setChangingPassword(false);
  }

  // =========================
  // SHOW REGISTER
  // =========================

  function showRegister() {
    setAuthScreen("register");
  }

  // =========================
  // SHOW LOGIN
  // =========================

  function showLogin() {
    setAuthScreen("login");
  }

  // =========================
  // ADD HABIT (USER CHOICE)
  // =========================

  function handleAddHabit(event) {
    event.preventDefault();
    const trimmed = newHabitName.trim();

    if (!trimmed) {
      alert("Please enter a habit name.");
      return;
    }

    if (
      habits.some(function (h) {
        return h.toLowerCase() === trimmed.toLowerCase();
      })
    ) {
      alert("This habit already exists!");
      return;
    }

    const updated = [...habits, trimmed];
    setHabits(updated);
    setNewHabitName("");

    if (user) {
      localStorage.setItem(
        "userHabits_" + user.id,
        JSON.stringify(updated)
      );
    }
  }

  // =========================
  // DELETE HABIT (USER CHOICE)
  // =========================

  function handleDeleteHabit(habitToDelete) {
    const confirmed = window.confirm(
      'Are you sure you want to remove the habit "' + habitToDelete + '"?'
    );

    if (!confirmed) {
      return;
    }

    const updated = habits.filter(function (h) {
      return h !== habitToDelete;
    });

    setHabits(updated);

    if (user) {
      localStorage.setItem(
        "userHabits_" + user.id,
        JSON.stringify(updated)
      );
    }

    // Clean up local completed state for deleted habit
    setCompleted(function (previous) {
      const next = { ...previous };
      Object.keys(next).forEach(function (key) {
        if (key.startsWith(habitToDelete + "-")) {
          delete next[key];
        }
      });
      return next;
    });
  }

  // =========================
  // CHANGE PASSWORD
  // =========================

  async function handleChangePassword(event) {
    event.preventDefault();

    if (changingPassword) {
      return;
    }

    setPasswordMessage("");
    setPasswordError("");

    const current = currentPassword.trim();
    const next = newPassword.trim();

    if (!current) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!next) {
      setPasswordError("Please enter your new password.");
      return;
    }

    if (next.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (current === next) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(API + "/auth/change-password", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
        }),
      });

      let result = {};

      try {
        result = await response.json();
      } catch (error) {
        result = {};
      }

      if (
        response.status === 401 &&
        result.message === "Invalid or expired token"
      ) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        setPasswordError(
          result.message || "Failed to change password."
        );
        return;
      }

      setPasswordMessage(
        result.message || "Password changed successfully!"
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordError("Unable to connect to the server.");
    } finally {
      setChangingPassword(false);
    }
  }

  // =========================
  // KEEP DAY VALID
  // =========================

  useEffect(
    function () {
      if (selectedDay > daysInSelectedMonth) {
        setSelectedDay(daysInSelectedMonth);

        if (user) {
          localStorage.setItem(
            "selectedDay_" + user.id,
            String(daysInSelectedMonth)
          );
        }
      }
    },
    [selectedDay, daysInSelectedMonth, user]
  );

  // =========================
  // LOAD HABITS
  // =========================

  const loadHabits = useCallback(
    async function (month) {
      if (!user) {
        return;
      }

      try {
        const response = await fetch(
          API + "/habits?month=" + encodeURIComponent(month),
          {
            headers: getAuthHeaders(),
          }
        );

        if (response.status === 401) {
          handleLogout();
          return;
        }

        const result = await response.json();

        if (!result.success) {
          return;
        }

        const data = {};

        result.data.forEach(function (item) {
          if (item.completed === true) {
            const key = item.habit + "-" + item.day;
            data[key] = true;
          }
        });

        setCompleted(data);
      } catch (error) {
        console.error("Unable to load habits:", error);
      }
    },
    [user]
  );

  // =========================
  // LOAD SLEEP
  // =========================

  const loadSleep = useCallback(
    async function (month) {
      if (!user) {
        return;
      }

      try {
        const response = await fetch(
          API + "/sleep?month=" + encodeURIComponent(month),
          {
            headers: getAuthHeaders(),
          }
        );

        if (response.status === 401) {
          handleLogout();
          return;
        }

        const result = await response.json();

        if (!result.success) {
          return;
        }

        const data = {};

        result.data.forEach(function (item) {
          if (item.hours !== null && item.hours !== undefined) {
            data[item.day] = String(item.hours);
          }
        });

        setSleep(data);
      } catch (error) {
        console.error("Unable to load sleep:", error);
      }
    },
    [user]
  );

  // =========================
  // LOAD NOTES
  // =========================

  const loadNotes = useCallback(
    async function () {
      if (!user) {
        return;
      }

      try {
        const response = await fetch(API + "/notes", {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          handleLogout();
          return;
        }

        const result = await response.json();

        if (result.success) {
          setSavedNotes(result.data);
        }
      } catch (error) {
        console.error("Unable to load notes:", error);
      }
    },
    [user]
  );

  // =========================
  // LOAD NOTES ON LOGIN
  // =========================

  useEffect(
    function () {
      if (!user) {
        return;
      }

      loadNotes();
    },
    [user, loadNotes]
  );

  // =========================
  // LOAD MONTH DATA
  // =========================

  useEffect(
    function () {
      if (!user) {
        return;
      }

      if (!selectedMonth) {
        return;
      }

      localStorage.setItem("selectedMonth_" + user.id, selectedMonth);

      setCompleted({});
      setSleep({});

      loadHabits(selectedMonth);
      loadSleep(selectedMonth);
    },
    [user, selectedMonth, loadHabits, loadSleep]
  );

  // =========================
  // MONTHLY DASHBOARD STATS
  // =========================

  const totalCompleted = Object.keys(completed).length;
  const totalPossible = habits.length * days.length;

  const completionPercentage =
    totalPossible === 0
      ? 0
      : Math.round((totalCompleted / totalPossible) * 100);

  // =========================
  // AVERAGE SLEEP
  // =========================

  const sleepValues = Object.values(sleep)
    .map(Number)
    .filter(function (value) {
      return Number.isFinite(value);
    });

  const averageSleep =
    sleepValues.length === 0
      ? "0.0"
      : (
          sleepValues.reduce(function (total, value) {
            return total + value;
          }, 0) / sleepValues.length
        ).toFixed(1);

  // =========================
  // BEST HABIT
  // =========================

  let bestHabit = "-";
  let bestHabitCount = 0;

  habits.forEach(function (habit) {
    let count = 0;

    days.forEach(function (day) {
      const key = habit + "-" + day;
      if (completed[key] === true) {
        count++;
      }
    });

    if (count > bestHabitCount) {
      bestHabitCount = count;
      bestHabit = habit;
    }
  });

  // =========================
  // DAILY PROGRESS STATS
  // =========================

  let dailyCompleted = 0;

  habits.forEach(function (habit) {
    const key = habit + "-" + selectedDay;
    if (completed[key] === true) {
      dailyCompleted++;
    }
  });

  const dailyTotal = habits.length;

  const dailyPercentage =
    dailyTotal === 0
      ? 0
      : Math.round((dailyCompleted / dailyTotal) * 100);

  const selectedDaySleep = sleep[selectedDay]
    ? Number(sleep[selectedDay])
    : 0;

  // =========================
  // CHANGE MONTH
  // =========================

  function handleMonthChange(event) {
    const month = event.target.value;

    if (!month) {
      return;
    }

    setSelectedMonth(month);

    localStorage.setItem("selectedMonth_" + user.id, month);

    setSelectedDay(1);

    localStorage.setItem("selectedDay_" + user.id, "1");
  }

  // =========================
  // CHANGE DAY
  // =========================

  function handleDayChange(event) {
    const day = Number(event.target.value);

    setSelectedDay(day);

    localStorage.setItem("selectedDay_" + user.id, String(day));
  }

  // =========================
  // TOGGLE HABIT
  // =========================

  async function toggleHabit(habit, day) {
    const key = habit + "-" + day;
    const newStatus = completed[key] !== true;

    setCompleted(function (previous) {
      const updated = {
        ...previous,
      };

      if (newStatus) {
        updated[key] = true;
      } else {
        delete updated[key];
      }

      return updated;
    });

    try {
      const response = await fetch(API + "/habit", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          habit: habit,
          day: Number(day),
          month: selectedMonth,
          completed: newStatus,
        }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Habit update failed");
      }
    } catch (error) {
      console.error("Habit update error:", error);
      loadHabits(selectedMonth);
    }
  }

  // =========================
  // CHANGE SLEEP
  // =========================

  async function changeSleep(day, value) {
    setSleep(function (previous) {
      const updated = {
        ...previous,
      };

      if (value === "") {
        delete updated[day];
      } else {
        updated[day] = value;
      }

      return updated;
    });

    try {
      const response = await fetch(API + "/sleep", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          day: Number(day),
          month: selectedMonth,
          hours: value === "" ? null : Number(value),
        }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Sleep update failed");
      }
    } catch (error) {
      console.error("Sleep update error:", error);
      loadSleep(selectedMonth);
    }
  }

  // =========================
  // SAVE NOTE
  // =========================

  async function saveNote() {
    if (notes.trim() === "") {
      alert("Please write something first!");
      return;
    }

    try {
      const response = await fetch(API + "/note", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          note: notes.trim(),
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Note was not saved");
      }

      alert("Note saved successfully!");
      setNotes("");
      loadNotes();
    } catch (error) {
      console.error("Note saving error:", error);
      alert("Backend connection failed!");
    }
  }

  // =========================
  // START EDIT NOTE
  // =========================

  function startEditingNote(item) {
    setEditingNoteId(item._id);
    setEditingNoteText(item.note);
  }

  // =========================
  // CANCEL EDIT NOTE
  // =========================

  function cancelEditingNote() {
    setEditingNoteId(null);
    setEditingNoteText("");
  }

  // =========================
  // UPDATE NOTE
  // =========================

  async function updateNote(item) {
    if (editingNoteText.trim() === "") {
      alert("Please write something first!");
      return;
    }

    try {
      const response = await fetch(API + "/note/" + item._id, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          note: editingNoteText.trim(),
          date: item.date,
        }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Note update failed");
      }

      alert("Note updated successfully!");
      setEditingNoteId(null);
      setEditingNoteText("");
      loadNotes();
    } catch (error) {
      console.error("Note update error:", error);
      alert("Unable to update note!");
    }
  }

  // =========================
  // DELETE NOTE
  // =========================

  async function deleteNote(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(API + "/note/" + id, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Note deletion failed");
      }

      alert("Note deleted successfully!");

      if (editingNoteId === id) {
        setEditingNoteId(null);
        setEditingNoteText("");
      }

      loadNotes();
    } catch (error) {
      console.error("Note deletion error:", error);
      alert("Unable to delete note!");
    }
  }

  // =========================
  // SLEEP CYCLE GRAPH DATA
  // =========================

  const chartHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 32;
  const paddingBottom = 40;

  const minDayStep = 28;
  const chartWidth = Math.max(
    720,
    paddingLeft + paddingRight + (days.length - 1) * minDayStep
  );

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const yLevels = [9, 8, 7, 6, 5];

  function getY(hours) {
    return (
      paddingTop +
      ((9 - hours) / 4) * plotHeight
    );
  }

  function getX(day) {
    if (days.length <= 1) {
      return paddingLeft + plotWidth / 2;
    }
    return (
      paddingLeft +
      ((day - 1) / (days.length - 1)) * plotWidth
    );
  }

  const recordedPoints = [];
  days.forEach(function (day) {
    const val = sleep[day];
    if (val !== undefined && val !== null && val !== "") {
      const num = Number(val);
      if (Number.isFinite(num) && num >= 5 && num <= 9) {
        recordedPoints.push({
          day: day,
          hours: num,
          x: getX(day),
          y: getY(num),
        });
      }
    }
  });

  const linePath =
    recordedPoints.length >= 2
      ? recordedPoints
          .map(function (pt, idx) {
            return (
              (idx === 0 ? "M " : "L ") +
              pt.x.toFixed(1) +
              " " +
              pt.y.toFixed(1)
            );
          })
          .join(" ")
      : "";

  const areaPath =
    recordedPoints.length >= 2
      ? linePath +
        " L " +
        recordedPoints[recordedPoints.length - 1].x.toFixed(1) +
        " " +
        getY(5).toFixed(1) +
        " L " +
        recordedPoints[0].x.toFixed(1) +
        " " +
        getY(5).toFixed(1) +
        " Z"
      : "";

  // =========================
  // AUTH SCREEN
  // =========================

  if (!user) {
    if (authScreen === "landing") {
      return (
        <Landing
          onGetStarted={showRegister}
          onLogin={showLogin}
        />
      );
    }

    if (authScreen === "login") {
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onShowRegister={showRegister}
        />
      );
    }

    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onShowLogin={showLogin}
      />
    );
  }

  // =========================
  // PROFILE SCREEN
  // =========================

  if (showProfile) {
    return (
      <div className="app">
        <header>
          <div>
            <h1>Smart Lifestyle Tracker</h1>
            <p>Your account</p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="profile-button"
              onClick={function () {
                setShowProfile(false);
                setPasswordMessage("");
                setPasswordError("");
              }}
            >
              ← Back to Tracker
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <main>
          <section className="card profile-card">
            <h2>👤 Profile</h2>

            <div className="profile-info">
              <div className="profile-item">
                <span className="profile-label">Name</span>
                <strong>{user.name}</strong>
              </div>

              <div className="profile-item">
                <span className="profile-label">Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="profile-item">
                <span className="profile-label">Account</span>
                <strong>Personal Account</strong>
              </div>
            </div>

            {/* CHANGE PASSWORD */}
            <form
              className="profile-section"
              onSubmit={handleChangePassword}
            >
              <h3>🔐 Change Password</h3>
              <p>Update your account password securely.</p>

              <div className="password-form">
                <div className="password-field">
                  <label htmlFor="current-password">
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={function (event) {
                      setCurrentPassword(event.target.value);
                      setPasswordError("");
                      setPasswordMessage("");
                    }}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="password-field">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={function (event) {
                      setNewPassword(event.target.value);
                      setPasswordError("");
                      setPasswordMessage("");
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </div>

                {passwordError && (
                  <div className="password-error">
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div className="password-success">
                    {passwordMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="profile-action-button"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    );
  }

  // =========================
  // GRID STYLE
  // =========================

  const gridStyle = {
    "--day-count": days.length,
  };

  // =========================
  // MAIN DASHBOARD SCREEN
  // =========================

  return (
    <div className="app">
      <header>
        <div>
          <h1>Smart Lifestyle Tracker</h1>
          <p>Small habits. Big change.</p>
          <p className="logged-user">Welcome, {user.name} 👋</p>
        </div>

        <div className="header-actions">
          <div className="month">
            <label htmlFor="month-input">Month</label>
            <input
              id="month-input"
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
            />
          </div>

          <button
            type="button"
            className="profile-button"
            onClick={function () {
              setShowProfile(true);
              setPasswordMessage("");
              setPasswordError("");
            }}
          >
            👤 Profile
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        {/* =========================
            MONTHLY DASHBOARD
        ========================= */}
        <section className="card dashboard">
          <h2>📊 Monthly Dashboard</h2>

          <div className="dashboard-grid">
            <div className="dashboard-box">
              <div className="dashboard-icon">✅</div>
              <div>
                <p>Completed Habits</p>
                <h3>{totalCompleted}</h3>
              </div>
            </div>

            <div className="dashboard-box">
              <div className="dashboard-icon">📈</div>
              <div>
                <p>Completion</p>
                <h3>{completionPercentage}%</h3>
              </div>
            </div>

            <div className="dashboard-box">
              <div className="dashboard-icon">😴</div>
              <div>
                <p>Average Sleep</p>
                <h3>{averageSleep}h</h3>
              </div>
            </div>

            <div className="dashboard-box">
              <div className="dashboard-icon">🏆</div>
              <div>
                <p>Best Habit</p>
                <h3>{bestHabit}</h3>
                {bestHabit !== "-" && (
                  <small>{bestHabitCount} days</small>
                )}
              </div>
            </div>
          </div>

          {/* =========================
              DAILY PROGRESS
          ========================= */}
          <div className="daily-progress">
            <div className="daily-progress-header">
              <div>
                <h3>📅 Daily Progress</h3>
                <p>Track your progress for a specific day.</p>
              </div>

              <div className="day-selector">
                <label htmlFor="day-input">Select Day</label>
                <select
                  id="day-input"
                  value={selectedDay}
                  onChange={handleDayChange}
                >
                  {days.map(function (day) {
                    return (
                      <option value={day} key={day}>
                        Day {day}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="daily-progress-grid">
              <div className="daily-box">
                <div className="daily-icon">✅</div>
                <div>
                  <p>Habits Completed</p>
                  <h4>
                    {dailyCompleted} / {dailyTotal}
                  </h4>
                </div>
              </div>

              <div className="daily-box">
                <div className="daily-icon">📊</div>
                <div>
                  <p>Daily Completion</p>
                  <h4>{dailyPercentage}%</h4>
                </div>
              </div>

              <div className="daily-box">
                <div className="daily-icon">😴</div>
                <div>
                  <p>Sleep</p>
                  <h4>
                    {selectedDaySleep > 0
                      ? selectedDaySleep + "h"
                      : "Not set"}
                  </h4>
                </div>
              </div>
            </div>

            <div className="daily-bar-container">
              <div className="daily-bar-background">
                <div
                  className="daily-bar-fill"
                  style={{
                    width: dailyPercentage + "%",
                  }}
                ></div>
              </div>

              <span>
                Day {selectedDay}: {dailyPercentage}% complete
              </span>
            </div>
          </div>
        </section>

        {/* =========================
            HABIT TRACKER
        ========================= */}
        <section className="card">
          <div className="habit-header-bar">
            <div>
              <h2>🌱 Habit Tracker</h2>
              <p className="section-description">
                Track, add, and customize habits of your own choice.
              </p>
            </div>

            <form
              className="add-habit-form"
              onSubmit={handleAddHabit}
            >
              <input
                type="text"
                className="add-habit-input"
                placeholder="Add a new habit..."
                value={newHabitName}
                onChange={function (event) {
                  setNewHabitName(event.target.value);
                }}
              />
              <button type="submit" className="add-habit-button">
                + Add Habit
              </button>
            </form>
          </div>

          <div className="table-container">
            <div className="habit-table" style={gridStyle}>
              <div className="habit-name header">Habits / Days</div>

              {days.map(function (day) {
                return (
                  <div
                    className={
                      day === selectedDay
                        ? "day header selected-day"
                        : "day header"
                    }
                    key={"header-" + day}
                  >
                    {day}
                  </div>
                );
              })}

              {habits.map(function (habit) {
                return (
                  <div
                    className="habit-row"
                    key={habit}
                    style={gridStyle}
                  >
                    <div className="habit-name">
                      <span className="habit-text" title={habit}>
                        {habit}
                      </span>
                      <button
                        type="button"
                        className="delete-habit-btn"
                        onClick={function () {
                          handleDeleteHabit(habit);
                        }}
                        title={'Remove "' + habit + '"'}
                        aria-label={"Remove habit " + habit}
                      >
                        ×
                      </button>
                    </div>

                    {days.map(function (day) {
                      const key = habit + "-" + day;
                      const isCompleted = completed[key] === true;

                      return (
                        <button
                          type="button"
                          key={habit + "-" + day}
                          className={
                            isCompleted
                              ? "habit-box completed"
                              : "habit-box"
                          }
                          onClick={function () {
                            toggleHabit(habit, day);
                          }}
                          aria-label={habit + " day " + day}
                        >
                          {isCompleted ? "✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================
            SLEEP TRACKER & CYCLE GRAPH
        ========================= */}
        <section className="card">
          <h2>😴 Sleep Tracker &amp; Cycle Graph</h2>

          {/* Sleep Cycle Graph */}
          <div className="sleep-graph-container">
            <div className="sleep-graph-header">
              <div>
                <h3 className="section-subtitle">📈 Sleep Cycle Graph</h3>
                <p className="section-description">
                  Sleep hours across the selected month ({selectedMonth})
                </p>
              </div>

              {sleepValues.length > 0 && (
                <div className="sleep-graph-meta">
                  <span className="sleep-meta-pill">
                    Average: <strong>{averageSleep}h</strong>
                  </span>
                  <span className="sleep-meta-pill">
                    Logged: <strong>{sleepValues.length}/{days.length} days</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="table-container chart-scroll">
              <svg
                className="sleep-chart-svg"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                width={chartWidth}
                height={chartHeight}
              >
                <defs>
                  <linearGradient
                    id="sleepAreaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity="0.18"
                    />
                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>

                {/* Y-Axis Label */}
                <text
                  x="12"
                  y="18"
                  className="chart-axis-title"
                >
                  Sleep Hours
                </text>

                {/* Horizontal Grid Lines and Y-Axis Ticks */}
                {yLevels.map(function (level) {
                  const y = getY(level);
                  return (
                    <g key={"y-level-" + level}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        className="chart-grid-line"
                      />
                      <text
                        x={paddingLeft - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="chart-tick-label"
                      >
                        {level}h
                      </text>
                    </g>
                  );
                })}

                {/* Y-Axis Line */}
                <line
                  x1={paddingLeft}
                  y1={paddingTop}
                  x2={paddingLeft}
                  y2={getY(5)}
                  className="chart-axis-line"
                />

                {/* X-Axis Baseline */}
                <line
                  x1={paddingLeft}
                  y1={getY(5)}
                  x2={chartWidth - paddingRight}
                  y2={getY(5)}
                  className="chart-axis-line"
                />

                {/* X-Axis Day Ticks and Labels */}
                {days.map(function (day) {
                  const x = getX(day);
                  const isSelected = day === selectedDay;
                  return (
                    <g
                      key={"day-tick-" + day}
                      onClick={function () {
                        setSelectedDay(day);
                        if (user) {
                          localStorage.setItem(
                            "selectedDay_" + user.id,
                            String(day)
                          );
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <line
                        x1={x}
                        y1={getY(5)}
                        x2={x}
                        y2={getY(5) + 5}
                        className={
                          isSelected
                            ? "chart-axis-tick selected"
                            : "chart-axis-tick"
                        }
                      />
                      <text
                        x={x}
                        y={getY(5) + 20}
                        textAnchor="middle"
                        className={
                          isSelected
                            ? "chart-day-label selected"
                            : "chart-day-label"
                        }
                      >
                        {day}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient area under line */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill="url(#sleepAreaGradient)"
                  />
                )}

                {/* Line Path Connecting Recorded Points */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Recorded Data Points (Dots and Values) */}
                {recordedPoints.map(function (pt) {
                  const isSelected = pt.day === selectedDay;
                  return (
                    <g
                      key={"point-" + pt.day}
                      onClick={function () {
                        setSelectedDay(pt.day);
                        if (user) {
                          localStorage.setItem(
                            "selectedDay_" + user.id,
                            String(pt.day)
                          );
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Value label above dot */}
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        className="chart-point-text"
                      >
                        {pt.hours}h
                      </text>

                      {/* Point circle */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 6.5 : 5}
                        className={
                          isSelected
                            ? "chart-point-circle selected"
                            : "chart-point-circle"
                        }
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {recordedPoints.length === 0 && (
              <p className="no-sleep-message">
                No sleep records logged for this month yet. Use the dropdown table below to log your daily sleep hours.
              </p>
            )}
          </div>

          {/* Daily Sleep Hours Table */}
          <div className="sleep-table-wrapper">
            <h3 className="section-subtitle">⏱️ Daily Sleep Hours</h3>

            <div className="table-container">
              <div className="sleep-grid" style={gridStyle}>
                <div className="sleep-label header">Sleep / Days</div>

                {days.map(function (day) {
                  return (
                    <div
                      className={
                        day === selectedDay
                          ? "day header selected-day"
                          : "day header"
                      }
                      key={"sleep-header-" + day}
                    >
                      {day}
                    </div>
                  );
                })}

                <div className="sleep-label">Hours</div>

                {days.map(function (day) {
                  return (
                    <div
                      className="sleep-cell"
                      key={"sleep-cell-" + day}
                    >
                      <select
                        className="sleep-select"
                        value={sleep[day] || ""}
                        onChange={function (event) {
                          changeSleep(day, event.target.value);
                        }}
                        aria-label={"Day " + day + " sleep hours"}
                      >
                        <option value="">-</option>
                        <option value="5">5h</option>
                        <option value="6">6h</option>
                        <option value="7">7h</option>
                        <option value="8">8h</option>
                        <option value="9">9h</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            NOTES
        ========================= */}
        <section className="card">
          <h2>📝 Notes</h2>

          <textarea
            className="notes"
            value={notes}
            onChange={function (event) {
              setNotes(event.target.value);
            }}
            placeholder="Write your thoughts, achievements, or anything you want to remember..."
          />

          <div className="note-button-container">
            <button
              type="button"
              onClick={saveNote}
            >
              Save Note
            </button>
          </div>

          {savedNotes.length > 0 && (
            <div className="saved-notes">
              <h3>Saved Notes</h3>

              {savedNotes.map(function (item) {
                const isEditing = editingNoteId === item._id;

                return (
                  <div
                    className="saved-note"
                    key={item._id}
                  >
                    {isEditing ? (
                      <>
                        <textarea
                          className="note-edit-input"
                          value={editingNoteText}
                          onChange={function (event) {
                            setEditingNoteText(event.target.value);
                          }}
                        />

                        <small>{item.date}</small>

                        <div className="note-actions">
                          <button
                            type="button"
                            onClick={function () {
                              updateNote(item);
                            }}
                          >
                            💾 Save
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditingNote}
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{item.note}</p>

                        <small>{item.date}</small>

                        <div className="note-actions">
                          <button
                            type="button"
                            onClick={function () {
                              startEditingNote(item);
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={function () {
                              deleteNote(item._id);
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;