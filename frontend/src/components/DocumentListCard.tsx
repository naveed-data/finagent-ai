import { useState } from "react";
import api from "../services/api";

type DocumentItem = {
  filename: string;
  chunk_count: number;
  uploaded_at: string;
};

function DocumentListCard() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/documents");
      setDocuments(response.data.documents);
    } catch {
      setMessage("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (filename: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${filename}?`
    );

    if (!confirmed) return;

    setDeletingFile(filename);

    try {
      await api.delete(`/documents/${filename}`);
      setMessage(`${filename} deleted successfully.`);
      await loadDocuments();
    } catch {
      setMessage("Failed to delete document.");
    } finally {
      setDeletingFile("");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📁 Document History</h2>

        <button
          onClick={loadDocuments}
          disabled={loading}
          className="bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-green-700">{message}</p>}

      {!loading && documents.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
          No documents found. Upload a loan application PDF to get started.
        </div>
      )}

      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{doc.filename}</p>
              <p className="text-sm text-gray-500">Chunks: {doc.chunk_count}</p>
              <p className="text-xs text-gray-400">{doc.uploaded_at}</p>
            </div>

            <button
              onClick={() => deleteDocument(doc.filename)}
              disabled={deletingFile === doc.filename}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm"
            >
              {deletingFile === doc.filename ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentListCard;
