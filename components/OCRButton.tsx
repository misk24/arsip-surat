"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OCRButtonProps = {
  letterId: string;
  hasOCR: boolean;
};

export default function OCRButton({ letterId, hasOCR }: OCRButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleOCR() {
    try {
      setIsProcessing(true);
      setError("");

      const response = await fetch(`/api/letters/${letterId}/ocr`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membaca teks.");
      }

      setText(result.text || "");
      router.refresh(); // Refresh halaman untuk menampilkan hasil OCR yang baru
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membaca teks.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div>
      {!text && (
        <button
          type="button"
          onClick={handleOCR}
          disabled={isProcessing}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing
            ? "Sedang membaca..."
            : hasOCR
              ? "Tampilkan hasil OCR"
              : "Baca Surat Otomatis"}
        </button>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {text && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Hasil Pembacaan</p>

            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Tutup
            </button>
          </div>

          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
