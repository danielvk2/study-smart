import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import styles from "./Help.module.css";

const Help = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    setCurrentUser(storedUser);
  }, []);

  const sendHelpRequest = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setStatus("יש להתחבר כדי לשלוח פנייה.");
      return;
    }

    if (!message.trim()) {
      setStatus("ההודעה ריקה. כתוב תוכן לפני שליחה.");
      return;
    }

    try {
      const res = await fetch("https://us-central1-study-smart-1e97e.cloudfunctions.net/sendHelpEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUser.email,
          message,
        }),
      });

      const text = await res.text();
      if (res.ok) {
        setMessage("");
        setStatus("✅ הפנייה נשלחה בהצלחה!");
      } else {
        setStatus("❌ שגיאה בשליחה: " + text);
      }
    } catch (err) {
      console.error("שגיאה:", err);
      setStatus("❌ שגיאה כללית בשליחה");
    }
  };

  return (
    <div className={styles.container}>
      {!currentUser ? (
        <p>יש להתחבר כדי לגשת לעמוד העזרה.</p>
      ) : (
        <>
          <h1>ברוך הבא לעמוד העזרה</h1>
          <h2>מה תוכל לעשות בכל עמוד?</h2>

          <ul className={styles.pageExplanations}>
            <li><strong>🏠 דף הבית:</strong> סקירה כללית על המערכת, גישה מהירה לעמודים חשובים.</li>
            <li><strong>📚 סיכומים:</strong> העלאת סיכומים, צפייה בסיכומים של אחרים, דירוג, מועדפים ומחיקה של סיכומים אישיים.</li>
            <li><strong>✅ משימות:</strong> יצירת משימות לפי סטטוס, עריכה, מחיקה, וסינון משימות לפי קורס.</li>
            <li><strong>📊 דשבורד:</strong> גרפים ונתונים סטטיסטיים אישיים, מעקב אחר פעילות.</li>
            <li><strong>💬 קהילה:</strong> פרסום פוסטים, צפייה בתגובות, ומחיקת פוסטים שלך.</li>
            <li><strong>⚙️ הגדרות:</strong> עדכון פרטי המשתמש, שינוי סיסמה, התנתקות.</li>
            <li><strong>🛡️ ניהול (אדמין בלבד):</strong> צפייה בכל המשתמשים והתכנים, מחיקת סיכומים או משתמשים, גישה לסטטיסטיקות האתר.</li>
          </ul>

          <div className={styles.contactForm}>
            <h2>פנייה לתמיכה במייל</h2>
            
            <textarea
              placeholder="כתוב את ההודעה שלך..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <button onClick={sendHelpRequest}>שלח פנייה</button>
            {status && <p className={status.includes("✅") ? styles.success : styles.error}>{status}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default Help;
