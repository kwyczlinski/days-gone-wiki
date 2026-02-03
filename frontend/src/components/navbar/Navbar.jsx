import { ProfileButton } from "./ProfileButton";
import { Search } from "./Search";
import { Logo } from "./Logo";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  return (
    <nav className={styles.navbar + " navbar-root"}>
      <Search className="navbar-search" />
      <Logo className="navbar-logo" />
      <ProfileButton className="navbar-profile" />
    </nav>
  );
};
