const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "danielvkn21@gmail.com",
    pass: "adnv ambj pyyk uzzz", // אל תשאיר פומבי אם תעלה ל־GitHub
  },
});

exports.sendHelpEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { userEmail, message } = req.body;

    if (!userEmail || !message) {
      return res.status(400).send("Missing userEmail or message");
    }

    try {
      const settingsDoc = await admin.firestore()
        .collection("settings")
        .doc("adminConfig")
        .get();

      if (!settingsDoc.exists) {
        return res.status(404).send("Admin email config not found");
      }

      const ADMIN_EMAIL = settingsDoc.data().adminEmail;

      const mailOptions = {
        from: `"StudySmart Support" <danielvkn21@gmail.com>`,
        to: ADMIN_EMAIL,
        replyTo: userEmail,
        subject: "פנייה חדשה מהמערכת",
        text: `משתמש ${userEmail} שלח את ההודעה הבאה:\n\n${message}`,
      };

      await mailTransport.sendMail(mailOptions);

      await admin.firestore().collection("help_logs").add({
        userEmail,
        message,
        createdAt: admin.firestore.Timestamp.now(),
      });

      return res.status(200).send("Email sent successfully");
    } catch (error) {
      console.error("❌ שגיאה בשליחת מייל:", error.message, error.stack);
      return res.status(500).send("Failed to send email");
    }
  });
});
