import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { signOut } from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../../../firebase-config";
import { useUser } from "../../../context/UserContext";
import "./Navbar.css";

const Navbar = ({ setCurrentUser }) => {
  const { currentUser, loadingUser } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState("/profile.png");
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // נעול ועדין: שם משתמש
  useEffect(() => {
    if (!loadingUser && currentUser?.fullName) {
      setUsername(currentUser.fullName);
    }
  }, [loadingUser, currentUser?.fullName]);

  // טעינת תמונה ותפקיד
  useEffect(() => {
    if (!currentUser?.uid) return;

    setIsAdmin(currentUser.role === "admin");

    const localUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (localUser?.profileImageUrl) {
      setProfileImage(localUser.profileImageUrl);
    } else {
      const fetchImage = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const data = userDoc.data();
          if (data?.profileImageUrl) {
            setProfileImage(data.profileImageUrl);
            const updatedUser = { ...localUser, profileImageUrl: data.profileImageUrl };
            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("שגיאה בקבלת תמונת משתמש:", error);
        }
      };
      fetchImage();
    }
  }, [currentUser]);

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

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser?.uid) return;

    try {
      const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", currentUser.uid), {
        profileImageUrl: downloadURL,
      });

      const localUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const updatedUser = { ...localUser, profileImageUrl: downloadURL };
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setProfileImage(downloadURL);
    } catch (error) {
      console.error("שגיאה בהעלאת תמונה:", error);
    }
  };

  const handleRemoveProfileImage = async () => {
    if (!currentUser?.uid) return;

    try {
      const imageRef = ref(storage, `profileImages/${currentUser.uid}`);
      await deleteObject(imageRef).catch(() => {});

      await updateDoc(doc(db, "users", currentUser.uid), {
        profileImageUrl: null,
      });

      const localUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const updatedUser = { ...localUser };
      delete updatedUser.profileImageUrl;
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setProfileImage("/profile.png");
    } catch (error) {
      console.error("שגיאה בהסרת תמונת פרופיל:", error);
    }
  };

  return (
    <div className="sidebar">
      <h2 className="logo">StudySmart</h2>

      <div className="profile-pic-container" onClick={handleImageClick}>
        <img
          src={profileImage}
          alt="תמונת פרופיל"
          className="profile-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/profile.png";
          }}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <div className="profile-image-text">לחץ להעלאת תמונה</div>

        {profileImage !== "/profile.png" && (
          <button
            className="remove-button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveProfileImage();
            }}
          >
            הסר תמונה
          </button>
        )}
      </div>

      {username && <div className="greeting">👋 שלום, {username}</div>}

      <ul className="nav-links">
        <li><Link to="/home">בית</Link></li>
        <li><Link to="/summaries">סיכומים</Link></li>
        <li><Link to="/tasks">משימות</Link></li>
        <li><Link to="/dashboard">דשבורד</Link></li>
        <li><Link to="/community">קהילה</Link></li>
        <li><Link to="/settings">הגדרות</Link></li>
        <li><Link to="/help">עזרה</Link></li>
        {isAdmin && <li><Link to="/admin">מנהל</Link></li>}
      </ul>

      <button className="logout-button" onClick={handleLogout}>
        התנתקות
      </button>
    </div>
  );
};

export default Navbar;
