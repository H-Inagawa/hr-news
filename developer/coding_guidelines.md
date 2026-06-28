# コーディングガイドライン

既存コードから読み取れる規約・慣習を整理したドキュメント。

---

## 基本方針

- 可読性を優先し、シンプルな構成を維持する
- 変更は最小単位で行い、無関係な修正を混ぜない
- 既存のコードスタイル・命名規則に合わせる
- 仕様はドキュメントを正とし、実装前に関連ドキュメントを確認する

---

## ディレクトリ構成

```
hr-news/
├── backend/                 # Express API（単一エントリ: index.js）
│   ├── index.js
│   ├── search-config.json   # カテゴリ・検索設定
│   └── package.json
├── frontend/                # React SPA
│   ├── src/
│   │   ├── App.tsx          # メイン UI・ロジック集約
│   │   ├── main.tsx         # エントリポイント
│   │   └── index.css        # グローバルスタイル
│   ├── vite.config.ts
│   └── package.json
├── docs/                    # 仕様・設計ドキュメント
├── developer/               # 開発者向けガイド
```

`instruction-templates/` は作業者向け AI 指示テンプレート（ローカル配置・Git 管理外）。

### 配置ルール（現状）

- バックエンドの API ロジック → `backend/index.js` に集約
- フロントエンドの UI・状態管理 → `frontend/src/App.tsx` に集約
- 検索カテゴリ設定 → `backend/search-config.json`
- スタイル → `frontend/src/index.css`（コンポーネント CSS ファイルなし）

TODO: ファイル分割・レイヤー分離の方針 → [docs/TODO.md](../docs/TODO.md) TODO-304

---

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| バックエンドファイル | snake_case / lowercase | `index.js`, `search-config.json` |
| フロントエンドコンポーネント | PascalCase | `App.tsx` |
| TypeScript インターフェース | PascalCase | `NewsItem`, `Category` |
| 関数・変数（JS/TS） | camelCase | `fetchNews`, `searchKeyword`, `handleSummarize` |
| React ステート | camelCase | `selectedCategory`, `newsCount` |
| API パス | kebab-case なし、スラッシュ区切り | `/api/news`, `/api/categories` |
| 環境変数 | UPPER_SNAKE_CASE | `SLACK_WEBHOOK_URL`, `PORT` |
| JSON 設定キー | camelCase | `validationKeywords` |
| CSS クラス | kebab-case | `news-card`, `btn-primary`, `search-container` |

---

## コーディングスタイル

### バックエンド（JavaScript / CommonJS）

- CommonJS: `require()` / `module.exports` 相当（`require` のみ使用）
- 2 スペースインデント
- シングルクォート
- セミコロンあり
- 非同期処理: `async/await`（RSS 取得、Slack 投稿）
- 同期ファイル読み込み: `fs.readFileSync`

### フロントエンド（TypeScript / React）

- ES Modules: `import` / `export`
- 関数コンポーネント（`function App()`）
- React Hooks: `useState`, `useEffect`
- インラインスタイルと CSS クラスの併用
- 型定義: コンポーネント内 `interface`（`NewsItem`, `Category`）

### インポート

- フロントエンド: React → 外部ライブラリ（axios）の順
- バックエンド: Node 組み込み → 外部パッケージの順

---

## コメント方針

- 日本語コメントで処理ブロックの目的を説明（例: `// カテゴリ一覧を取得`）
- 自明な処理にはコメントを付けない場合もある
- JSDoc / 型 doc コメントは未使用

---

## エラーハンドリング

### バックエンド

- `try/catch` で API ハンドラを囲む
- エラー時: `console.error` + HTTP 500 + JSON `{ error: '日本語メッセージ' }`
- バリデーションエラー: HTTP 400 + `{ error: '...' }`
- 統一エラーコード体系はなし

### フロントエンド

- `try/catch` で API 呼び出しを囲む
- ユーザー向け: `status` ステートに日本語メッセージ表示
- 一部: `console.error` のみ（カテゴリ取得失敗）
- ビジネスガード: 要約未作成時の Slack 投稿ブロック

---

## ログ出力方針

| 用途 | 方法 |
|------|------|
| サーバーエラー | `console.error('Config Load Error:', error)` 等 |
| 起動ログ | `console.log('Server is running on ...')` |
| クライアントエラー | `console.error` + ステータス表示 |

構造化ログ・ログレベル分け・本番監視連携は未実装。

---

## テスト方針

| 種類 | 現状 |
|------|------|
| 単体テスト | 未実装 |
| 結合テスト | 未実装 |
| E2E テスト | 未実装 |

テストフレームワーク・テストスクリプトは `package.json` に定義されていない。

TODO: テスト導入時の方針 → [docs/TODO.md](../docs/TODO.md) TODO-302

---

## Git 運用

- `.gitignore` 対象: `node_modules/`, `.env`, `dist/`
- ブランチ戦略・コミットメッセージ規約 → [docs/TODO.md](../docs/TODO.md) TODO-300, TODO-301

---

## ドキュメント更新ルール

| 変更内容 | 更新対象 |
|---------|---------|
| プロジェクト目的・スコープ | [docs/project_overview.md](../docs/project_overview.md) |
| アーキテクチャ・技術選定 | [docs/system_architecture.md](../docs/system_architecture.md) |
| 永続化・設定形式 | [docs/database.md](../docs/database.md) |
| 機能仕様の追加・変更 | [docs/features/](../docs/features/) 内の該当ファイル |
| 設計判断 | [docs/decision_log.md](../docs/decision_log.md) |
| 未完了事項 | [docs/TODO.md](../docs/TODO.md) |
| コーディング規約 | 本ファイル |

---

## Linter / Formatter

TODO: ESLint, Prettier 等 → [docs/TODO.md](../docs/TODO.md) TODO-303
