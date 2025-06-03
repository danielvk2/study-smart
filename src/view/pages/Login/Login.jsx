// Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ setCurrentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const tokenResult = await user.getIdTokenResult(true);
      console.log("claims:", tokenResult.claims);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      const userDataToStore = {
        uid: user.uid,
        email: user.email,
        fullName: userData?.fullName || "",
        role: userData?.role || (tokenResult.claims.admin ? "admin" : "user"),
      };

      localStorage.setItem("loggedInUser", JSON.stringify(userDataToStore));
      setCurrentUser(userDataToStore);

      alert("התחברת בהצלחה!");
      navigate("/home");
    } catch (err) {
      alert("שגיאה בהתחברות: " + err.message);
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("אנא הזן את כתובת האימייל שלך קודם");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("נשלח אליך מייל לאיפוס הסיסמה");
    } catch (error) {
      alert("שגיאה באיפוס הסיסמה: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin}>
        <h2>התחברות</h2>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">התחבר</button>

        <p className="forgot-password" onClick={handleResetPassword}>
          שכחת סיסמה?
        </p>

        <p>
          אין לך חשבון? <Link to="/register">לחץ כאן להרשמה</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;