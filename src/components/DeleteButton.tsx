"use client";

import { useState } from "react";
import { deletePlaceAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

/** 1 回目で確認を出し、2 回目で消す（ブラウザの確認ダイアログは使わない） */
export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 active:bg-red-50"
      >
        削除する
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">
        「{name}」を削除します。元に戻せません。
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold"
        >
          やめる
        </button>
        <form action={deletePlaceAction.bind(null, id)}>
          <SubmitButton
            pendingText="削除中…"
            className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            削除する
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
