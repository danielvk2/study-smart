import styles from "./Summaries.module.css";

const Summaries = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>סיכומים</h1>
        <button className={styles.addButton}>➕ הוסף סיכום</button>
      </div>

      <input
        type="text"
        className={styles.search}
        placeholder="חפש סיכום לפי נושא או קורס"
      />

      <div className={styles.cards}>
        <div className={styles.card}>📄 סיכום לדוגמה 1</div>
        <div className={styles.card}>📄 סיכום לדוגמה 2</div>
        <div className={styles.card}>📄 סיכום לדוגמה 3</div>
      </div>
    </div>
  );
};

export default Summaries;
