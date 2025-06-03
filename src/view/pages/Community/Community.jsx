import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase-config";
import CommentItem from "./CommentItem";
import styles from "./Community.module.css";

const Community = () => {
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const loggedRef = useRef(false);

  const commentsRef = collection(db, "communityPosts");

  useEffect(() => {
    fetchComments();

    if (!loggedRef.current) {
      logPageVisit();
      loggedRef.current = true;
    }
  }, []);

  const fetchComments = () => {
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(data);
    });
    return () => unsubscribe();
  };

  const logPageVisit = async () => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, "site_usage"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        page: "Community",
        timestamp: serverTimestamp(),
      });
      console.log("Entry added!");
    } catch (err) {
      console.error("Error logging activity:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addDoc(commentsRef, {
      text: message,
      userId: currentUser.uid,
      userName:
        currentUser.fullName ||
        currentUser.displayName ||
        currentUser.email,
      createdAt: new Date(),
      replies: [],
    });

    setMessage("");
  };

  return (
    <div className={styles.container}>
      <h2>קהילה</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="כתוב משהו לקהילה..."
        />
        <button type="submit">פרסם</button>
      </form>

      <div className={styles.comments}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
};

export default Community;
