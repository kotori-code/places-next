import Link from "next/link";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { PlaceCard } from "@/components/PlaceCard";
import { daysUntil, splitSchedule, todayInTokyo } from "@/lib/schedule";
import { listPlaces, listScheduled } from "@/lib/server/places";
import { currentMember } from "@/lib/server/session";

export default function HomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  const [member, places, scheduled] = await Promise.all([
    currentMember(),
    listPlaces(),
    listScheduled(),
  ]);
  const today = todayInTokyo();
  const { upcoming } = splitSchedule(scheduled, today);
  const notVisited = places.filter((place) => !place.visited).length;
  const next = upcoming[0];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-stone-500">
          {member} さん、こんにちは
          <Link href="/name" className="ml-2 text-xs text-orange-600 underline">
            名前を変える
          </Link>
        </p>
        {next ? (
          <p className="mt-1 text-lg font-bold">
            次のおでかけまで
            <span className="mx-1 text-2xl text-orange-600">
              {daysUntil(next.visitDate!, today) === 0
                ? "今日！"
                : `あと ${daysUntil(next.visitDate!, today)} 日`}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-lg font-bold">次に行く場所を決めましょう</p>
        )}
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        <Link
          href="/places?visited=no"
          className="rounded-2xl bg-white p-3 shadow-sm"
        >
          <p className="text-2xl font-bold text-orange-600">{notVisited}</p>
          <p className="text-xs text-stone-500">まだ行っていない</p>
        </Link>
        <Link href="/schedule" className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="text-2xl font-bold text-sky-600">{upcoming.length}</p>
          <p className="text-xs text-stone-500">日程が決まった</p>
        </Link>
        <Link
          href="/places?visited=yes"
          className="rounded-2xl bg-white p-3 shadow-sm"
        >
          <p className="text-2xl font-bold text-emerald-600">
            {places.length - notVisited}
          </p>
          <p className="text-xs text-stone-500">行った</p>
        </Link>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-bold">近い予定</h2>
          <Link href="/schedule" className="text-sm text-orange-600">
            日程を決めたもの →
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <ul className="space-y-2">
            {upcoming.slice(0, 3).map((place) => (
              <PlaceCard key={place.id} place={place} today={today} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-white p-4 text-sm text-stone-500">
            まだ予定はありません。
          </p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Link
          href="/places"
          className="rounded-2xl bg-white p-4 font-bold shadow-sm"
        >
          📋 リスト一覧
        </Link>
        <Link
          href="/categories"
          className="rounded-2xl bg-white p-4 font-bold shadow-sm"
        >
          🏷️ カテゴリ別
        </Link>
        <Link
          href="/places/new"
          className="col-span-2 rounded-2xl bg-orange-500 p-4 text-center font-bold text-white shadow-sm"
        >
          ＋ 行きたい場所を登録する
        </Link>
      </section>
    </div>
  );
}
