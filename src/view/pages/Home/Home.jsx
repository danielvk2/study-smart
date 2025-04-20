import styles from "./Home.module.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>StudySmart</h1>
      <p className={styles.subtitle}>
        המערכת החכמה שתעזור לך לנהל סיכומים, משימות וקורסים – במקום אחד.
      </p>

      <div className={styles.buttons}>
        <Link to="/summaries" className={styles.button}>📄 מעבר לסיכומים</Link>
        <Link to="/tasks" className={styles.button}>✅ ניהול משימות</Link>
        <Link to="/dashboard" className={styles.button}>📊 הצג דשבורד</Link>
      </div>
    </div>
  );
};

export default Home;
