"use client";

import OCRButton from "@/components/OCRButton";
import LetterForm from "@/components/LetterForm";
import { useState } from "react";

type Letter = {
  id: string;
  type: "incoming" | "outgoing";
  letter_number: string | null;
  letter_date: string | null;
  subject: string | null;
  sender: string | null;
  recipient: string | null;
  ocr_processed_at: string | null;
};

type OCRResult = {
  letterNumber: string | null;
  letterDate: string | null;
  subject: string | null;
  sender: string | null;
  recipient: string | null;
};

export default function ReviewForm({ letter }: { letter: Letter }) {
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  return (
    <>
      <div className="mb-6 border-b border-gray-200 pb-6">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">
            Pembacaaan Otomatis
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Gunakan fitur ini untuk membaca teks dari dokumen secara otomatis.
          </p>
        </div>

        <OCRButton
          letterId={letter.id}
          hasOCR={Boolean(letter.ocr_processed_at)}
          onResult={setOcrResult}
        />
      </div>

      <LetterForm letter={letter} ocrResult={ocrResult} />
    </>
  );
}
