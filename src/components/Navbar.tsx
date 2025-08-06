import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
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
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleToggle = () => setMenuOpen((open) => !open);
  const handleNavClick = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className={styles.navbar}>
      <nav className={styles.inner}>
        <div 
          className={styles.brand} 
          onClick={() => handleNavClick('/dashboard')}
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
              onClick={() => handleNavClick(link.path)}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
        <div className={styles.rightSection}>
          <div className={styles.themeToggle}>
            <ThemeToggle />
          </div>
          {user && (
            <div className={styles.userSection}>
              <button
                onClick={toggleUserMenu}
                className={styles.userButton}
                aria-label="User menu"
              >
                <UserCircleIcon className={styles.userIcon} />
                <span className={styles.userName}>{user.name}</span>
              </button>
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <div className={styles.userInfo}>
                    <p className={styles.userEmail}>{user.email}</p>
                    <p className={styles.userName}>{user.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    <ArrowRightOnRectangleIcon className={styles.logoutIcon} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;