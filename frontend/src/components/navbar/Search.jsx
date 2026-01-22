import { useEffect, useRef, useState } from "react";
import { Dropdown } from "./Dropdown";

const API_URL = import.meta.env.VITE_API_URL;

export const Search = () => {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimeout = useRef(null);

  const fetchSearch = (query) =>
    fetch(`${API_URL}/search?query=${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        json.length === 0
          ? setData([
              {
                name: "No results found",
                category: "Try searching something else",
                id: "empty",
                noClick: true,
              },
            ])
          : setData(json);
      })
      .catch((err) => {
        setData([
          {
            name: "Please try again later",
            category: err.message,
            id: "error",
            error: true,
            noClick: true,
          },
        ]);
      });

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData(null);
      return;
    }
    fetchSearch(debouncedQuery.trim());
  }, [debouncedQuery]);

  useEffect(() => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedQuery(query);
      clearTimeout(debounceTimeout.current);
    }, 300);
  }, [query]);

  return (
    <div>
      <search>
        <input
          type="search"
          name="search"
          id="search"
          onChange={(e) => setQuery(e.target.value)}
        />
      </search>
      <Dropdown data={data} />
    </div>
  );
};
