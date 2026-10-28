// 日程の並べ替えと表示。Vercel のサーバーは UTC で動くので、「今日」は必ず日本時間で決める

export type Scheduled = { visitDate: string | null; visitTime: string | null };

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** 日本時間の今日（YYYY-MM-DD） */
export function todayInTokyo(now: Date = new Date()): string {
  // en-CA は YYYY-MM-DD の形で出る
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function sortKey(item: Scheduled): string {
  // 時刻のない予定は、その日の時刻つきの予定より前に並べる
  return `${item.visitDate} ${item.visitTime ?? ""}`;
}

/** 日程のあるものを「今日から先（近い順）」と「過ぎたもの（新しい順）」に分ける */
export function splitSchedule<T extends Scheduled>(
  items: T[],
  today: string,
): { upcoming: T[]; past: T[] } {
  const dated = items.filter((item) => item.visitDate);
  const upcoming = dated
    .filter((item) => item.visitDate! >= today)
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const past = dated
    .filter((item) => item.visitDate! < today)
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  return { upcoming, past };
}

/** 「11月3日(火) 10:00」の形にする。年が今年と違うときは年も付ける */
export function formatVisit(
  date: string,
  time: string | null,
  today: string,
): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const year = date.slice(0, 4) === today.slice(0, 4) ? "" : `${y}年`;
  return `${year}${m}月${d}日(${weekday})${time ? ` ${time}` : ""}`;
}

/** 今日から何日後か（今日は 0、過去はマイナス） */
export function daysUntil(date: string, today: string): number {
  const toUtc = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(date) - toUtc(today)) / 86_400_000);
}
