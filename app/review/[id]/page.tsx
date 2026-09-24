import ReviewForm from "@/components/ReviewForm";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReviewPage({ params }: Props) {
  const { id } = await params;

  const { data: letter, error } = await supabase
    .from("letters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !letter) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-900">Surat tidak ditemukan.</p>

          <Link
            href="/"
            className="mt-4 inline-block text-sm text-gray-500 underline"
          >
            Kembali
          </Link>
        </div>
      </main>
    );
  }

  const { data: fileData } = await supabase.storage
    .from("letters")
    .createSignedUrl(letter.file_path, 60 * 60);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Kembali ke Arsip
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Periksa Data Surat
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Periksa dan koreksi data sebelum menyimpan.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Preview */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-medium text-gray-900">Dokumen</h2>

              <p className="mt-1 truncate text-xs text-gray-500">
                {letter.file_name}
              </p>
            </div>

            <div className="min-h-150 bg-gray-100">
              {fileData?.signedUrl ? (
                letter.file_name.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={fileData.signedUrl}
                    title={letter.file_name}
                    className="h-175 w-full"
                  />
                ) : (
                  <div className="flex min-h-150 items-center justify-center p-4">
                    <img
                      src={fileData.signedUrl}
                      alt={letter.file_name}
                      className="max-h-175 max-w-full object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="flex min-h-150 items-center justify-center">
                  <p className="text-sm text-gray-500">
                    Preview tidak tersedia.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Form */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6">
            <ReviewForm letter={letter} />
          </section>
        </div>
      </div>
    </main>
  );
}
