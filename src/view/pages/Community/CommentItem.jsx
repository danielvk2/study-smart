import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase-config";
import styles from "./Community.module.css";

const CommentItem = ({ comment, currentUser }) => {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  const currentName =
    currentUser?.fullName || currentUser?.displayName || currentUser?.email;
  const isMyComment = comment.userId === currentUser?.uid;
  const canDeleteComment = isMyComment || currentUser?.role === "admin";

  const handleReply = async () => {
    if (!replyText.trim()) return;

    const reply = {
      text: replyText,
      userName: currentName,
      createdAt: Timestamp.now(),
    };

    await updateDoc(doc(db, "communityPosts", comment.id), {
      replies: arrayUnion(reply),
    });

    setReplyText("");
    setShowReplyBox(false);
  };

  const handleDelete = async () => {
    if (window.confirm("למחוק את התגובה?")) {
      await deleteDoc(doc(db, "communityPosts", comment.id));
    }
  };

  const handleDeleteReply = async (reply) => {
    if (window.confirm("למחוק את התגובה הזו?")) {
      await updateDoc(doc(db, "communityPosts", comment.id), {
        replies: arrayRemove(reply),
      });
    }
  };

  return (
    <div className={styles.comment}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{comment.userName}</strong>
        {canDeleteComment && (
          <button onClick={handleDelete} className={styles.deleteButton}>
            🗑️
          </button>
        )}
      </div>

      <p>{comment.text}</p>

      <div className={styles.replySection}>
        {comment.replies?.map((reply, index) => (
          <div key={index} className={styles.reply}>
            <strong>{reply.userName}</strong>
            <p>{reply.text}</p>
            {(reply.userName === currentName || currentUser?.role === "admin") && (
              <button
                onClick={() => handleDeleteReply(reply)}
                className={styles.deleteButton}
              >
                🗑️
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          className={styles.replyButton}
        >
          הגב
        </button>

        {showReplyBox && (
          <div className={styles.replyForm}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="כתוב תגובה לתגובה..."
            />
            <button onClick={handleReply}>שלח תגובה</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
