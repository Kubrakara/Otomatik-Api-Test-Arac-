"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return alert("Lütfen bir JSON dosyası seçin");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8000/upload-swagger", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const testRes = await axios.post("http://localhost:8000/run-tests");
      const filename = testRes.data.saved_as;

      router.push(`/result?file=${filename}`);
    } catch (err) {
      console.error(err);
      alert("Yükleme veya test işlemi başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Swagger Dosyası Yükle</h1>
      <input
        type="file"
        accept=".json"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Yükleniyor..." : "Test Başlat"}
      </button>
    </div>
  );
}
