/**
 * UNIBUD Original Filters — 15 signature looks, never copied from Instagram/TikTok.
 * Each filter is a CSS filter string that can be applied to images and video previews.
 * Intensity scales each numeric parameter proportionally (0 = none, 1 = full).
 */

export const UNIBUD_FILTERS = [
  { id: "natural", label: "Natural", css: "none", swatch: "transparent" },
  { id: "warm", label: "Warm", css: "sepia(0.20) saturate(1.20) hue-rotate(-10deg) brightness(1.02)", swatch: "#F5C99B" },
  { id: "cool", label: "Cool", css: "hue-rotate(10deg) saturate(0.90) brightness(1.05)", swatch: "#9BC1E8" },
  { id: "campus", label: "Campus", css: "saturate(1.15) contrast(1.05) brightness(1.02)", swatch: "#C8E6C9" },
  { id: "vintage", label: "Vintage", css: "sepia(0.30) contrast(1.10) brightness(0.95) saturate(0.90)", swatch: "#D4A76A" },
  { id: "portrait", label: "Portrait", css: "brightness(1.08) contrast(0.96) saturate(1.10)", swatch: "#F8D7DA" },
  { id: "study", label: "Study", css: "brightness(1.05) saturate(0.95) contrast(1.03)", swatch: "#E8EAF6" },
  { id: "lecture", label: "Lecture", css: "brightness(0.98) contrast(1.10) saturate(0.88)", swatch: "#CFD8DC" },
  { id: "library", label: "Library", css: "sepia(0.15) brightness(1.03) contrast(1.05) saturate(0.95)", swatch: "#D7CCC8" },
  { id: "coffee", label: "Coffee", css: "sepia(0.25) saturate(1.10) brightness(1.02) contrast(1.03)", swatch: "#BCAAA4" },
  { id: "golden", label: "Golden Hour", css: "sepia(0.20) saturate(1.30) hue-rotate(-15deg) brightness(1.08) contrast(1.05)", swatch: "#FFD54F" },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.10) brightness(1.02)", swatch: "#E0E0E0" },
  { id: "film", label: "Film", css: "sepia(0.20) contrast(1.15) saturate(0.82) brightness(0.97)", swatch: "#A1887F" },
  { id: "soft", label: "Soft Light", css: "brightness(1.08) contrast(0.92) saturate(1.05) blur(0.3px)", swatch: "#F5F5F5" },
  { id: "cinematic", label: "Cinematic", css: "contrast(1.15) saturate(1.10) brightness(0.95) sepia(0.08)", swatch: "#37474F" },
];

/**
 * Scales a CSS filter string by intensity (0–1).
 * "none" or intensity 0 returns "none".
 */
export function applyIntensity(filterCss, intensity) {
  if (!filterCss || filterCss === "none" || intensity <= 0) return "none";
  if (intensity >= 1) return filterCss;
  return filterCss.replace(/(\w+)\(([^)]+)\)/g, (_match, fn, args) => {
    const scaled = args
      .split(/\s+/)
      .map((arg) => {
        const num = parseFloat(arg);
        if (isNaN(num)) return arg;
        return (num * intensity).toFixed(3);
      })
      .join(" ");
    return `${fn}(${scaled})`;
  });
}

/**
 * Builds a combined CSS filter from a selected UNIBUD filter + manual adjustments.
 * adjustments: { brightness, contrast, saturation, warmth } — each 0–2 (1 = default)
 */
export function buildCombinedCss(filterId, intensity, adjustments = {}) {
  const filterDef = UNIBUD_FILTERS.find((f) => f.id === filterId);
  const baseCss = filterDef ? applyIntensity(filterDef.css, intensity) : "none";

  const parts = [];
  if (baseCss !== "none") parts.push(baseCss);

  const { brightness, contrast, saturation, warmth } = adjustments;
  if (brightness && brightness !== 1) parts.push(`brightness(${brightness.toFixed(2)})`);
  if (contrast && contrast !== 1) parts.push(`contrast(${contrast.toFixed(2)})`);
  if (saturation && saturation !== 1) parts.push(`saturate(${saturation.toFixed(2)})`);
  if (warmth && warmth !== 0) {
    const sepia = Math.abs(warmth) * 0.3;
    const hue = warmth > 0 ? -10 : 10;
    parts.push(`sepia(${sepia.toFixed(3)}) hue-rotate(${hue}deg)`);
  }

  return parts.length > 0 ? parts.join(" ") : "none";
}

/**
 * Bakes a CSS filter into an image blob via canvas.
 * Returns a Promise<Blob>.
 */
export async function bakeFilterToImage(imageUrl, filterCss, rotation = 0) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const isRotated = rotation === 90 || rotation === 270;
      canvas.width = isRotated ? img.height : img.width;
      canvas.height = isRotated ? img.width : img.height;
      const ctx = canvas.getContext("2d");

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.filter = filterCss === "none" ? "none" : filterCss;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas conversion failed"));
      }, "image/jpeg", 0.92);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = imageUrl;
  });
}