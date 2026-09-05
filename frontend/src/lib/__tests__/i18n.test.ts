import { describe, expect, it } from "vitest";
import { DICT, translate } from "@/lib/i18n";

describe("i18n dictionary", () => {
  it("has every key in both languages", () => {
    for (const key of Object.keys(DICT.zh)) {
      expect(DICT.en[key as keyof typeof DICT.en], `missing en: ${key}`).toBeTypeOf("string");
    }
    expect(Object.keys(DICT.zh).length).toBe(Object.keys(DICT.en).length);
  });

  it("translates a key in both languages", () => {
    expect(translate("zh", "app.title")).toBe("Atlas 保險決策桌");
    expect(translate("en", "app.title")).toBe("Atlas Insurance Decision Desk");
  });
});
