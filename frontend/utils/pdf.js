// // src/utils/pdf.js
// import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
// import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

// GlobalWorkerOptions.workerSrc = pdfWorker;

// /**
//  * Extract text from a PDF given its URL.
//  * @param {string} url - Path to the PDF file
//  * @returns {Promise<string>} - Full text content of the PDF
//  */
// export async function extractPDFText(url) {
//   const loadingTask = getDocument(url);
//   const pdf = await loadingTask.promise;

//   let fullText = "";

//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i);
//     const textContent = await page.getTextContent();
//     const pageText = textContent.items.map(item => item.str).join(" ");
//     fullText += pageText + "\n";
//   }

//   return fullText;
// }
 // src/utils/pdf.js
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";

// Set PDF.js worker
GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extract text from a PDF given its URL.
 * @param {string} url - Path or URL to the PDF file
 * @returns {Promise<string>} - Full text content of the PDF
 */
export async function extractPDFText(url) {
  try {
    const loadingTask = getDocument(url);
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Ensure we only join valid string items
      const pageText = textContent.items
        .map(item => (item.str ? item.str : ""))
        .join(" ");

      fullText += pageText + "\n\n"; // double newline for better separation
    }

    return fullText;
  } catch (err) {
    console.error("Error extracting PDF text:", err);
    return ""; // return empty string on failure
  }
}
