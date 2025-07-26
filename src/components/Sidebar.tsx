import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, CalendarIcon, SunIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Weekly', path: '/weekly', icon: CalendarIcon },
  { name: 'Daily', path: '/daily', icon: SunIcon },
  { name: 'Learn', path: '/learn', icon: BookOpenIcon },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80 }}
        className="hidden md:flex flex-col w-24 bg-white/70 dark:bg-dark-bg/80 backdrop-blur-lg shadow-xl h-screen fixed top-0 left-0 z-40 border-r border-gray-200 dark:border-gray-800"
      >
        <div className="flex flex-col items-center gap-8 py-8">
          <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-8 tracking-tight">🧿</span>
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 ${active || isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shadow-lg scale-110' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500'}`
                }
              >
                <item.icon className="w-7 h-7 mb-1" />
                <span className="text-xs font-semibold tracking-tight">{item.name}</span>
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-bg/90 backdrop-blur-lg shadow-2xl border-t border-gray-200 dark:border-gray-800 flex justify-around py-2"
      >
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 ${active || isActive ? 'text-blue-600 dark:text-blue-300 scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500'}`
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-semibold tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </motion.nav>
    </>
  );
};

export default Sidebar; 