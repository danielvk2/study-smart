import styles from "./Help.module.css";

const Help = () => {
  const faqs = [
    {
      question: "איך אני מוסיף סיכום חדש?",
      answer: "ניתן להיכנס לעמוד 'סיכומים' וללחוץ על כפתור ➕ הוסף סיכום.",
    },
    {
      question: "איך עורכים משימה קיימת?",
      answer: "בכניסה לעמוד 'משימות', לחץ על המשימה שברצונך לערוך.",
    },
    {
      question: "איך מתנתקים מהמערכת?",
      answer: "תוכל להיכנס לעמוד 'הגדרות' וללחוץ על כפתור 🚪 התנתק.",
    },
  ];

  return (
    <div className={styles.container}>
      <h1>🆘 מרכז העזרה</h1>

      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faq}>
            <p className={styles.question}>❓ {faq.question}</p>
            <p className={styles.answer}>💬 {faq.answer}</p>
          </div>
        ))}
      </div>

      <div className={styles.contact}>
        <p>לא מצאת תשובה? אפשר לפנות אלינו:</p>
        <button className="primary">📨 צור קשר עם התמיכה</button>
      </div>
    </div>
  );
};

export default Help;
