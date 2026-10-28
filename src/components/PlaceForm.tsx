"use client";

import { useActionState } from "react";
import type { PlaceFormState } from "@/app/actions";
import { LIMITS } from "@/lib/placeForm";
import type { Category } from "@/lib/server/places";
import { SubmitButton } from "./SubmitButton";

type Props = {
  action: (prev: PlaceFormState, form: FormData) => Promise<PlaceFormState>;
  categories: Category[];
  initial: Record<string, string>;
  submitLabel: string;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-stone-600">{label}</span>
      {children}
      {error && (
        <span className="mt-1 block text-sm text-red-600">{error}</span>
      )}
    </label>
  );
}

export function PlaceForm({ action, categories, initial, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, null);
  // 入力に誤りがあって戻ってきたときは、入力した値を残す
  const values = state?.values ?? initial;
  const errors = state?.errors ?? {};

  return (
    <form key={state?.submittedAt ?? 0} action={formAction} className="space-y-4">
      {errors.form && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <Field label="名前（必須）" error={errors.name}>
        <input
          name="name"
          defaultValue={values.name}
          required
          maxLength={LIMITS.name}
          placeholder="例: 〇〇動物園"
          className={inputClass}
        />
      </Field>

      <Field label="カテゴリ" error={errors.categoryId}>
        <select
          name="categoryId"
          defaultValue={values.categoryId ?? ""}
          className={inputClass}
        >
          <option value="">なし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="住所" error={errors.address}>
        <input
          name="address"
          defaultValue={values.address}
          maxLength={LIMITS.address}
          autoComplete="off"
          className={inputClass}
        />
      </Field>

      <Field label="URL（お店のページ・SNS など）" error={errors.url}>
        <input
          name="url"
          type="url"
          inputMode="url"
          defaultValue={values.url}
          maxLength={LIMITS.url}
          placeholder="https://"
          className={inputClass}
        />
      </Field>

      <Field label="メモ" error={errors.memo}>
        <textarea
          name="memo"
          defaultValue={values.memo}
          maxLength={LIMITS.memo}
          rows={4}
          placeholder="行きたい理由、営業時間、気になるメニューなど"
          className={inputClass}
        />
      </Field>

      <fieldset className="rounded-2xl border border-stone-200 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-stone-600">
          行く日（決まったら）
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="日付" error={errors.visitDate}>
            <input
              name="visitDate"
              type="date"
              defaultValue={values.visitDate}
              className={inputClass}
            />
          </Field>
          <Field label="時刻" error={errors.visitTime}>
            <input
              name="visitTime"
              type="time"
              defaultValue={values.visitTime}
              className={inputClass}
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          日付を消すと「日程を決めたもの」から外れます。
        </p>
      </fieldset>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
