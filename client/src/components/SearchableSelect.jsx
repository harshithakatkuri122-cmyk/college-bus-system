import React, { useState, useRef, useEffect } from "react";

export default function SearchableSelect({ items, placeholder = "Search...", onSelect, value, renderItem }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const filtered = items.filter((it) =>
    (it.name || it.routeName || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <input
        className="w-full border rounded p-2"
        value={query || (value && (value.name || value.routeName) ) || ""}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="absolute z-50 left-0 right-0 bg-white border rounded mt-1 max-h-48 overflow-auto shadow-lg">
          {filtered.map((it) => (
            <div
              key={it.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect && onSelect(it);
                setOpen(false);
                setQuery("");
              }}
            >
              {renderItem ? renderItem(it) : (it.name || it.routeName)}
            </div>
          ))}
          {filtered.length === 0 && <div className="p-3 text-sm text-gray-500">No results</div>}
        </div>
      )}
    </div>
  );
}

