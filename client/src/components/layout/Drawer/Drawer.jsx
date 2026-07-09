import React from 'react';
import { NavLink } from 'react-router-dom';

const Drawer = ({ drawerOpen, setDrawerOpen }) => {
  return (
    <div 
      className={`drawer ${drawerOpen ? 'open' : ''}`} 
      id="drawer" 
      aria-hidden={!drawerOpen}
    >
      <NavLink to="/" onClick={() => setDrawerOpen(false)}>Home</NavLink>
      <NavLink to="/about" onClick={() => setDrawerOpen(false)}>About Us</NavLink>
      <NavLink to="/partners" className="drawer-sub" onClick={() => setDrawerOpen(false)}>Partners</NavLink>
      <NavLink to="/solutions" onClick={() => setDrawerOpen(false)}>Solutions</NavLink>
      <NavLink to="/blogs" onClick={() => setDrawerOpen(false)}>Blogs</NavLink>
      <NavLink to="/experience" className="drawer-sub" onClick={() => setDrawerOpen(false)}>Experience Centre</NavLink>
      <NavLink to="/ewaste" className="drawer-sub" onClick={() => setDrawerOpen(false)}>E-Waste Management</NavLink>
      <NavLink to="/contact" onClick={() => setDrawerOpen(false)}>Contact</NavLink>
      <div className="drawer-meta">
        <span className="label">India · Africa · Poland</span>
      </div>
    </div>
  );
};

export default Drawer;
