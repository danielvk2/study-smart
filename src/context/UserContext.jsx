import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase-config";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubscribeSnapshot = onSnapshot(
          doc(db, "users", user.uid),
          async (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              const tokenResult = await user.getIdTokenResult(true);
              const updatedUser = {
                uid: user.uid,
                email: user.email,
                fullName: userData?.fullName || "",
                role: userData?.role || (tokenResult.claims.admin ? "admin" : "user"),
              };
              setCurrentUser(updatedUser);
              localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
              setLoadingUser(false);
            }
          }
        );

        return () => unsubscribeSnapshot();
      } else {
        setCurrentUser(null);
        localStorage.removeItem("loggedInUser");
        setLoadingUser(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
