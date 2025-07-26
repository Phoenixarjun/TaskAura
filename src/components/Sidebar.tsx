import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, CalendarIcon, SunIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Weekly', path: '/weekly', icon: CalendarIcon },
  { name: 'Daily', path: '/daily', icon: SunIcon },
  { name: 'Learn', path: '/learn', icon: BookOpenIcon },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { colors } = useTheme();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80 }}
        className="sidebar-desktop"
        style={{
          backgroundColor: colors.secondaryBg,
          borderRight: `1px solid ${colors.primaryBorder}`,
        }}
      >
        <div className="sidebar-content">
          <span 
            className="sidebar-logo"
            style={{ color: colors.accentText }}
          >
            🧿
          </span>
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-item ${active || isActive ? 'sidebar-nav-active' : 'sidebar-nav-inactive'}`
                }
                style={({ isActive }) => ({
                  color: active || isActive ? colors.accentText : colors.tertiaryText,
                  backgroundColor: active || isActive ? `${colors.accentText}10` : 'transparent',
                })}
              >
                <item.icon className="sidebar-icon" />
                <span className="sidebar-text">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </motion.aside>
      
      {/* Mobile Bottom Nav */}
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80 }}
        className="sidebar-mobile"
        style={{
          backgroundColor: colors.secondaryBg,
          borderTop: `1px solid ${colors.primaryBorder}`,
        }}
      >
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-mobile-item ${active || isActive ? 'sidebar-mobile-active' : 'sidebar-mobile-inactive'}`
              }
              style={({ isActive }) => ({
                color: active || isActive ? colors.accentText : colors.tertiaryText,
              })}
            >
              <item.icon className="sidebar-mobile-icon" />
              <span className="sidebar-mobile-text">{item.name}</span>
            </NavLink>
          );
        })}
      </motion.nav>
    </>
  );
};

export default Sidebar; 