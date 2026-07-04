import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";

type DocumentItem = {
  filename: string;
  chunk_count: number;
  uploaded_at?: string;
};

type RecentDocumentsProps = {
  onRequireAuth: () => void;
};

function RecentDocuments({ onRequireAuth }: RecentDocumentsProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState("");
  const [downloadingFile, setDownloadingFile] = useState("");

  const loadDocuments = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/documents");
      setDocuments(response.data.documents || []);
    } catch {
      setMessage("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const deleteDocument = async (filename: string) => {
    const confirmed = window.confirm(`Delete ${filename}?`);
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

  const downloadDocument = async (filename: string) => {
    setDownloadingFile(filename);

    try {
      const response = await api.get(
        `/documents/${encodeURIComponent(filename)}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage("Failed to download document.");
    } finally {
      setDownloadingFile("");
    }
  };

  if (!user) {
    return (
      <Card
        title="📄 Uploaded Documents"
        subtitle="Documents indexed in FinAgent AI."
      >
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500 space-y-3">
          <p>Sign in to view and manage your uploaded documents.</p>
          <button
            onClick={onRequireAuth}
            className="bg-white hover:bg-neutral-200 text-black px-5 py-2 rounded-full text-sm font-medium"
          >
            Sign In
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="📄 Uploaded Documents"
      subtitle="Documents indexed in FinAgent AI."
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={loadDocuments}
          disabled={loading}
          className="bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800/50 disabled:text-neutral-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-emerald-400">{message}</p>}

      {!loading && documents.length === 0 && (
        <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center text-neutral-500">
          No uploaded documents found.
        </div>
      )}

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.filename}
            className="border border-neutral-800 rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-neutral-100">{doc.filename}</p>
              <p className="text-sm text-neutral-400">
                Chunks: {doc.chunk_count}
              </p>
              <p className="text-xs text-neutral-500">
                {doc.uploaded_at || "Stored in vector database"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {doc.filename.toLowerCase().endsWith(".pdf") && (
                <button
                  onClick={() => downloadDocument(doc.filename)}
                  disabled={downloadingFile === doc.filename}
                  className="bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800/50 disabled:text-neutral-500 text-neutral-200 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {downloadingFile === doc.filename
                    ? "Downloading..."
                    : "Download"}
                </button>
              )}

              <button
                onClick={() => deleteDocument(doc.filename)}
                disabled={deletingFile === doc.filename}
                className="bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white px-4 py-2 rounded-lg text-sm"
              >
                {deletingFile === doc.filename ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default RecentDocuments;
