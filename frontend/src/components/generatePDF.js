import html2pdf from "html2pdf.js";

export const generatePDF = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  setTimeout(async () => {
    try {
      const worker = html2pdf()
        .from(element)
        .set({
          margin: 10,
          filename: `CarComparison-${Date.now()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        });

      await worker.toPdf();
      await worker.save(); // triggers download
      console.log('PDF Saved Successfully');
    } catch (err) {
      console.error('PDF Generation Error:', err);
    }
  }, 500); // small delay to ensure charts render properly
};
