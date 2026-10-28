// 場所の登録・編集フォームの検証。画面に出すエラーは項目ごとに返す

export type PlaceInput = {
  name: string;
  categoryId: string | null;
  address: string | null;
  url: string | null;
  memo: string | null;
  visitDate: string | null;
  visitTime: string | null;
};

export type PlaceField = keyof PlaceInput;

export type ParseResult =
  | { ok: true; value: PlaceInput }
  | { ok: false; errors: Partial<Record<PlaceField, string>> };

export const LIMITS = {
  name: 100,
  address: 200,
  url: 500,
  memo: 1000,
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function length(value: string): number {
  return [...value].length;
}

/** 実在する日付か（2 月 30 日などを弾く） */
export function isValidDate(value: string): boolean {
  const match = DATE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/** http / https の URL だけを許す（`javascript:` などのリンクを作らせない） */
export function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parsePlaceForm(form: FormData): ParseResult {
  const errors: Partial<Record<PlaceField, string>> = {};

  const name = text(form, "name");
  if (!name) errors.name = "名前を入力してください";
  else if (length(name) > LIMITS.name)
    errors.name = `名前は ${LIMITS.name} 文字以内にしてください`;

  const categoryId = text(form, "categoryId");
  if (categoryId && !UUID.test(categoryId))
    errors.categoryId = "カテゴリを選び直してください";

  const address = text(form, "address");
  if (length(address) > LIMITS.address)
    errors.address = `住所は ${LIMITS.address} 文字以内にしてください`;

  const url = text(form, "url");
  if (url && !isSafeUrl(url))
    errors.url = "http:// か https:// で始まる URL を入力してください";
  else if (length(url) > LIMITS.url)
    errors.url = `URL は ${LIMITS.url} 文字以内にしてください`;

  const memo = text(form, "memo");
  if (length(memo) > LIMITS.memo)
    errors.memo = `メモは ${LIMITS.memo} 文字以内にしてください`;

  const visitDate = text(form, "visitDate");
  if (visitDate && !isValidDate(visitDate))
    errors.visitDate = "日付が正しくありません";

  const visitTime = text(form, "visitTime");
  if (visitTime && !TIME.test(visitTime))
    errors.visitTime = "時刻が正しくありません";
  else if (visitTime && !visitDate)
    errors.visitTime = "時刻だけでなく日付も入れてください";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      categoryId: categoryId || null,
      address: address || null,
      url: url || null,
      memo: memo || null,
      visitDate: visitDate || null,
      visitTime: visitTime || null,
    },
  };
}
