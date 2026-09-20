import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Arsip Surat
            </h1>

            <p className="mt-2 text-gray-600">Arsip surat masuk dan keluar.</p>
          </div>

          <Link
            href="/upload"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Upload Surat
          </Link>
        </div>
      </div>
    </main>
  );
}
