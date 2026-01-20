import { useEffect, useRef, useState } from "react";
const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
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
        setData(json);
      })
      .catch((err) => setError(err.message));

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData(null);
      return;
    }
    fetchSearch(debouncedQuery.trim());
  }, [debouncedQuery]);

  useEffect(() => {
    setError(null);
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
      <h2>Days Gone DB results</h2>

      {error && <div className="error">❌ Error: {error}</div>}

      {!data && !error && <div>⏳ Waiting for input...</div>}

      {data &&
        (data.length === 0 ? (
          <div>Nothing was found</div>
        ) : (
          <div>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        ))}
    </div>
  );
}

export default App;
