import Link from "next/link";

const NAV = [
  { href: "/places", label: "一覧", icon: "📋" },
  { href: "/categories", label: "カテゴリ", icon: "🏷️" },
  { href: "/schedule", label: "日程", icon: "📅" },
  { href: "/places/new", label: "登録", icon: "＋" },
];

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/90 px-4 py-3 backdrop-blur">
        <Link href="/" className="text-lg font-bold text-orange-600">
          🗺️ 行きたい場所リスト
        </Link>
      </header>
      <main className="flex-1 px-4 pt-4 pb-28">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto grid max-w-xl grid-cols-4">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-2 text-xs text-stone-600 active:bg-stone-100"
              >
                <span className="text-lg leading-none" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
