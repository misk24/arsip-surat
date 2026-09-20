import UploadBox from "@/components/UploadBox";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Kembali
        </a>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold text-gray-900">Upload Surat</h1>

          <p className="mt-2 text-sm text-gray-500">
            Upload surat dalam format PDF, JPG, JPEG, atau PNG.
          </p>
        </div>

        <div className="mt-8">
          <UploadBox />
        </div>
      </div>
    </main>
  );
}
