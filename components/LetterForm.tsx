"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Letter = {
  id: string;
  type: "incoming" | "outgoing";
  letter_number: string | null;
  letter_date: string | null;
  subject: string | null;
  sender: string | null;
  recipient: string | null;
};

type LetterFormProps = {
  letter: Letter;
};

export default function LetterForm({ letter }: LetterFormProps) {
  const router = useRouter();

  const [type, setType] = useState<"incoming" | "outgoing">(letter.type);

  const [letterNumber, setLetterNumber] = useState(letter.letter_number ?? "");

  const [letterDate, setLetterDate] = useState(letter.letter_date ?? "");

  const [subject, setSubject] = useState(letter.subject ?? "");

  const [sender, setSender] = useState(letter.sender ?? "");

  const [recipient, setRecipient] = useState(letter.recipient ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Sinkronkan form dengan data terbaru
   * setelah OCR memperbarui database.
   */
  useEffect(() => {
    setType(letter.type);
    setLetterNumber(letter.letter_number ?? "");
    setLetterDate(letter.letter_date ?? "");
    setSubject(letter.subject ?? "");
    setSender(letter.sender ?? "");
    setRecipient(letter.recipient ?? "");
  }, [
    letter.type,
    letter.letter_number,
    letter.letter_date,
    letter.subject,
    letter.sender,
    letter.recipient,
  ]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("letters")
        .update({
          type,

          letter_number: letterNumber.trim() || null,

          letter_date: letterDate || null,

          subject: subject.trim() || null,

          sender: type === "incoming" ? sender.trim() || null : null,

          recipient: type === "outgoing" ? recipient.trim() || null : null,

          updated_at: new Date().toISOString(),
        })
        .eq("id", letter.id);

      if (error) {
        throw error;
      }

      setSuccess("Data surat berhasil disimpan.");

      router.refresh();
    } catch (error) {
      console.error(error);

      setError("Data surat gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          Jenis Surat
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("incoming")}
            className={[
              "rounded-lg border px-4 py-2.5 text-sm font-medium transition",
              type === "incoming"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400",
            ].join(" ")}
          >
            Surat Masuk
          </button>

          <button
            type="button"
            onClick={() => setType("outgoing")}
            className={[
              "rounded-lg border px-4 py-2.5 text-sm font-medium transition",
              type === "outgoing"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400",
            ].join(" ")}
          >
            Surat Keluar
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="letter-number"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Nomor Surat
        </label>

        <input
          id="letter-number"
          type="text"
          value={letterNumber}
          onChange={(event) => setLetterNumber(event.target.value)}
          placeholder="Contoh: 123/ABC/IX/2026"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900"
        />
      </div>

      <div>
        <label
          htmlFor="letter-date"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Tanggal Surat
        </label>

        <input
          id="letter-date"
          type="date"
          value={letterDate}
          onChange={(event) => setLetterDate(event.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900"
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Perihal
        </label>

        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Contoh: Undangan Rapat"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900"
        />
      </div>

      {type === "incoming" && (
        <div>
          <label
            htmlFor="sender"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Asal / Pengirim
          </label>

          <input
            id="sender"
            type="text"
            value={sender}
            onChange={(event) => setSender(event.target.value)}
            placeholder="Contoh: Dinas Pendidikan"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900"
          />
        </div>
      )}

      {type === "outgoing" && (
        <div>
          <label
            htmlFor="recipient"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Tujuan / Penerima
          </label>

          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="Contoh: Kecamatan Selong"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900"
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Menyimpan..." : "Simpan Data Surat"}
      </button>
    </form>
  );
}
