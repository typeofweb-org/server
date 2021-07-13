import { memo } from 'react';

import styles from './Header.module.scss';

type HeaderProps = {
  toggleMenuOpened: () => void;
};

const Header = memo<HeaderProps>(({ toggleMenuOpened }) => {
  return (
    <header className={styles.header}>
      <img className={styles.menuIcon} src="/icons/menu.svg" alt="Menu" onClick={toggleMenuOpened} />
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

export { Header };
