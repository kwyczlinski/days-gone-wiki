import { useUserCtx } from "../../contexts/UserContext";
import { Link } from "react-router";
import styles from "./ProfileButton.module.css";

export function ProfileButton() {
  const { userId, clearUser } = useUserCtx();

  return (
    <div tabIndex="0" className={styles.container}>
      <div className={styles.icon}>
        <span>👤</span>
      </div>

      <div className={styles.dropdown}>
        {userId ? (
          <>
            <div>
              <Link to="/profile">Edit profile</Link>
            </div>
            <button onClick={clearUser}>Log out</button>
          </>
        ) : (
          <Link to="/login">Log in</Link>
        )}
      </div>
    </div>
  );
}
