import styles from "./Dashboard.module.css";

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>דשבורד</h1>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>📄 סיכומים</h3>
          <p>3 סיכומים שהעלית</p>
        </div>
        <div className={styles.card}>
          <h3>✅ משימות</h3>
          <p>5 משימות שבוצעו</p>
        </div>
        <div className={styles.card}>
          <h3>🎓 קורסים</h3>
          <p>4 קורסים פעילים</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
