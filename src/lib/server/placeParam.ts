import "server-only";
import { getPlace, type Place } from "./places";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** URL の id から場所を読む。形が UUID でなければ DB に問い合わせずに null（Postgres のエラーを避ける） */
export async function getPlaceOrNull(id: string): Promise<Place | null> {
  return UUID.test(id) ? getPlace(id) : null;
}
