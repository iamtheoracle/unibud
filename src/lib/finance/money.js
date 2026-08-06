// Money helpers — currency-agnostic formatting
export const money = (n, currency = "NGN") => `${currency === "NGN" ? "₦" : currency + " "}${(Number(n) || 0).toLocaleString()}`;
export const toCents = (n) => Math.round((Number(n) || 0) * 100);
export const fromCents = (c) => (Number(c) || 0) / 100;
export const sum = (arr, pick = (x) => x.amount) => arr.reduce((s, x) => s + (Number(pick(x)) || 0), 0);