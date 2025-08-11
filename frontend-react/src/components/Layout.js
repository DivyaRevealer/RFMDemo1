import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import { FaBars, FaBullseye, FaPlusCircle, FaPlayCircle, FaSignOutAlt, FaListAlt  } from 'react-icons/fa';
import { FaBars, FaBullseye, FaSignOutAlt, FaPlusCircle, FaPlayCircle, FaChartBar, FaListAlt  } from 'react-icons/fa';
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
        {/* Top group: toggle + nav links */}
        <div className="sidebar-top">
          <button className="icon-btn toggle-btn" onClick={toggleSidebar} title={collapsed ? 'Expand' : 'Collapse'}>
            <FaBars />
          </button>

          <Link to="/dashboard" className="icon-btn nav-btn" title="Dashboard">
            <FaBullseye />
          </Link>

          <Link to="/campaign-dashboard" className="nav-btn" title="Campaign Dashboard">
            <FaChartBar />
          </Link>

          <Link to="/create-campaign" className="icon-btn nav-btn" title="Create Campaign">
            <FaPlusCircle />
          </Link>

          <Link to="/campaign-summary" className="icon-btn nav-btn" title="Campaign Summary">
            <FaListAlt />
          </Link>

          <Link to="/run-campaign" className="icon-btn nav-btn" title="Run Campaign">
            <FaPlayCircle />
          </Link>
        </div>

        {/* Bottom group: logout */}
        <div className="sidebar-bottom">
          <button className="icon-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="header">
          RFM Analysis
        </header>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
