import styles from "./Community.module.css";
import { useState } from "react";

const Community = () => {
  const [posts, setPosts] = useState([
    { id: 1, author: "מאי ש.", content: "מישהו יכול להמליץ על סיכומים בפסיכולוגיה?" },
    { id: 2, author: "דניאל ו.", content: "העליתי סיכום חדש בקורס מבוא לתקשורת 📄" },
    { id: 3, author: "אייל מ.", content: "בהצלחה לכולם במבחן מחר!" },
  ]);

  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (newPost.trim() === "") return;
    const post = {
      id: Date.now(),
      author: "אתה",
      content: newPost,
    };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div className={styles.container}>
      <h1>קהילה</h1>

      <div className={styles.newPost}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="כתוב פוסט חדש לקהילה..."
        />
        <button onClick={handlePost}>פרסם</button>
      </div>

      <div className={styles.posts}>
        {posts.map((post) => (
          <div key={post.id} className={styles.post}>
            <strong>{post.author}:</strong>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
