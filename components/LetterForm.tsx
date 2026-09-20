"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Letter = {
  id: string;
  type: "incoming" | "outgoing";
  letter_number: string | null;
  letter_date: string | null;
  subject: string | null;
  sender: string | null;
  recipient: string | null;
};

type Props = {
  letter: Letter;
};

export default function LetterForm({ letter }: Props) {
  const router = useRouter();

  const [type, setType] = useState<"incoming" | "outgoing">(letter.type);

  const [letterNumber, setLetterNumber] = useState(letter.letter_number ?? "");

  const [letterDate, setLetterDate] = useState(letter.letter_date ?? "");

  const [subject, setSubject] = useState(letter.subject ?? "");

  const [sender, setSender] = useState(letter.sender ?? "");

  const [recipient, setRecipient] = useState(letter.recipient ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    setIsSaving(true);

    const { error } = await supabase
      .from("letters")
      .update({
        type,
        letter_number: letterNumber || null,
        letter_date: letterDate || null,
        subject: subject || null,
        sender: type === "incoming" ? sender || null : null,
        recipient: type === "outgoing" ? recipient || null : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", letter.id);

    if (error) {
      console.error(error);
      setError("Gagal menyimpan data surat.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);

    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Jenis Surat */}
      <div>
        <label className="text-sm font-medium text-gray-900">Jenis Surat</label>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => setType("incoming")}
            className={[
              "flex-1 rounded-lg border px-4 py-3 text-sm",
              type === "incoming"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-700",
            ].join(" ")}
          >
            Surat Masuk
          </button>

          <button
            type="button"
            onClick={() => setType("outgoing")}
            className={[
              "flex-1 rounded-lg border px-4 py-3 text-sm",
              type === "outgoing"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 bg-white text-gray-700",
            ].join(" ")}
          >
            Surat Keluar
          </button>
        </div>
      </div>

      {/* Nomor */}
      <div>
        <label
          htmlFor="letter_number"
          className="text-sm font-medium text-gray-900"
        >
          Nomor Surat
        </label>

        <input
          id="letter_number"
          type="text"
          value={letterNumber}
          onChange={(e) => setLetterNumber(e.target.value)}
          placeholder="Contoh: 005/123/DISDIK/2026"
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Tanggal */}
      <div>
        <label
          htmlFor="letter_date"
          className="text-sm font-medium text-gray-900"
        >
          Tanggal Surat
        </label>

        <input
          id="letter_date"
          type="date"
          value={letterDate}
          onChange={(e) => setLetterDate(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Perihal */}
      <div>
        <label htmlFor="subject" className="text-sm font-medium text-gray-900">
          Perihal
        </label>

        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Perihal surat"
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
        />
      </div>

      {/* Asal */}
      {type === "incoming" && (
        <div>
          <label htmlFor="sender" className="text-sm font-medium text-gray-900">
            Asal Surat
          </label>

          <input
            id="sender"
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Nama instansi / pengirim"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>
      )}

      {/* Tujuan */}
      {type === "outgoing" && (
        <div>
          <label
            htmlFor="recipient"
            className="text-sm font-medium text-gray-900"
          >
            Tujuan Surat
          </label>

          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Nama instansi / penerima"
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Menyimpan..." : "Simpan Surat"}
      </button>
    </div>
  );
}
