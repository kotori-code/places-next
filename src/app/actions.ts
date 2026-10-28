"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_MAX_AGE,
  isCorrectPassword,
  MEMBER_COOKIE,
  normalizeMember,
  safeNextPath,
  SESSION_COOKIE,
  sessionToken,
} from "@/lib/auth";
import { parsePlaceForm, type PlaceField } from "@/lib/placeForm";
import {
  createPlace,
  deletePlace,
  setVisited,
  updatePlace,
} from "@/lib/server/places";
import { requireMember } from "@/lib/server/session";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: COOKIE_MAX_AGE,
  path: "/",
};

export async function loginAction(
  _prev: string | null,
  form: FormData,
): Promise<string | null> {
  const password = process.env.APP_PASSWORD;
  if (!password)
    return "合言葉がまだ設定されていません（環境変数 APP_PASSWORD）";

  const input = String(form.get("password") ?? "");
  if (!(await isCorrectPassword(input, password))) {
    // 総当たりで試されにくくするため、間違えたときは少し待たせる
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "合言葉が違います";
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await sessionToken(password), cookieOptions);
  const next = safeNextPath(String(form.get("next") ?? ""));
  redirect(normalizeMember(store.get(MEMBER_COOKIE)?.value) ? next : "/name");
}

export async function saveMemberAction(
  _prev: string | null,
  form: FormData,
): Promise<string | null> {
  const member = normalizeMember(String(form.get("member") ?? ""));
  if (!member) return "名前を 1〜20 文字で入力してください";
  (await cookies()).set(MEMBER_COOKIE, member, cookieOptions);
  redirect("/");
}

export type PlaceFormState = {
  errors: Partial<Record<PlaceField, string>> & { form?: string };
  values: Record<string, string>;
  // フォームを作り直すための値。React のフォームの初期化では select に新しい初期値が入らないため
  submittedAt: number;
} | null;

function formValues(form: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of form.entries())
    // Next が足す $ACTION_ で始まる項目は入れない
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  return values;
}

export async function createPlaceAction(
  _prev: PlaceFormState,
  form: FormData,
): Promise<PlaceFormState> {
  const member = await requireMember();
  const parsed = parsePlaceForm(form);
  if (!parsed.ok) return { errors: parsed.errors, values: formValues(form), submittedAt: Date.now() };

  let id: string;
  try {
    id = await createPlace(parsed.value, member);
  } catch (error) {
    console.error(error);
    return {
      errors: {
        form: "保存できませんでした。時間をおいてもう一度試してください",
      },
      values: formValues(form),
      submittedAt: Date.now(),
    };
  }
  revalidatePath("/", "layout");
  redirect(`/places/${id}`);
}

export async function updatePlaceAction(
  id: string,
  _prev: PlaceFormState,
  form: FormData,
): Promise<PlaceFormState> {
  const member = await requireMember();
  const parsed = parsePlaceForm(form);
  if (!parsed.ok) return { errors: parsed.errors, values: formValues(form), submittedAt: Date.now() };

  try {
    await updatePlace(id, parsed.value, member);
  } catch (error) {
    console.error(error);
    return {
      errors: {
        form: "保存できませんでした。時間をおいてもう一度試してください",
      },
      values: formValues(form),
      submittedAt: Date.now(),
    };
  }
  revalidatePath("/", "layout");
  redirect(`/places/${id}`);
}

export async function toggleVisitedAction(
  id: string,
  visited: boolean,
): Promise<void> {
  const member = await requireMember();
  await setVisited(id, visited, member);
  revalidatePath("/", "layout");
}

export async function deletePlaceAction(id: string): Promise<void> {
  await requireMember();
  await deletePlace(id);
  revalidatePath("/", "layout");
  redirect("/places");
}
