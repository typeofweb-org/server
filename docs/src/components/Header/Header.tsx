import { memo } from 'react';

import styles from './Header.module.scss';

type HeaderProps = {
  toggleMenuOpened: () => void;
};

export const Header = memo<HeaderProps>(({ toggleMenuOpened }) => {
  return (
    <header className={styles.header}>
      <button className={styles.toggleButton} onClick={toggleMenuOpened}>
        <span className={styles.srOnly}>Toggle reference sidebar</span>
        <img className={styles.menuIcon} src="/icons/menu.svg" alt="Menu" />
      </button>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <a className={styles.navAnchor} href="#">
              Documentation
            </a>
          </li>
          <li className={styles.navItem}>
            <a className={styles.navAnchor} href="#">
              API
            </a>
          </li>
          <li className={styles.navItem}>
            <a className={styles.navAnchor} href="#">
              Github
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
});
