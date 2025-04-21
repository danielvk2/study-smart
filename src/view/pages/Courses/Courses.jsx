import styles from "./Courses.module.css";

const Courses = () => {
  const courses = [
    { id: 1, name: "מבוא לסייבר", code: "10123", status: "פעיל" },
    { id: 2, name: "תקשורת נתונים", code: "20456", status: "הסתיים" },
    { id: 3, name: "ניהול מערכות מידע", code: "30578", status: "פעיל" },
  ];

  return (
    <div className={styles.container}>
      <h1>הקורסים שלי</h1>

      <div className={styles.courseList}>
        {courses.map((course) => (
          <div key={course.id} className={styles.card}>
            <h3>{course.name}</h3>
            <p>מספר קורס: {course.code}</p>
            <p>סטטוס: <span className={course.status === "פעיל" ? styles.active : styles.inactive}>{course.status}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
