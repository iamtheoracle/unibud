import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function render(node) {
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  return html2canvas(node, { scale: 2, backgroundColor: bg, useCORS: true, logging: false });
}

/** Exports the report node to a multi-page A4 PDF. */
export async function exportReportPdf(node) {
  if (!node) return;
  const canvas = await render(node);
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height / canvas.width) * imgW;
  const img = canvas.toDataURL("image/png");
  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(img, "PNG", 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(img, "PNG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }
  pdf.save("Academics-Summary-Report.pdf");
}

/** Opens a clean print window containing only the report image. */
export async function printReport(node) {
  if (!node) return;
  const canvas = await render(node);
  const img = canvas.toDataURL("image/png");
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(
    `<!doctype html><html><head><title>Academics Summary Report</title><style>@page{margin:10mm}body{margin:0;background:#fff}img{width:100%;display:block}</style></head><body><img src="${img}"/></body></html>`
  );
  w.document.close();
  w.focus();
  await new Promise((r) => setTimeout(r, 400));
  w.print();
}

/** Future-ready share interface — returns capability info, no side effects yet. */
export function shareReport() {
  return { available: false, message: "Shareable report links arrive in a future update." };
}