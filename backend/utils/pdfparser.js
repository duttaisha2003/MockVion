import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractTextFromPDF(buffer) {
  try {
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjs.getDocument(uint8Array);
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map(item => item.str)
        .join(" ");

      fullText += pageText + "\n";
    }

    return fullText.trim();

  } catch (error) {
    console.error("PDF parsing failed:", error);
    throw new Error("Unable to extract text from PDF");
  }
}
