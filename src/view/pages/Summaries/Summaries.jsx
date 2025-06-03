import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../../firebase-config";
import styles from "./Summaries.module.css";

const Summaries = () => {
  const [summaries, setSummaries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSummary, setNewSummary] = useState({
    title: "",
    course: "",
    note: "",
    file: null,
  });
  const [editingSummaryId, setEditingSummaryId] = useState(null);
  const [editData, setEditData] = useState({ title: "", course: "", note: "" });

  const fileInputRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const loggedRef = useRef(false); // דגל למניעת הוספות כפולות

  useEffect(() => {
    fetchSummaries();
    fetchFavorites();

    if (!loggedRef.current) {
      logPageVisit();
      loggedRef.current = true;
    }
  }, []);

  const logPageVisit = async () => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, "site_usage"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        page: "Summaries",
        timestamp: serverTimestamp(),
      });
      console.log("Entry added!");
    } catch (err) {
      console.error("שגיאה בלוג פעילות:", err);
    }
  };

  const fetchSummaries = async () => {
    const snapshot = await getDocs(collection(db, "public_summaries"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSummaries(data);
  };

  const fetchFavorites = async () => {
    const q = query(
      collection(db, "favorites"),
      where("userId", "==", currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => doc.data().summaryId);
    setFavorites(data);
  };

  const toggleFavorite = async (summaryId) => {
    const favRef = collection(db, "favorites");
    const q = query(
      favRef,
      where("summaryId", "==", summaryId),
      where("userId", "==", currentUser.uid)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      await deleteDoc(existing.docs[0].ref);
    } else {
      await addDoc(favRef, {
        summaryId,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
      });
    }

    fetchFavorites();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const { title, course, note, file } = newSummary;
    if (!title || !course || !file) {
      alert("נא למלא כותרת, קורס וקובץ");
      return;
    }

    const fileRef = ref(storage, `summaries/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const fileURL = await getDownloadURL(snapshot.ref);

    const summary = {
      title,
      course,
      note,
      fileURL,
      filePath: fileRef.fullPath,
      createdAt: Timestamp.now(),
      userId: currentUser.uid,
      author: {
        uid: currentUser.uid,
        name: currentUser.fullName,
      },
      rating: 0,
      ratingCount: 0,
    };

    await addDoc(collection(db, "public_summaries"), summary);

    setNewSummary({ title: "", course: "", note: "", file: null });
    if (fileInputRef.current) fileInputRef.current.value = "";

    alert("✅ הסיכום הועלה בהצלחה!");
    fetchSummaries();
  };

  const handleDelete = async (id, filePath) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הסיכום?")) return;
    await deleteDoc(doc(db, "public_summaries", id));
    await deleteObject(ref(storage, filePath));
    fetchSummaries();
  };

  const handleEditSubmit = async (e, summaryId) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "public_summaries", summaryId), {
        title: editData.title,
        course: editData.course,
        note: editData.note,
      });
      setEditingSummaryId(null);
      fetchSummaries();
    } catch (error) {
      alert("אירעה שגיאה בעדכון.");
    }
  };

  const handleStarRating = async (summaryId, score) => {
    const ratingRef = collection(db, "summary_ratings");
    const q = query(
      ratingRef,
      where("summaryId", "==", summaryId),
      where("userId", "==", currentUser.uid)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      alert("כבר דירגת את הסיכום הזה.");
      return;
    }

    const refDoc = doc(db, "public_summaries", summaryId);
    const snapshot = await getDoc(refDoc);
    const summary = snapshot.data();

    const newRating = (summary.rating || 0) + score;
    const newCount = (summary.ratingCount || 0) + 1;

    await updateDoc(refDoc, {
      rating: newRating,
      ratingCount: newCount,
    });

    await addDoc(ratingRef, {
      summaryId,
      userId: currentUser.uid,
      score,
      createdAt: Timestamp.now(),
    });

    fetchSummaries();
  };

  const renderStars = (rating, count) => {
    if (!count) return "☆☆☆☆☆";
    const avg = Math.round(rating / count);
    return "★★★★★".slice(0, avg) + "☆☆☆☆☆".slice(avg);
  };

  return (
    <div className={styles.container}>
      <h2>📄 העלאת סיכום חדש</h2>

      <form onSubmit={handleUpload} className={styles.form}>
        <input
          type="text"
          placeholder="כותרת הסיכום"
          value={newSummary.title}
          onChange={(e) => setNewSummary({ ...newSummary, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="שם הקורס"
          value={newSummary.course}
          onChange={(e) => setNewSummary({ ...newSummary, course: e.target.value })}
        />
        <textarea
          placeholder="הערה כללית (לא חובה)"
          value={newSummary.note}
          onChange={(e) => setNewSummary({ ...newSummary, note: e.target.value })}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setNewSummary({ ...newSummary, file: e.target.files[0] })}
        />
        <button type="submit">📤 העלה סיכום</button>
      </form>

      <hr />
      <h2>📚 סיכומים של כלל הסטודנטים</h2>

      <input
        type="text"
        placeholder="🔍 חיפוש לפי שם קורס"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}>
        {showOnlyFavorites ? "📄 הצג את כל הסיכומים" : "⭐ הצג רק מועדפים"}
      </button>

      <div className={styles.summaryList}>
        {summaries
          .filter((s) =>
            (!showOnlyFavorites || favorites.includes(s.id)) &&
            s.course.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((s) => (
            <div key={s.id} className={styles.summaryBox}>
              <h3>{s.title}</h3>
              <p>📘 קורס: {s.course}</p>
              {s.note && <p>📝 הערה: {s.note}</p>}
              <p>🧑‍🎓 נכתב על ידי: {s.author?.name}</p>
              <a href={s.fileURL} target="_blank" rel="noreferrer">📎 צפייה בקובץ</a>
              <p>⭐ דירוג: {renderStars(s.rating, s.ratingCount)} ({s.ratingCount})</p>

              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => handleStarRating(s.id, n)}>
                    {n}⭐
                  </button>
                ))}
              </div>

              <button onClick={() => toggleFavorite(s.id)}>
                {favorites.includes(s.id) ? "⭐ במועדפים" : "☆ הוסף למועדפים"}
              </button>

              {(currentUser.uid === s.author?.uid || currentUser.role === "admin") && (
                <>
                  {currentUser.uid === s.author?.uid && (
                    <button onClick={() => {
                      setEditingSummaryId(s.id);
                      setEditData({ title: s.title, course: s.course, note: s.note || "" });
                    }}>✏️ ערוך</button>
                  )}
                  <button onClick={() => handleDelete(s.id, s.filePath)}>🗑️ מחק</button>
                </>
              )}

              {editingSummaryId === s.id && (
                <form onSubmit={(e) => handleEditSubmit(e, s.id)} className={styles.editForm}>
                  <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} placeholder="כותרת" />
                  <input type="text" value={editData.course} onChange={(e) => setEditData({ ...editData, course: e.target.value })} placeholder="קורס" />
                  <textarea value={editData.note} onChange={(e) => setEditData({ ...editData, note: e.target.value })} placeholder="הערה כללית" />
                  <button type="submit">💾 שמור</button>
                  <button type="button" onClick={() => setEditingSummaryId(null)}>❌ ביטול</button>
                </form>
              )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default Summaries;
