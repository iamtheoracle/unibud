// Heavy libs (html2canvas ~190KB + jsPDF ~290KB) are dynamically imported only when
// an export is actually requested, keeping the report's initial chunk tiny.
let _hc, _pdf;
const loadHtml2Canvas = async () => (_hc ??= (await import("html2canvas")).default);
const loadJsPdf = async () => (_pdf ??= (await import("jspdf")).jsPDF);

async function render(node) {
  const [html2canvas] = await Promise.all([loadHtml2Canvas()]);
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  return html2canvas(node, { scale: 2, backgroundColor: bg, useCORS: true, logging: false });
}

/** Exports the report node to a multi-page A4 PDF. */
export async function exportReportPdf(node) {
  if (!node) return;
  const [canvas, jsPDF] = await Promise.all([render(node), loadJsPdf()]);
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

/** Shares the report node as an image via the Web Share API, or copies to clipboard. */
export async function shareReport(node) {
  if (!node) return { available: false, message: "Nothing to share." };
  try {
    const canvas = await render(node);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return { available: false, message: "Could not generate image." };

    const file = new File([blob], "academic-report.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "Academic Summary Report", files: [file] });
      return { available: true, message: "Shared." };
    }
    if (navigator.share) {
      await navigator.share({ title: "Academic Summary Report" });
      return { available: true, message: "Shared." };
    }
    await navigator.clipboard.writeText(window.location.href);
    return { available: true, message: "Report link copied to clipboard." };
  } catch (e) {
    if (e?.name === "AbortError") return { available: true, message: "Share cancelled." };
    return { available: false, message: "Sharing not available on this device." };
  }
}