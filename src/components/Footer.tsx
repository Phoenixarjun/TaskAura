import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          <img src="/Logo.png" alt="TaskAura Logo" className={styles.logo} />
          <span className={styles.brandText}>TaskAura</span>
        </div>
        <div className={styles.footerText}>
          © 2025 TaskAura | Built by Naresh
        </div>
        <div className={styles.links}>
          <a
            href="https://github.com/naresh1318/TaskAura"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHub
          </a>
          <a
            href="https://docs.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 