// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.deleteUserAndData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!token) {
      return res.status(401).send("Missing authorization token");
    }

    try {
      const decoded = await admin.auth().verifyIdToken(token);

      if (!decoded.admin) {
        return res.status(403).send("Not authorized - admin only");
      }

      const { uid } = req.body;
      if (!uid) {
        return res.status(400).send("Missing UID in request body");
      }

      await admin.auth().deleteUser(uid);
      await admin.firestore().collection("users").doc(uid).delete();

      return res.status(200).send("User deleted successfully");
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      return res.status(500).send("Internal Server Error");
    }
  });
});

exports.sendHelpEmail = require("./sendHelpEmail").sendHelpEmail;
