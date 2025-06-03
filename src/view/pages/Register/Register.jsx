import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      alert("אנא מלא את כל השדות");
      return;
    }

    if (password.length < 6) {
      alert("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
      });

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          uid: user.uid,
          email,
          fullName,
        })
      );

      alert("נרשמת בהצלחה!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleRegister}>
        <h2>הרשמה</h2>
        <input
          type="text"
          placeholder="שם מלא"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="סיסמה (מינימום 6 תווים)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">הרשמה</button>

        <p>
          כבר יש לך חשבון? <Link to="/login">לחץ כאן להתחברות</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
