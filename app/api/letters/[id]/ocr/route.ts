import { parseLetterText } from "@/lib/parse-letter";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    //1. Ambil data surat
    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .select("*")
      .eq("id", id)
      .single();

    if (letterError || !letter) {
      return NextResponse.json(
        { error: "Surat tidak ditemukan." },
        { status: 404 },
      );
    }

    //2. Jangan OCR ulang kalau sudah pernah diproses
    if (letter.ocr_processed_at) {
      return NextResponse.json({
        success: true,
        text: letter.ocr_text ?? "",
        parsed: {
          letterNumber: letter.letter_number,
          letterDate: letter.letter_date,
          subject: letter.subject,
          sender: letter.sender,
          recipient: letter.recipient,
        },
        cached: true,
      });
    }

    //3. Download file dari Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("letters")
      .download(letter.file_path);

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: "File surat tidak ditemukan." },
        { status: 404 },
      );
    }

    //4. Siapkan request ke OCR.space API
    const formData = new FormData();

    formData.append("apikey", process.env.OCR_SPACE_API_KEY ?? "");
    formData.append("file", fileData, letter.file_name);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2");

    //5. Kirim request ke OCR.space API
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("OCR service error.");
    }

    const result = await response.json();

    //6. Cek error dari OCR.space API
    if (result.IsErroredOnProcessing) {
      const message = Array.isArray(result.ErrorMessage)
        ? result.ErrorMessage.join(", ")
        : result.ErrorMessage;

      throw new Error(message || "OCR gagal memproses dokumen.");
    }

    //7. Ambil teks hasil OCR
    const parsedText =
      result.ParsedResults?.map(
        (item: { ParsedText?: string }) => item.ParsedText ?? "",
      )
        .join("\n\n")
        .trim() ?? "";

    if (!parsedText) {
      throw new Error("Tidak ada teks yang terdeteksi.");
    }

    const parsedLetter = parseLetterText(parsedText);

    //8. Simpan hasil OCR ke database
    const { error: updateError } = await supabase
      .from("letters")
      .update({
        ocr_text: parsedText,
        ocr_processed_at: new Date().toISOString(),

        letter_number: parsedLetter.letterNumber,
        letter_date: parsedLetter.letterDate,
        subject: parsedLetter.subject,
        sender: parsedLetter.sender,
        recipient: parsedLetter.recipient,
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    //9. Kembalikan hasil OCR ke frontend
    return NextResponse.json({
      success: true,
      text: parsedText,
      parsed: parsedLetter,
      cached: false,
    });
  } catch (error) {
    console.error("OCR Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memproses OCR.",
      },
      { status: 500 },
    );
  }
}
