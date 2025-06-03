import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../firebase-config";
import styles from "./Tasks.module.css";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("הכל");
  const [newTask, setNewTask] = useState({
    title: "",
    course: "",
    status: "ממתין",
    dueDate: "",
    description: "",
  });
  const [editTaskId, setEditTaskId] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const loggedRef = useRef(false);

  useEffect(() => {
    fetchTasks();

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
        page: "Tasks",
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

  const handleAddOrUpdateTask = async () => {
    if (!newTask.title || !newTask.course || !newTask.dueDate) return;

    if (editTaskId) {
      await updateDoc(doc(db, "tasks", editTaskId), { ...newTask });
      setEditTaskId(null);
    } else {
      await addDoc(collection(db, "tasks"), {
        ...newTask,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
      });
    }

    setNewTask({
      title: "",
      course: "",
      status: "ממתין",
      dueDate: "",
      description: "",
    });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
    fetchTasks();
  };

  const handleEdit = (task) => {
    setNewTask({
      title: task.title,
      course: task.course,
      status: task.status,
      dueDate: task.dueDate,
      description: task.description || "",
    });
    setEditTaskId(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateDoc(doc(db, "tasks", id), { status: newStatus });
    fetchTasks();
  };

  const filteredTasks =
    filter === "הכל" ? tasks : tasks.filter((task) => task.status === filter);

  const toggleDescription = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  return (
    <div className={styles.container}>
      <h2>{editTaskId ? "עריכת משימה" : "המשימות שלי"}</h2>

      <div className={styles.addSection}>
        <input
          type="text"
          placeholder="שם משימה"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="קורס"
          value={newTask.course}
          onChange={(e) => setNewTask({ ...newTask, course: e.target.value })}
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        />
        <textarea
          placeholder="פירוט משימה"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          rows="3"
        />
        <button onClick={handleAddOrUpdateTask}>
          {editTaskId ? "עדכן" : "➕ הוסף"}
        </button>
      </div>

      <div className={styles.filterButtons}>
        {["הכל", "ממתין", "דחוף", "הושלם"].map((status) => (
          <button
            key={status}
            className={filter === status ? styles.active : ""}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <ul className={styles.taskList}>
        {filteredTasks.map((task) => (
          <li key={task.id} className={styles.taskItem}>
            <strong>{task.title}</strong>
            <div>
              קורס: {task.course} | יעד: {formatDate(task.dueDate)}
            </div>

            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
            >
              <option value="ממתין">ממתין</option>
              <option value="דחוף">דחוף</option>
              <option value="הושלם">הושלם</option>
            </select>

            <div>
              <button onClick={() => handleEdit(task)}>✏️ ערוך</button>
              <button onClick={() => handleDelete(task.id)}>🗑️ מחק</button>
              {task.description && (
                <button onClick={() => toggleDescription(task.id)}>
                  {expandedTaskId === task.id ? "הסתר פירוט" : "הצג פירוט"}
                </button>
              )}
            </div>

            {expandedTaskId === task.id && task.description && (
              <div className={styles.descriptionBox}>
                <p>{task.description}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
