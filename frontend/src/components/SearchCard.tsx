import { useState } from "react";
import api from "../services/api";

type SearchResult = {
  text: string;
  filename: string;
  chunk_id: number;
  distance: number;
};

function SearchCard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchDocuments = async () => {
    if (!query.trim()) return;

    const response = await api.get("/documents/search", {
      params: {
        query,
        top_k: 3,
      },
    });

    setResults(response.data.results);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">🔍 Search Documents</h2>

      <input
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
        placeholder="Search documents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={searchDocuments}
        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium"
      >
        Search
      </button>

      <div className="mt-4 space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm"
          >
            <p className="font-semibold">
              {result.filename} — Chunk {result.chunk_id}
            </p>
            <p className="mt-2 text-gray-700">{result.text.slice(0, 250)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchCard;
