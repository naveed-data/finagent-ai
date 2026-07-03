import { useState } from "react";
import api from "../services/api";

type DocumentItem = {
  filename: string;
  chunk_count: number;
  uploaded_at: string;
};

function DocumentListCard() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const loadDocuments = async () => {
    const response = await api.get("/documents");
    setDocuments(response.data.documents);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 lg:col-span-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📁 Document History</h2>

        <button
          onClick={loadDocuments}
          className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 flex justify-between"
          >
            <div>
              <p className="font-semibold">{doc.filename}</p>
              <p className="text-sm text-gray-500">Chunks: {doc.chunk_count}</p>
            </div>

            <p className="text-xs text-gray-500">{doc.uploaded_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentListCard;
