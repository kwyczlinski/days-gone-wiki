import { Link } from "react-router-dom";
import styles from "./Search.module.css";

export const Dropdown = ({ data }) => {
  return (
    <ul className={styles.dropdown}>
      {data &&
        data.map(({ name, category, id, ...rest }) => {
          const path = rest.noClick ? "" : `/${category}/${id}`;
          const key = rest.noClick ? id : `${category}-${id}`;
          const content = (
            <div className={styles.dropdownItemContent}>
              <div className={styles.dropdownItemName}>{name}</div>
              <div className={styles.dropdownItemCategory}>{category}</div>
            </div>
          );

          return (
            <li key={key} className={styles.dropdownItem}>
              {!rest.noClick ? (
                <Link to={path} className={styles.dropdownItemLink}>
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
    </ul>
  );
};
