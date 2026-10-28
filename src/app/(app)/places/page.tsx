import Link from "next/link";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { PlaceCard } from "@/components/PlaceCard";
import { todayInTokyo } from "@/lib/schedule";
import { listCategories, listPlaces } from "@/lib/server/places";

const VISITED_FILTERS = [
  { value: "", label: "すべて" },
  { value: "no", label: "まだ" },
  { value: "yes", label: "行った" },
];

export default function PlacesPage({ searchParams }: PageProps<"/places">) {
  return (
    <div>
      <h1 className="mb-3 text-xl font-bold">リスト一覧</h1>
      <Suspense fallback={<Loading />}>
        <PlaceList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

async function PlaceList({
  searchParams,
}: {
  searchParams: PageProps<"/places">["searchParams"];
}) {
  const params = await searchParams;
  const visited = first(params.visited);
  const categoryId = first(params.category);

  const categories = await listCategories();
  const category = categories.find((c) => c.id === categoryId);
  const places = await listPlaces({
    categoryId: category?.id,
    visited: visited === "yes" ? true : visited === "no" ? false : undefined,
  });
  const today = todayInTokyo();

  const href = (next: { visited?: string; category?: string }) => {
    const query = new URLSearchParams();
    const v = next.visited ?? visited;
    const c = next.category ?? category?.id ?? "";
    if (v) query.set("visited", v);
    if (c) query.set("category", c);
    const text = query.toString();
    return text ? `/places?${text}` : "/places";
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {VISITED_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={href({ visited: filter.value })}
            className={`rounded-full px-3 py-1 text-sm ${
              visited === filter.value
                ? "bg-stone-800 text-white"
                : "bg-white text-stone-600 shadow-sm"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {category && (
        <p className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
            {category.name}
          </span>
          <Link
            href={href({ category: "" })}
            className="text-stone-500 underline"
          >
            カテゴリの絞り込みを外す
          </Link>
        </p>
      )}

      {places.length > 0 ? (
        <ul className="space-y-2">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} today={today} />
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">
          <p>該当する場所はありません。</p>
          <Link
            href={
              category ? `/places/new?category=${category.id}` : "/places/new"
            }
            className="mt-3 inline-block font-bold text-orange-600"
          >
            ＋ 行きたい場所を登録する
          </Link>
        </div>
      )}
    </div>
  );
}
