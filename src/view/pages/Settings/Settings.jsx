import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase-config";
import { useUser } from "../../../context/UserContext";
import styles from "./Settings.module.css";

const Settings = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    currentPassword: false,
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    newPassword: "",
    currentPassword: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!auth.currentUser) return;

        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({ ...data, email: auth.currentUser.email });
          setFormData({
            fullName: data.fullName || "",
            email: auth.currentUser.email || "",
            newPassword: "",
            currentPassword: "",
          });
        }
      } catch (err) {
        console.error("שגיאה בשליפת פרטי משתמש:", err);
      }
    };

    fetchUser();
  }, []);

  // ✅ שינוי קטן: רץ רק פעם אחת במקום בלולאה אין-סופית
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.emailVerified) return;

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { email: user.email });

        const updatedUser = {
          uid: user.uid,
          fullName: currentUser?.fullName || "",
          email: user.email,
          role: currentUser?.role || "user",
        };

        setCurrentUser(updatedUser);
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

        if (updatedUser.role === "admin") {
          await setDoc(doc(db, "settings", "adminConfig"), {
            adminEmail: user.email,
          });
        }

        console.log("✅ המייל עודכן בהצלחה גם ב-Firestore");
      } catch (err) {
        console.error("❌ שגיאה בעדכון מייל ב-Firestore:", err);
      }
    });

    return () => unsubscribe();
  }, []); // ✅ רק זה שונה

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("loggedInUser");
      setCurrentUser(null);
      navigate("/login");
    } catch (error) {
      console.error("שגיאה בהתנתקות:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (!auth.currentUser) {
        alert("אין משתמש מחובר כרגע. נסה להתחבר שוב.");
        return;
      }

      if (formData.currentPassword.length < 6) {
        alert("אנא הזן סיסמה נוכחית תקינה (לפחות 6 תווים)");
        return;
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        fullName: formData.fullName,
      });

      if (formData.email !== auth.currentUser.email) {
        await verifyBeforeUpdateEmail(auth.currentUser, formData.email);
        alert("נשלח מייל אישור לכתובת החדשה. יש לאשר אותו כדי להשלים את העדכון.");
        return;
      }

      if (formData.newPassword.length >= 6) {
        await updatePassword(auth.currentUser, formData.newPassword);
      }

      const updatedUser = {
        uid: auth.currentUser.uid,
        fullName: formData.fullName,
        email: formData.email,
        role: currentUser?.role || "user",
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setUserData((prev) => ({
        ...prev,
        fullName: formData.fullName,
        email: formData.email,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("שגיאה בעדכון הפרופיל:", error);
      alert("שגיאה בעדכון הפרופיל: " + error.message);
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      fullName: userData?.fullName || "",
      email: userData?.email || currentUser?.email || "",
      newPassword: "",
      currentPassword: "",
    }));
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!userData) return <p>טוען נתונים...</p>;

  return (
    <div className={styles["settings-container"]}>
      <div className={styles["settings-card"]}>
        <h2>הגדרות משתמש</h2>

        <div className={styles["user-info"]}>
          <div>
            <strong>שם:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={styles["input-inline"]}
              />
            ) : (
              userData.fullName
            )}
          </div>

          <div>
            <strong>מייל:</strong>{" "}
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles["input-inline"]}
              />
            ) : (
              userData.email || currentUser?.email
            )}
          </div>

          {isEditing && (
            <>
              <div>
                <strong>סיסמה חדשה:</strong>
                <div className={styles["password-wrapper"]}>
                  <input
                    type={showPassword.newPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="לפחות 6 תווים"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={styles["input-inline"]}
                  />
                  <span
                    className={styles["eye-icon"]}
                    onMouseDown={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        newPassword: true,
                      }))
                    }
                    onMouseUp={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        newPassword: false,
                      }))
                    }
                  >
                    👁️
                  </span>
                </div>
              </div>
              <div>
                <strong>סיסמה נוכחית:</strong>
                <div className={styles["password-wrapper"]}>
                  <input
                    type={showPassword.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    placeholder="חובה לאימות"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={styles["input-inline"]}
                  />
                  <span
                    className={styles["eye-icon"]}
                    onMouseDown={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        currentPassword: true,
                      }))
                    }
                    onMouseUp={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        currentPassword: false,
                      }))
                    }
                  >
                    👁️
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={handleLogout} className={styles["logout-btn"]}>
            התנתק
          </button>

          {isEditing ? (
            <>
              <button onClick={handleSave} className={styles["edit-btn"]}>
                שמור
              </button>
              <button onClick={handleCancel} className={styles["edit-btn"]}>
                ביטול
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={styles["edit-btn"]}
            >
              ערוך פרופיל
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
