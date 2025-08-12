import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBullseye, FaSignOutAlt, FaPlusCircle, FaPlayCircle, FaChartBar } from 'react-icons/fa';
import './Layout.css';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(c => !c);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        {/* collapse/expand button */}
        <button
          className="toggle-btn"
          onClick={toggleSidebar}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <FaBars />
        </button>

        {/* Dashboard icon */}
        <Link to="/dashboard" className="nav-btn" title="Dashboard">
          <FaBullseye />
        </Link>

        <Link to="/campaign-dashboard" className="nav-btn" title="Campaign Dashboard">
          <FaChartBar />
        </Link>

        <Link to="/createcampaign" className="nav-btn" title="Create Campaign">
            <FaPlusCircle/>
        </Link>
        <Link to="/runcampaign" className="nav-btn" title="Run Campaign">
            <FaPlayCircle/>
        </Link>

        {/* Logout icon */}
        <button
          className="nav-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt />
        </button>
      </aside>

      {/* <div className="main">
        <header className="header">
          Target Achievement Analysis
        </header>
        <div className="content">
          {children}
        </div>
      </div> */}
    </div>
  );
}
