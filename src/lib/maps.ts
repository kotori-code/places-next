// Google マップで場所を開くリンク（API キーのいらない検索用の URL）
export function googleMapsUrl(name: string, address: string | null): string {
  const query = address ? `${name} ${address}` : name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
