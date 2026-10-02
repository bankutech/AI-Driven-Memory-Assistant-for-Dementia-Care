import { useEffect, useState } from 'react';

// Global search across memories, people, events, reminders and contacts.
export function useGlobalSearch(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(res => {
          if (!res.ok) throw new Error(`Search failed (${res.status})`);
          return res.json();
        })
        .then(data => {
          if (active) {
            setResults(data);
            setError(null);
          }
        })
        .catch(err => {
          if (active) setError(err.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return { results, loading, error };
}

export default useGlobalSearch;
