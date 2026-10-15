import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/employees', label: 'Employees' },
  { to: '/employees/add', label: 'Add Employee' },
  { to: '/employees/remove', label: 'Remove Employee' },
  { to: '/hierarchy', label: 'Hierarchy' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-logo" aria-hidden="true">EM</span>
          Employee Management
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <nav
          id="main-navigation"
          className={`navbar-links ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            // "end" makes /employees highlight only on /employees, not on /employees/add too.
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
