# ドキュメント標準化 作業報告

本報告は、既存実装（ソースコード）を正としてドキュメント標準化テンプレートを適用した結果をまとめたものです。ソースコードの変更は行っていません。

作業日: 2026-06-28  
最終更新: 2026-06-28（TODO 一覧を `docs/TODO.md` に集約）

---

## 作成したドキュメント一覧

| ファイル | 内容 |
|---------|------|
| `README.md` | 人間向け入口（概要・技術・起動方法・ディレクトリ・ドキュメント一覧・開発フロー） |
| `AGENTS.md` | AI 向け入口（読込順・AI ルール） |
| `docs/project_overview.md` | 背景・目的・利用者・スコープ・用語集 |
| `docs/system_architecture.md` | 構成図・技術スタック・コンポーネント・データフロー・外部連携 |
| `docs/database.md` | DB 未使用の旨、設定ファイル・ステートによるデータ管理 |
| `docs/features/news_list.md` | ニュース一覧取得・表示 |
| `docs/features/news_summarize.md` | 要約作成・関連性検証 |
| `docs/features/news_edit.md` | 要約編集（クライアントサイド） |
| `docs/features/slack_post.md` | Slack 投稿 |
| `docs/features/category_selection.md` | カテゴリ選択・設定内容 |
| `docs/decision_log.md` | コードから読み取れる設計判断 7 件 |
| `developer/coding_guidelines.md` | 命名・構成・スタイル・エラー処理・テスト方針 |
| `docs/TODO.md` | 未完了事項・検討事項一覧 |
| `docs/migration_report.md` | 本作業報告 |

---

## 実装から推測した内容

以下はソースコードおよび `docs/` 配下のドキュメントから確認できた内容です。

### システム概要

- **目的**: Google News RSS からカテゴリ別ニュースを取得し、要約・編集して Slack に共有する
- **利用者**: 社内担当者（認証なし）。具体的な部署・人数は未記載
- **主要機能**: カテゴリ選択、ニュース取得、簡易要約、要約編集、Slack 投稿

### 技術構成

| 区分 | 内容 |
|------|------|
| フロントエンド | React 18, TypeScript, Vite 5, Axios, Vanilla CSS |
| バックエンド | Node.js, Express 4, rss-parser, Axios, dotenv, cors |
| DB | なし |
| 設定 | `backend/search-config.json`, `backend/.env` |
| 外部サービス | Google News RSS, Slack Incoming Webhook |

### ディレクトリ構成

- `backend/index.js`: 全 API ロジック
- `frontend/src/App.tsx`: 全 UI・状態管理
- モノリシックな単一ファイル構成

### API エンドポイント

- `GET /api/categories`
- `GET /api/news?q=&category=`
- `POST /api/summarize`
- `POST /api/slack`

### 業務ルール（コード確認済み）

- RSS クエリ: `(keywords OR ...) AND (filters OR ...) [追加キーワード]`
- 3 か月以内の記事のみ、日付降順
- 要約: 200 文字切り出し + 関連性警告 + 記事リンク付与
- Slack: Block Kit 2 セクション形式

---

## 判断できなかった内容

以下は、前回作業時点では未確認だった項目と、その後の更新状況です。

| 項目 | 状況 |
|------|------|
| プロジェクト開始の背景・組織上の課題 | **解消** — `docs/project_overview.md` に反映 |
| 想定利用者 | **解消** — 小規模事業者の兼務担当者として記載 |
| Node.js 推奨バージョン | **解消** — 22.x LTS（仮）を `README.md` / `system_architecture.md` に記載 |
| 本番デプロイ構成 | **部分解消** — サンプル構成を `system_architecture.md` に仮置き。確定は未 |
| 認証なしの意図 | **解消** — 試験運用中、将来追加予定 |
| DB 不使用の意図 | **解消** — 軽量化・投稿保存不要。将来トレンド収集で DB 想定 |
| 簡易要約（非 AI）選定理由 | **解消** — 見出しとして長すぎず短すぎない構成を意図 |
| Google News RSS 選定理由 | 未確認 |
| Slack Webhook 選定理由 | 未確認 |
| ブランチ戦略・CI/CD | 未確認 |
| 非機能要件（可用性・性能・SLA） | 未確認 |
| `none` カテゴリの運用目的 | 未確認 |

---

## ドキュメント化できていない機能

作業指示の例（`news_post`, `news_delete`, `authentication`）と実装の対応関係:

| 指示例の機能 | 実装状況 | 対応 |
|-------------|---------|------|
| ニュース一覧 | 実装あり | `docs/features/news_list.md` |
| ニュース投稿 | **該当なし**（RSS 取得のみ。投稿は Slack） | `docs/features/slack_post.md` で代替 |
| ニュース編集 | 要約編集のみ実装 | `docs/features/news_edit.md` |
| ニュース削除 | **未実装** | 機能ドキュメント未作成 |
| 認証機能 | **未実装** | 機能ドキュメント未作成 |

### 実装されているが例に含まれなかった機能

| 機能 | ドキュメント |
|------|-------------|
| 要約作成 | `docs/features/news_summarize.md` |
| カテゴリ選択 | `docs/features/category_selection.md` |
| 記事閲覧（別ウィンドウ） | `news_list.md` 内で言及（独立 feature 未作成） |

### 将来検討（未実装）

- AI による高度な要約
- 複数 RSS ソース対応
- 投稿履歴保存
- フィルタリング強化

（`docs/project_overview.md` 参照）

---

## 実装とドキュメントの乖離

| 項目 | 既存 README / prompts | 実装 | ドキュメントでの扱い |
|------|----------------------|------|---------------------|
| 要約文字数 | 「150〜200 文字程度」 | 200 文字固定切り出し | 実装を正として記載、差異を TODO |
| アプリ名称 | README: 汎用ニュース / prompts: 労務ニュース | UI: 「ニュース管理」 | 実装・README を反映 |
| body-parser | `package.json` に依存 | `index.js` で未使用 | 依存のみ存在（未使用） |
| 記事本文表示 | prompts に `showContent` 言及の可能性 | `showContent` ステート定義あるが UI 未使用 | 未使用フィールドとして認識 |

---

## 今後確認したい事項

→ [docs/TODO.md](TODO.md) に集約済み（2026-06-28）

---

## 削除したテンプレート

作業完了後、`template-project/` ディレクトリを削除しました。

## 2026-06-28 追記: レガシーファイル整理

| 対象 | 対応 |
|------|------|
| `prompts/generate-app.md` | 削除。内容は `docs/` 配下に移行済み |
| `instruction-templates/` | `.gitignore` に追加（ローカル配置・Git 管理外） |
| 未完了事項 | `docs/TODO.md` に集約。GitHub Issues 移行予定（TODO-001） |
