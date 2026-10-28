import { describe, expect, it } from "vitest";
import { isValidDate, parsePlaceForm } from "@/lib/placeForm";

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("場所のフォーム", () => {
  it("名前だけで登録でき、空の項目は null になる", () => {
    const result = parsePlaceForm(
      form({ name: " 〇〇動物園 ", address: "", url: "" }),
    );
    expect(result).toEqual({
      ok: true,
      value: {
        name: "〇〇動物園",
        categoryId: null,
        address: null,
        url: null,
        memo: null,
        visitDate: null,
        visitTime: null,
      },
    });
  });

  it("名前がないとエラー", () => {
    const result = parsePlaceForm(form({ name: "  " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBeDefined();
  });

  it("javascript: などの URL は受け付けない", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,x",
      "ftp://example.com",
      "example.com",
    ]) {
      const result = parsePlaceForm(form({ name: "a", url }));
      expect(result.ok, url).toBe(false);
    }
    expect(
      parsePlaceForm(form({ name: "a", url: "https://example.com/menu" })).ok,
    ).toBe(true);
  });

  it("日付と時刻を受け付ける", () => {
    const result = parsePlaceForm(
      form({ name: "a", visitDate: "2026-11-03", visitTime: "10:30" }),
    );
    expect(result.ok && result.value.visitDate).toBe("2026-11-03");
    expect(result.ok && result.value.visitTime).toBe("10:30");
  });

  it("時刻だけでは登録できない", () => {
    const result = parsePlaceForm(form({ name: "a", visitTime: "10:30" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.visitTime).toBeDefined();
  });

  it("存在しない日付や形の違う値はエラー", () => {
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("2028-02-29")).toBe(true);
    expect(isValidDate("2026/11/03")).toBe(false);
    expect(
      parsePlaceForm(form({ name: "a", visitDate: "2026-13-01" })).ok,
    ).toBe(false);
    expect(
      parsePlaceForm(
        form({ name: "a", visitDate: "2026-11-03", visitTime: "25:00" }),
      ).ok,
    ).toBe(false);
  });

  it("カテゴリは UUID の形だけを受け付ける", () => {
    expect(
      parsePlaceForm(form({ name: "a", categoryId: "1; drop table" })).ok,
    ).toBe(false);
    expect(
      parsePlaceForm(
        form({ name: "a", categoryId: "0b6f2c1e-8f3a-4c2d-9e1b-2a3b4c5d6e7f" }),
      ).ok,
    ).toBe(true);
  });

  it("長すぎる値はエラー（文字数は絵文字も 1 文字で数える）", () => {
    expect(parsePlaceForm(form({ name: "🍰".repeat(100) })).ok).toBe(true);
    expect(parsePlaceForm(form({ name: "🍰".repeat(101) })).ok).toBe(false);
    expect(parsePlaceForm(form({ name: "a", memo: "x".repeat(1001) })).ok).toBe(
      false,
    );
  });
});
