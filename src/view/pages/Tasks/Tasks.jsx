import styles from "./Tasks.module.css";

const Tasks = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>משימות</h1>
        <button className={styles.addButton}>➕ הוסף משימה</button>
      </div>

      <div className={styles.taskList}>
        <div className={styles.task}>משימה 1</div>
        <div className={styles.task}>משימה 2</div>
        <div className={styles.task}>משימה 3</div>
      </div>
    </div>
  );
};

export default Tasks;
