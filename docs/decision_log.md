# 設計判断履歴

コードから読み取れる設計判断を記録する。判断経緯がコードから判別できないものは TODO とする。

---

## 判断 1: Google News RSS をニュース取得元とする

### 概要

外部ニュースの取得に Google News RSS フィードを利用している。

### 背景

TODO: RSS を選んだ背景（他 API との比較、コスト、利用規約等）はコードからは判断不可。

### 検討した案

TODO

### 採用した案

Google News RSS（`https://news.google.com/rss/search?q=...&hl=ja&gl=JP&ceid=JP:ja`）

### 理由（コードから推測できる範囲）

- `rss-parser` ライブラリで RSS を直接パース
- 検索クエリをカテゴリ設定から動的生成可能
- 日本語・日本向けパラメータ固定

### 影響範囲

- `backend/index.js` の `GET /api/news`
- 外部サービス依存（Google News RSS の可用性・レスポンス形式）

### 関連ドキュメント

- [docs/system_architecture.md](system_architecture.md)
- [docs/features/news_list.md](features/news_list.md)

---

## 判断 2: 検索条件を JSON ファイルで管理

### 概要

カテゴリ・キーワード・フィルタ・検証キーワードを `backend/search-config.json` で管理する。

### 背景

TODO: ファイルベース設定を選んだ理由（DB 不使用、デプロイ容易性等）は明示されていない。

### 採用した案

`search-config.json` を起動時に `fs.readFileSync` で読み込み

### 理由（コードから推測できる範囲）

- コード変更なしでカテゴリ・キーワードを調整可能
- DB インフラが不要

### 影響範囲

- `GET /api/categories`, `GET /api/news`, `POST /api/summarize`
- 設定変更はサーバー再起動不要（リクエストごとに読み込み）

### 関連ドキュメント

- [docs/database.md](database.md)
- [docs/features/category_selection.md](features/category_selection.md)

---

## 判断 3: データベースを使用しない（現行）

### 概要

現行実装では、ニュース・要約・投稿履歴を永続化する DB レイヤーを設けていない。

### 背景

アプリの軽量化を優先し、投稿情報を保存する想定がないため。試験運用段階では、取得・編集・投稿の一連のフローをシンプルに保つことが求められた。

### 採用した案

フロントエンド React ステート + 設定ファイル + 環境変数のみ

### 理由

- DB インフラの運用コストを避け、試験運用を迅速に開始できる
- 投稿履歴の参照・再投稿などの要件が現時点ではない
- 将来、ニュース情報からのトレンド収集を行う際には PostgreSQL 等への永続化を想定

### 影響範囲

- ページリロードで取得ニュース・要約が消失
- 投稿履歴の参照不可
- 本番サンプル構成（[docs/system_architecture.md](system_architecture.md)）では PostgreSQL を仮置き

### 関連ドキュメント

- [docs/database.md](database.md)
- [docs/system_architecture.md](system_architecture.md)

---

## 判断 4: 簡易要約（200 文字切り出し）を採用

### 概要

要約処理に LLM 等の AI を使用せず、テキストの先頭 200 文字切り出しで代替している。

### 背景

`prompts/generate-app.md` に「AI（Gemini 等）を使用した、より高度な要約機能の実装」が将来検討として記載されている。

### 採用した案

`text.length > 200 ? text.substring(0, 200) + '...' : text`

### 理由

- 記事の見出し情報として、伝えたい内容を **長すぎず、短すぎない** 構成で Slack に投稿したい
- 200 文字切り出しにより、RSS スニペットから要点を素早く整形できる
- LLM 等の外部 API 依存を避け、試験運用を低コストで開始できる

### 影響範囲

- `POST /api/summarize`
- 要約品質は RSS スニペットの先頭部分に依存

### 関連ドキュメント

- [docs/features/news_summarize.md](features/news_summarize.md)

---

## 判断 5: Slack Incoming Webhook による投稿

### 概要

Slack 投稿に Slack API（Bot Token）ではなく Incoming Webhook を使用する。

### 背景

TODO

### 採用した案

環境変数 `SLACK_WEBHOOK_URL` + Block Kit 形式 POST

### 理由（コードから推測できる範囲）

- 実装が単純（`axios.post(webhookUrl, message)`）
- OAuth / Bot 設定が不要

### 影響範囲

- 投稿先チャンネルは Webhook 作成時に固定
- Webhook URL の秘匿管理が必要（`.env`、`.gitignore` 対象）

### 関連ドキュメント

- [docs/features/slack_post.md](features/slack_post.md)

---

## 判断 6: 認証機能なし（現行）

### 概要

現行実装では、API および UI に認証・認可の仕組みがない。

### 背景

試験運用段階であり、まずは情報収集・要約・Slack 投稿のコアフローを検証することが優先された。

### 採用した案

認証なし、CORS 全許可（`app.use(cors())`）

### 理由

- 試験運用中は利用者が限定的であり、認証実装を後回しにしている
- **今後、本番運用に向けて認証機能を追加する予定**

### 影響範囲

- 現状、誰でも API を直接呼び出し可能（ネットワーク到達可能な場合）
- ユーザー別の操作履歴管理不可
- 認証追加時は API ミドルウェア・フロントエンドのログイン UI が必要

### 関連ドキュメント

- [docs/project_overview.md](project_overview.md)

---

## 判断 7: フロントエンド・バックエンド分離 + Vite プロキシ

### 概要

フロントエンド（`:5173`）とバックエンド（`:5000`）を別プロセスで起動し、開発時は Vite プロキシで `/api` を転送する。

### 採用した案

`frontend/vite.config.ts` の `server.proxy['/api'] → http://localhost:5000`

### 理由（コードから推測できる範囲）

- 開発時の CORS 問題回避
- フロントエンドから相対パス `/api/*` で API 呼び出し可能

### 影響範囲

- 本番構成では別途リバースプロキシまたは同一オリジン設定が必要（未定義）

### 関連ドキュメント

- [docs/system_architecture.md](system_architecture.md)
