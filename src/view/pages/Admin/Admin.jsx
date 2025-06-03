import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebase-config";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

import styles from "./Admin.module.css";
import UsersAdmin from "./UsersAdmin";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const getRangeLabel = (range) => {
  switch (range) {
    case "today":
      return "היום";
    case "week":
      return "שבוע אחרון";
    case "month":
      return "חודש אחרון";
    case "year":
      return "שנה אחרונה";
    default:
      return "";
  }
};

const Admin = () => {
  const [activityData, setActivityData] = useState([]);
  const [showStats, setShowStats] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [timeRange, setTimeRange] = useState("today");

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      alert("אין לך הרשאות גישה לעמוד זה");
      navigate("/");
      return;
    }
    fetchActivity();
  }, [navigate, currentUser, timeRange]);

  const fetchActivity = async () => {
    const now = new Date();
    let startDate;

    if (timeRange === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === "week") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (timeRange === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    } else if (timeRange === "year") {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }

    const q = query(collection(db, "site_usage"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    const seen = new Set();
    const counts = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate?.();
      const page = data.page || "לא ידוע";
      const userId = data.userId || "לא ידוע";

      if (!timestamp || timestamp < startDate) return;

      // עיגול זמן לדקה
      const rounded = new Date(timestamp);
      rounded.setSeconds(0, 0);
      const key = `${userId}_${page}_${rounded.toISOString()}`;

      if (seen.has(key)) return;
      seen.add(key);

      counts[page] = (counts[page] || 0) + 1;
    });

    const formattedData = Object.entries(counts).map(([page, count]) => ({
      page,
      count,
    }));

    setActivityData(formattedData);
  };

  const handleShowStats = () => {
    setShowStats(true);
    setShowUsers(false);
  };

  const handleShowUsers = () => {
    setShowStats(false);
    setShowUsers(true);
  };

  const colors = [
    "rgba(90, 85, 234, 0.7)",
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
  ];

  const data = {
    labels: activityData.map((d) => d.page),
    datasets: [
      {
        label: "כמות כניסות ",
        data: activityData.map((d) => d.count),
        backgroundColor: activityData.map((_, i) => colors[i % colors.length]),
        borderColor: activityData
          .map((_, i) => colors[i % colors.length])
          .map((c) => c.replace("0.7", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false, position: "top" },
      title: {
        display: true,
        text: `כמות כניסות  (${getRangeLabel(timeRange)})`,
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `כניסות: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonsContainer}>
        <button onClick={handleShowStats}>סטטיסטיקות שימוש</button>
        <button onClick={handleShowUsers}>משתמשים</button>
      </div>

      {showStats && (
        <>
          <h2 className={styles.title}>סטטיסטיקות שימוש באתר</h2>

          <div className={styles.rangeButtons}>
            <button onClick={() => setTimeRange("today")}>היום</button>
            <button onClick={() => setTimeRange("week")}>שבוע אחרון</button>
            <button onClick={() => setTimeRange("month")}>חודש אחרון</button>
            <button onClick={() => setTimeRange("year")}>שנה אחרונה</button>
          </div>

          <div className={styles["chart-container"]} style={{ height: 400 }}>
            <Bar data={data} options={options} />
          </div>
        </>
      )}

      {showUsers && (
        <>
          <UsersAdmin currentUser={currentUser} />
        </>
      )}
    </div>
  );
};

export default Admin;
