// components/UploadPanel.tsx
"use client";
import { useState } from "react";

export default function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setFile(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        Admin — Upload Documents
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Upload PDF or TXT files to add to the knowledge base
      </p>

      {/* File input */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4 hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm font-medium text-gray-700">
            {file ? file.name : "Click to select a PDF or TXT file"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB`
              : "PDF and TXT files supported"}
          </p>
        </label>
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Uploading & Processing..." : "Upload Document"}
      </button>

      {/* Success message */}
      {message && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}