import { Routes, Route } from "react-router-dom";
import Navbar from "./view/components/Navbar/Navbar";
import Home from "./view/pages/Home/Home";
import Summaries from "./view/pages/Summaries/Summaries";
import Tasks from "./view/pages/Tasks/Tasks";
import Dashboard from "./view/pages/Dashboard/Dashboard";
import Community from "./view/pages/Community/Community";
import Courses from "./view/pages/Courses/Courses";
import Settings from "./view/pages/Settings/Settings";
import Help from "./view/pages/Help/Help";
import "./App.css";

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
