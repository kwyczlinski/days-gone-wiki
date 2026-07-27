import { useUserCtx } from "../../contexts/UserContext";
import { ProfileButton } from "./ProfileButton";
import { Search } from "./Search";
import { Logo } from "./Logo";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  const { user, isLoading } = useUserCtx();

  return (
    <nav className={styles.navbar + " navbar-root"}>
      <Search className="navbar-search" />
      <Logo className="navbar-logo" />
      
      {!isLoading && user?.username && (
        <span className={styles.username}>
          Welcome, {user.username}
        </span>
      )}
      
      <ProfileButton className="navbar-profile" />
    </nav>
  );
};