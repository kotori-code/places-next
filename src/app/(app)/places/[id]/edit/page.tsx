import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updatePlaceAction } from "@/app/actions";
import { Loading } from "@/components/Loading";
import { PlaceForm } from "@/components/PlaceForm";
import { getPlaceOrNull } from "@/lib/server/placeParam";
import { listCategories } from "@/lib/server/places";

export default function EditPlacePage({
  params,
}: PageProps<"/places/[id]/edit">) {
  return (
    <div>
      <h1 className="mb-3 text-xl font-bold">編集</h1>
      <Suspense fallback={<Loading />}>
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditForm({
  params,
}: {
  params: PageProps<"/places/[id]/edit">["params"];
}) {
  const { id } = await params;
  const [place, categories] = await Promise.all([
    getPlaceOrNull(id),
    listCategories(),
  ]);
  if (!place) notFound();

  const initial = {
    name: place.name,
    categoryId: place.categoryId ?? "",
    address: place.address ?? "",
    url: place.url ?? "",
    memo: place.memo ?? "",
    visitDate: place.visitDate ?? "",
    visitTime: place.visitTime ?? "",
  };
  return (
    <div className="space-y-3">
      <PlaceForm
        action={updatePlaceAction.bind(null, place.id)}
        categories={categories}
        initial={initial}
        submitLabel="保存する"
      />
      <Link
        href={`/places/${place.id}`}
        className="block py-2 text-center text-sm text-stone-500"
      >
        保存せずに戻る
      </Link>
    </div>
  );
}
