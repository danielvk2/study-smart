import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">StudySmart</h2>
      <ul className="nav-links">
  <li><Link to="/">בית</Link></li>
  <li><Link to="/summaries">סיכומים</Link></li>
  <li><Link to="/tasks">משימות</Link></li>
  <li><Link to="/dashboard">דשבורד</Link></li>
  <li><Link to="/community">קהילה</Link></li>
  <li><Link to="/courses">קורסים</Link></li>
  <li><Link to="/settings">הגדרות</Link></li>
  <li><Link to="/help">עזרה</Link></li>
      </ul>
    </div>
  );
};

export default Navbar;
