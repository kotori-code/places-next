import Link from "next/link";
import { formatVisit } from "@/lib/schedule";
import type { Place } from "@/lib/server/places";

type Props = { place: Place; today: string };

export function PlaceCard({ place, today }: Props) {
  return (
    <li>
      <Link
        href={`/places/${place.id}`}
        className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm active:bg-stone-50"
      >
        <div className="flex items-start justify-between gap-2">
          <p className={`font-bold ${place.visited ? "text-stone-400" : ""}`}>
            {place.name}
          </p>
          {place.visited && (
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              行った
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {place.categoryName && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">
              {place.categoryName}
            </span>
          )}
          {place.visitDate && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">
              {formatVisit(place.visitDate, place.visitTime, today)}
            </span>
          )}
          <span className="ml-auto text-stone-400">
            {place.createdBy} が登録
          </span>
        </div>
      </Link>
    </li>
  );
}
