import { Routes, Route } from "react-router-dom";
import Navbar from "./view/components/Navbar/Navbar";
import Home from "./view/pages/Home/Home";
import Summaries from "./view/pages/Summaries/Summaries";
import Tasks from "./view/pages/Tasks/Tasks";
import Dashboard from "./view/pages/Dashboard/Dashboard";
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
        </Routes>
      </div>
    </div>
  );
};

export default App;
