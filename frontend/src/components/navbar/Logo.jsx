import { Link } from "react-router";
import styles from "./Logo.module.css";
import { Database } from "lucide-react";

export function Logo() {
  return (
    <Link className={styles.logo} to={"/"}>
      <span className={styles.icon}>
        <Database />
      </span>
      <span>Days Gone Wiki</span>
    </Link>
  );
}
