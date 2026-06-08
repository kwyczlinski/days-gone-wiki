import { useEffect, useState } from "react";
import { Dropdown } from "./SearchDropdown";
import styles from "./Search.module.css";

const API_URL = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL;

export const Search = () => {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const run = async () => {
      const q = debouncedQuery.trim()

      if (!q) {
        setData(null)
        return
      }

      try {
        const res = await fetch(`${API_URL}/search?query=${q}`)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

        const json = await res.json()

        if (json.length === 0) {
          setData([
            {
              category: "Try searching something else",
              id: "empty",
              noClick: true,
            },
          ])
        } else {
          setData(json)
        }
      } catch (err) {
        console.log(err)
        setData([
          {
            category: "Please try again later",
            id: "error",
            error: true,
            noClick: true,
          },
        ])
      }
    }

    run()
  }, [debouncedQuery])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className={styles.searchWrapper}>
      <search>
        <input
          className={styles.searchInput}
          type="search"
          name="search"
          value={query}
          placeholder="search"
          onChange={(e) => setQuery(e.target.value)}
        />
      </search>
      {data && <Dropdown data={data} />}
    </div>
  );
};
