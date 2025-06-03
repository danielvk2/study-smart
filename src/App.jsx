import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // ✅ חדש
import { auth } from "./firebase-config"; // ✅ חדש

import Home from "./view/pages/Home/Home";
import Login from "./view/pages/Login/Login";
import Register from "./view/pages/Register/Register";
import Dashboard from "./view/pages/Dashboard/Dashboard";
import Help from "./view/pages/Help/Help";
import Settings from "./view/pages/Settings/Settings";
import Admin from "./view/pages/Admin/Admin";
import Community from "./view/pages/Community/Community";
import Summaries from "./view/pages/Summaries/Summaries";
import Tasks from "./view/pages/Tasks/Tasks";
import Navbar from "./view/components/Navbar/Navbar";


import { useUser } from "./context/UserContext";

const App = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (storedUser) {
          setCurrentUser(storedUser);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("loggedInUser");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentUser]);

  const publicPaths = ["/", "/register"];
  const hideNavbar = publicPaths.includes(location.pathname);

  if (loading) return null;

  return (
    <div className="app">
      {currentUser && !hideNavbar && (
        <Navbar setCurrentUser={setCurrentUser} />
      )}

      <div className="content">
        <Routes>
          <Route path="/" element={<Login setCurrentUser={setCurrentUser} />} />
          <Route path="/register" element={<Register />} />
          {currentUser ? (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings setCurrentUser={setCurrentUser} />} />
              <Route path="/community" element={<Community />} />
              <Route path="/summaries" element={<Summaries />} />
              <Route path="/tasks" element={<Tasks />} />
              {currentUser.role === "admin" && (
                <Route path="/admin" element={<Admin />} />
              )}
              <Route path="*" element={<Navigate to="/home" />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
      </div>
    </div>
  );
};

export default App;
