const admin = require("firebase-admin");

const serviceAccount = require("./admin-key.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const setAdminClaim = async () => {
  const uid = "3uQtcmqQl4XFVXw2ttco2gIUi752"; 
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log("Admin claim added!");
};

setAdminClaim();
