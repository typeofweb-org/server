import styles from './Header.module.scss';

const Header = () => (
  <header className={styles.header}>
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

export { Header };
