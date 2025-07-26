import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Weekly from './pages/Weekly';
import Daily from './pages/Daily';
import Learn from './pages/Learn';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';

const PageFade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35, ease: 'easeInOut' }}
    className="w-full"
  >
    {children}
  </motion.div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<PageFade><Dashboard /></PageFade>} />
        <Route path="/weekly" element={<PageFade><Weekly /></PageFade>} />
        <Route path="/daily" element={<PageFade><Daily /></PageFade>} />
        <Route path="/learn" element={<PageFade><Learn /></PageFade>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
