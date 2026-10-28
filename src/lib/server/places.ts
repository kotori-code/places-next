import "server-only";
import type { PlaceInput } from "@/lib/placeForm";
import { db } from "./db";

export type Category = { id: string; name: string };

export type Place = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  address: string | null;
  url: string | null;
  memo: string | null;
  visitDate: string | null;
  visitTime: string | null;
  visited: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

type PlaceRow = {
  id: string;
  name: string;
  category_id: string | null;
  categories: { name: string } | null;
  address: string | null;
  url: string | null;
  memo: string | null;
  visit_date: string | null;
  visit_time: string | null;
  visited: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

const PLACE_COLUMNS = "*, categories(name)";

function toPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? null,
    address: row.address,
    url: row.url,
    memo: row.memo,
    visitDate: row.visit_date,
    // Postgres の time は "10:00:00" で返るので、分までにする
    visitTime: row.visit_time ? row.visit_time.slice(0, 5) : null,
    visited: row.visited,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: PlaceInput) {
  return {
    name: input.name,
    category_id: input.categoryId,
    address: input.address,
    url: input.url,
    memo: input.memo,
    visit_date: input.visitDate,
    visit_time: input.visitTime,
  };
}

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase: ${result.error.message}`);
  return result.data;
}

export async function listPlaces(
  filter: { categoryId?: string; visited?: boolean } = {},
): Promise<Place[]> {
  let query = (await db())
    .from("places")
    .select(PLACE_COLUMNS)
    .order("created_at", { ascending: false });
  if (filter.categoryId) query = query.eq("category_id", filter.categoryId);
  if (filter.visited !== undefined) query = query.eq("visited", filter.visited);
  return (check(await query) as PlaceRow[]).map(toPlace);
}

export async function listScheduled(): Promise<Place[]> {
  const result = await (await db())
    .from("places")
    .select(PLACE_COLUMNS)
    .not("visit_date", "is", null);
  return (check(result) as PlaceRow[]).map(toPlace);
}

export async function getPlace(id: string): Promise<Place | null> {
  const result = await (await db())
    .from("places")
    .select(PLACE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  const row = check(result) as PlaceRow | null;
  return row ? toPlace(row) : null;
}

export async function listCategories(): Promise<Category[]> {
  const result = await (await db())
    .from("categories")
    .select("id, name")
    .order("sort")
    .order("name");
  return check(result) as Category[];
}

/** カテゴリごとの件数（「行った」ものも含む）。カテゴリなしは id が null */
export async function countByCategory(): Promise<Map<string | null, number>> {
  const rows = check(await (await db()).from("places").select("category_id")) as {
    category_id: string | null;
  }[];
  const counts = new Map<string | null, number>();
  for (const row of rows)
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  return counts;
}

export async function createPlace(
  input: PlaceInput,
  member: string,
): Promise<string> {
  const result = await (await db())
    .from("places")
    .insert({ ...toRow(input), created_by: member, updated_by: member })
    .select("id")
    .single();
  return (check(result) as { id: string }).id;
}

export async function updatePlace(
  id: string,
  input: PlaceInput,
  member: string,
): Promise<void> {
  check(
    await (await db())
      .from("places")
      .update({
        ...toRow(input),
        updated_by: member,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id),
  );
}

export async function setVisited(
  id: string,
  visited: boolean,
  member: string,
): Promise<void> {
  check(
    await (await db())
      .from("places")
      .update({
        visited,
        updated_by: member,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id),
  );
}

export async function deletePlace(id: string): Promise<void> {
  check(await (await db()).from("places").delete().eq("id", id));
}
