import html2pdf from "html2pdf.js";

export const generatePDF = (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID "${elementId}" not found.`);
        return;
    }

    html2pdf()
        .from(element)
        .set({
            margin: 10,
            filename: `CarComparison-${Date.now()}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        })
        .save()
        .then(() => console.log("PDF Saved Successfully"))
        .catch((err) => console.error("PDF Generation Error:", err));
};
