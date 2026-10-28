import Link from "next/link";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { countByCategory, listCategories } from "@/lib/server/places";

export default function CategoriesPage() {
  return (
    <div>
      <h1 className="mb-3 text-xl font-bold">カテゴリ別</h1>
      <Suspense fallback={<Loading />}>
        <CategoryList />
      </Suspense>
    </div>
  );
}

async function CategoryList() {
  const [categories, counts] = await Promise.all([
    listCategories(),
    countByCategory(),
  ]);
  const uncategorized = counts.get(null) ?? 0;

  return (
    <ul className="grid grid-cols-2 gap-2">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/places?category=${category.id}`}
            className="block rounded-2xl bg-white p-4 shadow-sm active:bg-stone-50"
          >
            <p className="font-bold">{category.name}</p>
            <p className="mt-1 text-sm text-stone-500">
              {counts.get(category.id) ?? 0} 件
            </p>
          </Link>
        </li>
      ))}
      {uncategorized > 0 && (
        <li className="rounded-2xl bg-white/60 p-4 text-stone-500">
          <p className="font-bold">カテゴリなし</p>
          <p className="mt-1 text-sm">{uncategorized} 件</p>
        </li>
      )}
    </ul>
  );
}
