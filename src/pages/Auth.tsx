import React from 'react';
import { motion } from 'framer-motion';
import Login from '../components/Login';
import './Auth.css';

const Auth: React.FC = () => {
  return (
    <div className="auth-container">
      {/* Background decoration */}
      <div className="background-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Content */}
      <div className="auth-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="auth-header"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="auth-title"
          >
            TaskAura
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="auth-subtitle"
          >
            Your personal productivity companion
          </motion.p>
        </motion.div>

        <Login onToggleMode={() => {}} />
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="auth-footer"
      >
        <p className="copyright">
          © 2024 TaskAura. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth; 