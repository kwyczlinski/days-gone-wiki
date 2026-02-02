import { Link } from "react-router-dom";

export const Dropdown = ({ data }) => {
  return (
    <ul>
      {data &&
        data.map(({ name, category, id, ...rest }) => {
          const path = rest.noClick ? "" : `/${category}/${id}`;
          const key = rest.noClick ? id : `${category}-${id}`;
          const content = (
            <>
              <div>{name}</div>
              <div>{category}</div>
            </>
          );

          return (
            <li key={key}>
              {!rest.noClick ? <Link to={path}>{content}</Link> : content}
            </li>
          );
        })}
    </ul>
  );
};
