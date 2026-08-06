import { describe, it, expect } from "vitest";
import { money, toCents, fromCents, sum } from "@/lib/finance/money";

describe("money", () => {
  it("formats NGN with the naira sign and thousands separators", () => {
    expect(money(1500)).toBe("₦1,500");
    expect(money(0)).toBe("₦0");
    expect(money(1234567)).toBe("₦1,234,567");
  });

  it("formats other currencies with the code prefix", () => {
    expect(money(1500, "USD")).toBe("USD 1,500");
  });

  it("treats non-numeric input as zero without throwing", () => {
    expect(money(undefined)).toBe("₦0");
    expect(money(null)).toBe("₦0");
    expect(money("abc")).toBe("₦0");
  });

  it("round-trips through cents without floating-point drift", () => {
    expect(fromCents(toCents(19.99))).toBe(19.99);
    expect(toCents(0.1 + 0.2)).toBe(30);
  });

  it("sums an array by a picker, defaulting to .amount", () => {
    expect(sum([{ amount: 10 }, { amount: 5 }])).toBe(15);
    expect(sum([{ fee: 10 }, { fee: 7 }], (x) => x.fee)).toBe(17);
    expect(sum([], (x) => x.amount)).toBe(0);
  });
});