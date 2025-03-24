// src/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <header className="header">
      <nav>
        <div className="logo">
          <h1>TidyDoc</h1>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Accueil</Link></li>
          <li><Link to="/services">Services</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default NavBar;
