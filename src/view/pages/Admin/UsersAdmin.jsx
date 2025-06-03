import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase-config";
import styles from "./Admin.module.css";

const UsersAdmin = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    syncCurrentUserEmail(); // שלב חדש - לעדכן אם צריך
    fetchUsers();
  }, []);

  // בדיקה אם המייל של currentUser ב-Firestore שונה מהמייל שב-Auth
  const syncCurrentUserEmail = async () => {
    try {
      const authEmail = auth.currentUser?.email;
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const firestoreEmail = userDocSnap.data().email;
        if (firestoreEmail !== authEmail) {
          await updateDoc(userDocRef, { email: authEmail });
          console.log("📩 עודכן המייל של המשתמש במסמך Firestore");
        }
      }
    } catch (err) {
      console.error("שגיאה בעדכון אימייל במסמך Firestore:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    } catch (error) {
      console.error("שגיאה בהבאת משתמשים:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.uid) {
      alert("❌ לא ניתן למחוק את עצמך.");
      return;
    }

    if (!window.confirm("האם למחוק את המשתמש הזה?")) return;

    try {
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch("https://us-central1-study-smart-1e97e.cloudfunctions.net/deleteUserAndData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: userId }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      alert("✅ המשתמש נמחק בהצלחה");
      fetchUsers();
    } catch (err) {
      console.error("שגיאה במחיקת משתמש:", err);
      alert("❌ שגיאה במחיקה: " + err.message);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.fullName || u.displayName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.adminUsersWrapper}>
      <div className={styles.adminUsersContent}>
        <input
          type="text"
          placeholder="חיפוש לפי שם מלא"
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className={styles.desktopTable}>
          <thead>
            <tr>
              <th>מייל</th>
              <th>שם מלא</th>
              <th>תפקיד</th>
              <th>פעולה</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.fullName || u.displayName || "-"}</td>
                <td>{u.role || "משתמש"}</td>
                <td>
                  {u.id !== currentUser.uid && (
                    <button onClick={() => handleDeleteUser(u.id)}>🗑️</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.mobileCards}>
          {filteredUsers.map((u) => (
            <div className={styles.card} key={u.id}>
              <p><strong>שם:</strong> {u.fullName || u.displayName || "-"}</p>
              <p><strong>מייל:</strong> {u.email}</p>
              <p><strong>תפקיד:</strong> {u.role || "משתמש"}</p>
              {u.id !== currentUser.uid && (
                <button onClick={() => handleDeleteUser(u.id)}>🗑️ מחק</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersAdmin;
