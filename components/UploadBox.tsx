"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function UploadBox() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format file harus PDF, JPG, JPEG, atau PNG.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 10 MB.");
      return;
    }

    try {
      setIsUploading(true);

      const extension = file.name.split(".").pop()?.toLowerCase() ?? "file";

      const fileId = crypto.randomUUID();
      const filePath = `${fileId}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("letters")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data, error: insertError } = await supabase
        .from("letters")
        .insert({
          type: "incoming",
          file_path: filePath,
          file_name: file.name,
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      router.push(`/review/${data.id}`);
    } catch (error) {
      console.error(error);

      setError(
        "Surat gagal diupload. Periksa koneksi atau konfigurasi Supabase.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  return (
    <div>
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isUploading) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex min-h-72 cursor-pointer flex-col items-center justify-center",
          "rounded-2xl border-2 border-dashed p-8 text-center transition",
          isDragging
            ? "border-black bg-gray-100"
            : "border-gray-300 bg-white hover:border-gray-400",
          isUploading ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <div className="text-4xl">📄</div>

        {isUploading ? (
          <>
            <p className="mt-4 font-medium text-gray-900">
              Mengupload surat...
            </p>

            <p className="mt-1 text-sm text-gray-500">Tunggu sebentar.</p>
          </>
        ) : (
          <>
            <p className="mt-4 font-medium text-gray-900">Tarik file ke sini</p>

            <p className="mt-1 text-sm text-gray-500">atau</p>

            <button
              type="button"
              className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              Pilih File
            </button>

            <p className="mt-4 text-xs text-gray-400">
              PDF, JPG, JPEG, PNG · Maks. 10 MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf,image/jpeg,image/png,.jpg,.jpeg,.png"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
