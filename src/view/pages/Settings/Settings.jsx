import styles from "./Settings.module.css";
import { useState } from "react";

const Settings = () => {
  const [user] = useState({
    name: "דניאל וקנין",
    email: "daniel@student.ac.il",
  });

  return (
    <div className={styles.container}>
      <h1>הגדרות משתמש</h1>

      <div className={styles.infoBox}>
        <p><strong>שם:</strong> {user.name}</p>
        <p><strong>אימייל:</strong> {user.email}</p>
      </div>

      <div className={styles.actions}>
        <button className="primary">ערוך פרטים</button>
        <button className={styles.logout}>🚪 התנתק</button>
      </div>
    </div>
  );
};

export default Settings;
