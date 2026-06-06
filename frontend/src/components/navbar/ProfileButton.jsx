import { useUserCtx } from "../../contexts/UserContext";
import styles from "./ProfileButton.module.css";

export function ProfileButton() {
  const { isAuthenticated, login, logout } = useUserCtx();

  return (
    <div tabIndex="0" className={styles.container}>
      <div className={styles.icon}>
        <span>👤</span>
      </div>

      <div className={styles.dropdown}>
        {isAuthenticated ? (
            <button onClick={logout} className={styles.dropdownItem}>
              Log out
            </button>
        ) : (
          <button onClick={login} className={styles.dropdownItem}>
            Log in
          </button>
        )}
      </div>
    </div>
  );
}