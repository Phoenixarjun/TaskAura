import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import styles from './Navbar.module.css';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Weekly', path: '/weekly' },
  { name: 'Daily', path: '/daily' },
  { name: 'Learn', path: '/learn' },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggle = () => setMenuOpen((open) => !open);
  const handleNavClick = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header 
      className={styles.navbar}
      style={{
        backgroundColor: colors.secondaryBg,
        borderBottom: `1px solid ${colors.primaryBorder}`,
      }}
    >
      <nav className={styles.inner}>
        <div 
          className={styles.brand} 
          onClick={() => handleNavClick('/dashboard')}
          style={{ color: colors.primaryText }}
        >
          <img src="/LogoTransparent.png" alt="TaskAura Logo" className={styles.logo} />
          <span className={styles.brandText}>TaskAura</span>
        </div>
        <button
          className={styles.menuToggle}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={handleToggle}
        >
          {menuOpen ? (
            <XMarkIcon className={styles.menuIcon} />
          ) : (
            <Bars3Icon className={styles.menuIcon} />
          )}
        </button>
        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
              style={({ isActive }) => ({
                color: isActive ? colors.accentText : colors.secondaryText,
                backgroundColor: isActive ? `${colors.accentText}10` : 'transparent',
              })}
              onClick={() => handleNavClick(link.path)}
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