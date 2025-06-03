import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase-config";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [summaries, setSummaries] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const loggedRef = useRef(false); // למנוע הוספה כפולה בזמן הרינדור

  useEffect(() => {
    fetchTasks();
    fetchSummaries();

    if (!loggedRef.current) {
      logPageVisit();
      loggedRef.current = true;
    }
  }, []);

  const logPageVisit = async () => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, "site_usage"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        page: "Dashboard",
        timestamp: serverTimestamp(),
      });
      console.log("Entry added!");
    } catch (err) {
      console.error("Error logging activity:", err);
    }
  };

  const fetchTasks = async () => {
    const q = query(collection(db, "tasks"), where("userId", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTasks(data);
  };

  const fetchSummaries = async () => {
    const q = query(collection(db, "public_summaries"), where("userId", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSummaries(data);
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "הושלם").length;
  const pending = tasks.filter((t) => t.status === "ממתין").length;
  const urgent = tasks.filter((t) => t.status === "דחוף").length;
  const summaryCount = summaries.length;

  return (
    <div className={styles.container}>
      <h2>דשבורד אישי</h2>

      <div className={styles.cards}>
        <div className={styles.card}><h3>🔥 דחופות</h3><p>{urgent}</p></div>
        <div className={styles.card}><h3>⏳ ממתינות</h3><p>{pending}</p></div>
        <div className={styles.card}><h3>✅ הושלמו</h3><p>{completed}</p></div>
        <div className={styles.card}><h3>📄 סיכומים</h3><p>{summaryCount}</p></div>
        <div className={styles.card}><h3>📋 סה"כ משימות</h3><p>{total}</p></div>
      </div>
    </div>
  );
};

export default Dashboard;
