import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-link">Home</NavLink>
      <NavLink to="/clients" className="nav-link">Clients</NavLink>
      <NavLink to="/reports" className="nav-link">Reports</NavLink>
      <NavLink to="/users" className="nav-link">Users</NavLink> |{' '}
    </nav>
  );
}

export default Navbar;
