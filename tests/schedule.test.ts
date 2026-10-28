import { describe, expect, it } from "vitest";
import { googleMapsUrl } from "@/lib/maps";
import {
  daysUntil,
  formatVisit,
  splitSchedule,
  todayInTokyo,
} from "@/lib/schedule";

describe("日本時間の今日", () => {
  it("UTC ではまだ前の日でも、日本時間で日付を決める", () => {
    // UTC 2026-10-26 15:30 = 日本時間 2026-10-27 0:30
    expect(todayInTokyo(new Date("2026-10-26T15:30:00Z"))).toBe("2026-10-27");
    expect(todayInTokyo(new Date("2026-10-26T14:59:00Z"))).toBe("2026-10-26");
  });
});

describe("日程の分け方", () => {
  const items = [
    { id: "past-old", visitDate: "2026-09-01", visitTime: null },
    { id: "today-pm", visitDate: "2026-10-26", visitTime: "15:00" },
    { id: "none", visitDate: null, visitTime: null },
    { id: "later", visitDate: "2026-12-24", visitTime: null },
    { id: "today-allday", visitDate: "2026-10-26", visitTime: null },
    { id: "today-am", visitDate: "2026-10-26", visitTime: "09:00" },
    { id: "yesterday", visitDate: "2026-10-25", visitTime: "10:00" },
  ];

  it("今日の予定は「これから」に入り、近い順・同じ日は時刻順に並ぶ", () => {
    const { upcoming } = splitSchedule(items, "2026-10-26");
    expect(upcoming.map((item) => item.id)).toEqual([
      "today-allday",
      "today-am",
      "today-pm",
      "later",
    ]);
  });

  it("過ぎた予定は新しい順に並び、日程のないものはどちらにも入らない", () => {
    const { past } = splitSchedule(items, "2026-10-26");
    expect(past.map((item) => item.id)).toEqual(["yesterday", "past-old"]);
  });
});

describe("日程の表示", () => {
  it("今年なら年を省き、曜日を付ける", () => {
    expect(formatVisit("2026-11-03", "10:00", "2026-10-26")).toBe(
      "11月3日(火) 10:00",
    );
    expect(formatVisit("2026-11-03", null, "2026-10-26")).toBe("11月3日(火)");
  });

  it("年が違えば年も出す", () => {
    expect(formatVisit("2027-01-02", null, "2026-10-26")).toBe(
      "2027年1月2日(土)",
    );
  });

  it("何日後か", () => {
    expect(daysUntil("2026-10-26", "2026-10-26")).toBe(0);
    expect(daysUntil("2026-11-03", "2026-10-26")).toBe(8);
    expect(daysUntil("2026-10-25", "2026-10-26")).toBe(-1);
    // 年をまたいでも数えられる
    expect(daysUntil("2027-01-01", "2026-12-31")).toBe(1);
  });
});

describe("Google マップのリンク", () => {
  it("名前と住所で検索する URL を作る", () => {
    expect(googleMapsUrl("上野動物園", "東京都台東区上野公園9-83")).toBe(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("上野動物園 東京都台東区上野公園9-83"),
    );
  });

  it("住所がなければ名前だけで検索する", () => {
    expect(googleMapsUrl("A&B カフェ", null)).toBe(
      "https://www.google.com/maps/search/?api=1&query=A%26B%20%E3%82%AB%E3%83%95%E3%82%A7",
    );
  });
});
