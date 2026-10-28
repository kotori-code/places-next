# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## プロジェクト概要

家族だけで使う「行きたい場所リスト」。行きたい場所を登録し、カテゴリ別・日程を決めたもので見る。要件は `docs/requirements.md`。

## コマンド

```bash
npm install
npm run dev                          # http://localhost:3000（.env.local が必要）
npm test                             # Vitest（DB にはつながない）
npx vitest run tests/schedule.test.ts -t "日本時間"   # 1 件だけ
npm run lint
npx tsc --noEmit                     # 型チェック。ルートを足したら先に `npx next typegen`
npm run build
npx vercel deploy --prod --yes       # 本番へのデプロイ（GitHub との自動連携はない）
```

環境変数（`.env.local` と Vercel の Environment Variables）: `APP_PASSWORD`（合言葉・半角英数字）、`SUPABASE_URL`、`SUPABASE_SECRET_KEY`。

## アーキテクチャ

- **アカウントはない。** 家族共通の合言葉 1 つだけで守る。
  - `src/proxy.ts`（Next 16 で middleware から名前が変わった）が全ページの前で Cookie `session` を確かめ、なければ `/login`、名前の Cookie `member` がなければ `/name` へ移す。
  - `session` の値は `HMAC(APP_PASSWORD, 固定の文字列)`（`src/lib/auth.ts`）。合言葉を変えると全員の Cookie が無効になる。
  - Server Actions は proxy を通らずに呼ばれることもあるので、書き込む処理は最初に `requireMember()`（`src/lib/server/session.ts`）を呼ぶ。返る名前を `created_by` / `updated_by` に入れる。
- **Supabase はサーバー側からだけ使う。** `src/lib/server/` は `server-only`。テーブルは RLS オン・ポリシーなしなので、publishable / anon キーでは読み書きできない。ブラウザ用の Supabase クライアントは作らない。
- **`cacheComponents: true`（Next 16 の既定）。** ページは静的な外枠＋`<Suspense>` の中でデータを読む形にしている。`db()` は最初に `connection()` を待つので、DB の読み込みがビルド時の静的なページに入らない（入れると家族のデータが公開の HTML に焼き込まれる）。DB を読む新しい処理も `db()` を通す。
- **「今日」は日本時間で決める**（`todayInTokyo()`）。Vercel のサーバーは UTC で動く。日付は `YYYY-MM-DD` の文字列のまま比べる。
- フォームの検証は `src/lib/placeForm.ts`（純粋関数でテストあり）。URL は http/https だけ許す（詳細ページでリンクにするため）。
- DB の構造を変えるときは Supabase MCP の `apply_migration`（プロジェクト `places-next`、ref `piqrqsobvnbaapmvocsy`）で適用し、`docs/schema.sql` も同じ内容に直す。

## 規約

- コメント・テスト名・画面の文言は日本語。
- ブラウザの `confirm()` などのダイアログは使わない（削除は `DeleteButton` の 2 段階の確認）。
- スマホで使う前提。1 カラム・下部のナビ。
