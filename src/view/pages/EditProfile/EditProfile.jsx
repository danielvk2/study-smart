import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase-config";
import { useUser } from "../../../context/UserContext";




const EditProfile = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.fullName || "");
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      // עדכון ב-Firestore
      await updateDoc(doc(db, "users", currentUser.uid), {
        fullName: name,
      });

      // עדכון ב-Context (זה מה שגורם לשינוי להיראות בכל העמודים בלי לרענן!)
      const updatedUser = { ...currentUser, fullName: name };
      setCurrentUser(updatedUser);

      // שמירה גם ב-localStorage (כדי לא לאבד בין רענונים)
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

      navigate("/settings");
    } catch (error) {
      console.error("שגיאה בעדכון הפרופיל:", error);
    }
  };

  if (!currentUser) return <p>טוען...</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "500px", margin: "auto" }}>
      <h2>עריכת פרופיל</h2>
      <label>שם מלא:</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: "10px", marginTop: "10px" }}
      />
      <button
        onClick={handleSave}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        שמור שינויים
      </button>
    </div>
  );
};

export default EditProfile;
