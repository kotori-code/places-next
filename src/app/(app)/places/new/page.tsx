import { Suspense } from "react";
import { createPlaceAction } from "@/app/actions";
import { Loading } from "@/components/Loading";
import { PlaceForm } from "@/components/PlaceForm";
import { listCategories } from "@/lib/server/places";

export default function NewPlacePage({
  searchParams,
}: PageProps<"/places/new">) {
  return (
    <div>
      <h1 className="mb-3 text-xl font-bold">行きたい場所を登録</h1>
      <Suspense fallback={<Loading />}>
        <NewPlaceForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function NewPlaceForm({
  searchParams,
}: {
  searchParams: PageProps<"/places/new">["searchParams"];
}) {
  const [params, categories] = await Promise.all([
    searchParams,
    listCategories(),
  ]);
  // カテゴリ別の一覧から来たときは、そのカテゴリを選んでおく
  const category = typeof params.category === "string" ? params.category : "";
  const initial = {
    categoryId: categories.some((c) => c.id === category) ? category : "",
  };
  return (
    <PlaceForm
      action={createPlaceAction}
      categories={categories}
      initial={initial}
      submitLabel="登録する"
    />
  );
}
