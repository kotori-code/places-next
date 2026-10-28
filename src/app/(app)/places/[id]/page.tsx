import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { toggleVisitedAction } from "@/app/actions";
import { DeleteButton } from "@/components/DeleteButton";
import { Loading } from "@/components/Loading";
import { SubmitButton } from "@/components/SubmitButton";
import { googleMapsUrl } from "@/lib/maps";
import { daysUntil, formatVisit, todayInTokyo } from "@/lib/schedule";
import { getPlaceOrNull } from "@/lib/server/placeParam";

export default function PlacePage({ params }: PageProps<"/places/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <PlaceDetail params={params} />
    </Suspense>
  );
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

async function PlaceDetail({
  params,
}: {
  params: PageProps<"/places/[id]">["params"];
}) {
  const { id } = await params;
  const place = await getPlaceOrNull(id);
  if (!place) notFound();
  const today = todayInTokyo();
  const days = place.visitDate ? daysUntil(place.visitDate, today) : null;

  return (
    <article className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {place.categoryName && (
            <Link
              href={`/places?category=${place.categoryId}`}
              className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700"
            >
              {place.categoryName}
            </Link>
          )}
          {place.visited && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">
              行った
            </span>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-bold break-words">{place.name}</h1>
      </div>

      {place.visitDate && (
        <div className="rounded-2xl bg-sky-50 p-4">
          <p className="text-sm text-sky-700">行く日</p>
          <p className="text-lg font-bold text-sky-900">
            {formatVisit(place.visitDate, place.visitTime, today)}
            <span className="ml-2 text-sm font-normal">
              {days === 0
                ? "（今日）"
                : days! > 0
                  ? `（あと ${days} 日）`
                  : "（過ぎました）"}
            </span>
          </p>
        </div>
      )}

      <dl className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        {place.address && (
          <div>
            <dt className="text-xs text-stone-500">住所</dt>
            <dd className="break-words">{place.address}</dd>
          </div>
        )}
        {place.url && (
          <div>
            <dt className="text-xs text-stone-500">URL</dt>
            <dd className="break-all">
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 underline"
              >
                {place.url}
              </a>
            </dd>
          </div>
        )}
        {place.memo && (
          <div>
            <dt className="text-xs text-stone-500">メモ</dt>
            <dd className="whitespace-pre-wrap break-words">{place.memo}</dd>
          </div>
        )}
        <a
          href={googleMapsUrl(place.name, place.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-stone-200 py-2.5 text-center text-sm font-bold active:bg-stone-50"
        >
          📍 Google マップで開く
        </a>
      </dl>

      <div className="grid grid-cols-2 gap-2">
        <form action={toggleVisitedAction.bind(null, place.id, !place.visited)}>
          <SubmitButton
            pendingText="更新中…"
            className={`w-full rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-60 ${
              place.visited
                ? "border border-stone-300 bg-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {place.visited ? "「まだ」に戻す" : "✓ 行った！"}
          </SubmitButton>
        </form>
        <Link
          href={`/places/${place.id}/edit`}
          className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white"
        >
          {place.visitDate ? "編集する" : "編集・日程を決める"}
        </Link>
      </div>

      <p className="text-xs text-stone-400">
        {place.createdBy} が {formatDateTime(place.createdAt)} に登録
        {place.updatedAt !== place.createdAt &&
          ` ／ ${place.updatedBy} が ${formatDateTime(place.updatedAt)} に更新`}
      </p>

      <DeleteButton id={place.id} name={place.name} />
    </article>
  );
}
