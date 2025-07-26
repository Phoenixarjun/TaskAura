import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.css';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Weekly', path: '/weekly' },
  { name: 'Daily', path: '/daily' },
  { name: 'Learn', path: '/learn' },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className={styles.navbar}>
      <nav className={styles.inner}>
        <div className={styles.brand} onClick={() => navigate('/dashboard')}>
          <img src="/Logo.png" alt="TaskAura Logo" className={styles.logo} />
          <span className={styles.brandText}>TaskAura</span>
        </div>
        <div className={styles.links}>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
        <div className={styles.themeToggle}>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;