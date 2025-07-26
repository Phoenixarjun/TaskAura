import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <footer 
      className={styles.footer}
      style={{
        backgroundColor: colors.secondaryBg,
        borderTop: `1px solid ${colors.primaryBorder}`,
      }}
    >
      <div className={styles.footerContent}>
        <div 
          className={styles.footerBrand}
          style={{ color: colors.primaryText }}
        >
          <img src="/LogoTransparent.png" alt="TaskAura Logo" className={styles.logo} />
          <span className={styles.brandText}>TaskAura</span>
        </div>
        <div 
          className={styles.footerText}
          style={{ color: colors.secondaryText }}
        >
          © 2025 TaskAura | Built by Naresh
        </div>
        <div className={styles.links}>
          <a
            href="https://github.com/naresh1318/TaskAura"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            style={{ color: colors.accentText }}
          >
            GitHub
          </a>
          <a
            href="https://docs.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            style={{ color: colors.accentText }}
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 