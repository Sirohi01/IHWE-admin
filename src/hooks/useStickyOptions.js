import { useEffect, useState } from "react";

// Dropdown options for server-paginated lists. Building them from the current page only makes
// the choices vanish as soon as a filter is applied, so every value ever seen is remembered.
export default function useStickyOptions(values) {
  const [seen, setSeen] = useState([]);
  const key = values.filter(Boolean).join("|");

  useEffect(() => {
    const incoming = values.filter(Boolean);
    if (incoming.some((v) => !seen.includes(v))) {
      setSeen((prev) => [...new Set([...prev, ...incoming])].sort((a, b) => String(a).localeCompare(String(b))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return seen;
}
