import { useState } from "react";
import api from "../services/api";

function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const uploadFile = async () => {
    if (!file) {
      setMessage("Please select a PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/documents/upload", formData);
      setMessage(response.data.message);
    } catch {
      setMessage("Upload failed.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">📄 Upload Documents</h2>

      <input
        type="file"
        accept=".pdf"
        className="w-full text-sm"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />

      <button
        onClick={uploadFile}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium"
      >
        Upload PDF
      </button>

      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
    </div>
  );
}

export default UploadCard;
