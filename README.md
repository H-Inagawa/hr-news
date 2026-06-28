# hr-news（ニュース取得・要約・Slack投稿アプリ）

Google News RSS からカテゴリ別にニュースを取得し、要約・編集して Slack チャンネルへ投稿する Web アプリケーションです。労務・AI 関連などのトピックを社内で共有する用途を想定しています。

---

## プロジェクト概要

本アプリは、最新ニュースの収集から Slack 共有までをブラウザ上で行う内部向けツールです。カテゴリや検索キーワードは `backend/search-config.json` で管理し、コード変更なしで検索条件を調整できます。

---

## システム概要

フロントエンド（React + TypeScript + Vite）と REST API（Node.js + Express）の 2 層構成です。永続化用のデータベースは使用せず、ニュースデータは RSS 取得時にメモリ上（React ステート）で保持します。

主要機能は以下のとおりです。

- カテゴリ別ニュース一覧の取得・表示
- 記事内容の簡易要約とカテゴリ関連性の検証
- 要約の手動編集
- Slack Incoming Webhook への投稿

認証機能は試験運用中のため未実装ですが、今後追加予定です。

詳細は [docs/system_architecture.md](docs/system_architecture.md) を参照してください。

---

## 利用技術

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 18, TypeScript, Vite 5, Axios, Vanilla CSS |
| バックエンド | Node.js 22.x LTS（推奨）, Express 4, rss-parser, Axios, dotenv, cors |
| データベース | なし（現行）。本番サンプル構成では PostgreSQL を想定 |
| 外部サービス | Google News RSS, Slack Incoming Webhook |

---

## ディレクトリ構成

```
/
├── README.md                    # プロジェクト入口（本ファイル）
├── AGENTS.md                    # AI エージェント向け作業指示書
├── docs/                        # 仕様・設計ドキュメント
│   ├── project_overview.md
│   ├── system_architecture.md
│   ├── database.md
│   ├── features/                # 機能別仕様書
│   ├── decision_log.md
│   └── migration_report.md
├── developer/
│   └── coding_guidelines.md
├── backend/                     # Express API サーバー
│   ├── index.js                 # API エンドポイント・ビジネスロジック
│   ├── search-config.json       # カテゴリ・キーワード設定
│   └── package.json
├── frontend/                    # React フロントエンド
│   ├── src/
│   │   ├── App.tsx              # メイン UI コンポーネント
│   │   ├── main.tsx
│   │   └── index.css            # スタイル定義
│   ├── vite.config.ts           # 開発サーバー・API プロキシ設定
│   └── package.json
└── prompts/
    └── generate-app.md          # アプリ生成・編集指示書（開発時参照用）
```

---

## 起動方法

### 前提条件

- Node.js 22.x LTS（推奨）
- npm

### 1. バックエンド

```bash
cd backend
npm install
```

`backend/.env` を作成し、Slack Webhook URL を設定します。

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
PORT=5000
```

```bash
npm start
# 開発時: npm run dev
```

サーバーは `http://localhost:5000` で起動します。

### 2. フロントエンド

```bash
cd frontend
npm install
npm run dev
```

ブラウザで表示された URL（通常 `http://localhost:5173`）にアクセスします。`/api` へのリクエストは Vite プロキシ経由でバックエンド（`:5000`）に転送されます。

---

## ドキュメント一覧

| ドキュメント | 内容 |
|-------------|------|
| [AGENTS.md](AGENTS.md) | AI エージェント向け作業指示書 |
| [docs/project_overview.md](docs/project_overview.md) | プロジェクト概要・背景・スコープ |
| [docs/system_architecture.md](docs/system_architecture.md) | システム構成・技術スタック |
| [docs/database.md](docs/database.md) | データ永続化（本プロジェクトでは DB 未使用） |
| [docs/features/](docs/features/) | 機能別仕様書 |
| [docs/decision_log.md](docs/decision_log.md) | 設計判断履歴 |
| [developer/coding_guidelines.md](developer/coding_guidelines.md) | コーディング規約 |
| [docs/migration_report.md](docs/migration_report.md) | ドキュメント標準化の作業報告 |

---

## 開発フロー

1. 関連ドキュメント（`docs/features/` など）を確認する
2. 機能ブランチを作成する
3. 実装・動作確認を行う
4. 仕様変更があればドキュメントを更新する
5. 設計判断が発生した場合は `docs/decision_log.md` を更新する
6. プルリクエストを作成し、レビューを受ける

TODO: ブランチ戦略・レビュー要件・CI 手順など、プロジェクト固有のルールを追記する。

---

## 使い方（概要）

1. カテゴリ（例: 労務、AI 関連）を選択する
2. 必要に応じて追加検索ワードを入力し、「最新ニュースを取得」をクリックする
3. 各ニュースカードから「記事を見る」「要約を作成」を実行する
4. 要約を確認・編集し、「Slackに投稿」で共有する

詳細な操作手順は [docs/features/](docs/features/) 内の各機能仕様書を参照してください。
