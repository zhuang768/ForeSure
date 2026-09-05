import { describe, expect, it } from "vitest";
import { fmtPct, fmtSeconds, fmtStamp, fmtUsd, shortHash } from "@/lib/format";

describe("format helpers", () => {
  it("formats USD without decimals and with separators", () => {
    expect(fmtUsd(41839.45)).toBe("USD 41,839");
    expect(fmtUsd(null)).toBe("—");
  });
  it("formats percent with two decimals", () => {
    expect(fmtPct(4.57)).toBe("4.57%");
    expect(fmtPct(undefined)).toBe("—");
  });
  it("shortens hashes", () => {
    expect(shortHash("0x0894aa11bb22cc33dd44ee55ff66778899aabbccddeeff00112233445566778899")).toBe("0x0894aa…8899");
    expect(shortHash(null)).toBe("—");
  });
  it("renders backend timestamps", () => {
    expect(fmtStamp("20260905_021824")).toBe("2026-09-05 02:18");
    expect(fmtStamp("garbage")).toBe("garbage");
  });
  it("renders seconds with one decimal", () => {
    expect(fmtSeconds(12.34)).toBe("12.3s");
  });
});
