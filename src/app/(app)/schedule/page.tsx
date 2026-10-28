import Link from "next/link";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { PlaceCard } from "@/components/PlaceCard";
import { splitSchedule, todayInTokyo } from "@/lib/schedule";
import { listScheduled } from "@/lib/server/places";

export default function SchedulePage() {
  return (
    <div>
      <h1 className="mb-3 text-xl font-bold">日程を決めたもの</h1>
      <Suspense fallback={<Loading />}>
        <ScheduleList />
      </Suspense>
    </div>
  );
}

async function ScheduleList() {
  const scheduled = await listScheduled();
  const today = todayInTokyo();
  const { upcoming, past } = splitSchedule(scheduled, today);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 font-bold text-sky-700">
          これから（{upcoming.length} 件）
        </h2>
        {upcoming.length > 0 ? (
          <ul className="space-y-2">
            {upcoming.map((place) => (
              <PlaceCard key={place.id} place={place} today={today} />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">
            <p>これからの予定はありません。</p>
            <p className="mt-1">
              場所の
              <Link href="/places" className="mx-1 text-orange-600 underline">
                編集
              </Link>
              で行く日を入れると、ここに出ます。
            </p>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-2 font-bold text-stone-500">
            過ぎた予定（{past.length} 件）
          </h2>
          <ul className="space-y-2 opacity-80">
            {past.map((place) => (
              <PlaceCard key={place.id} place={place} today={today} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
