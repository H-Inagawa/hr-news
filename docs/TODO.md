# TODO 一覧

プロジェクト全体の未完了事項・検討事項を集約する。**本ファイルが正**とする。

各 feature ドキュメント等に残る `## TODO` セクションは本ファイルへの参照のみとし、内容の更新は本ファイルで行う。

---

## 運用

| ID | 内容 | 関連 |
|----|------|------|
| TODO-001 | **GitHub Issues への移行** — チーム開発開始時に、本ファイルの項目を Issues として起票・管理する | — |

---

## インフラ・本番環境

| ID | 内容 | 関連 |
|----|------|------|
| TODO-010 | 本番構成の確定（サンプル: CDN / Node.js / PostgreSQL）— インフラ担当レビュー | [system_architecture.md](system_architecture.md) |
| TODO-011 | 本番環境での API 接続方式（Vite プロキシ以外）の定義 | [system_architecture.md](system_architecture.md) |
| TODO-012 | 非機能要件（可用性・性能・SLA）の定義 | [system_architecture.md](system_architecture.md) |

---

## 設計・仕様の未確定

| ID | 内容 | 関連 |
|----|------|------|
| TODO-020 | 認証方式・権限モデルの選定（本番運用向け） | [project_overview.md](project_overview.md), [decision_log.md](decision_log.md) |
| TODO-021 | トレンド収集用 PostgreSQL のテーブル設計 | [database.md](database.md) |
| TODO-022 | 要約方式: 簡易切り出し（200 文字）のままか、AI 要約へ移行するか | [features/news_summarize.md](features/news_summarize.md) |
| TODO-023 | 要約文字数: 「150〜200 文字程度」と実装（200 文字固定）の差異確認 | [features/news_summarize.md](features/news_summarize.md) |
| TODO-024 | `none` カテゴリの利用目的・運用ルール（空 keywords/filters での RSS 取得） | [features/category_selection.md](features/category_selection.md) |

---

## 設計判断の未記録（decision_log）

| ID | 内容 | 関連 |
|----|------|------|
| TODO-030 | Google News RSS 選定理由の記録 | [decision_log.md](decision_log.md) 判断 1 |
| TODO-031 | Slack Incoming Webhook 選定理由の記録 | [decision_log.md](decision_log.md) 判断 5 |
| TODO-032 | 検索条件を JSON ファイルで管理する理由の明文化 | [decision_log.md](decision_log.md) 判断 2 |

---

## 将来機能（未実装）

| ID | 内容 | 関連 |
|----|------|------|
| TODO-040 | ユーザー認証・認可の追加 | [project_overview.md](project_overview.md) |
| TODO-041 | AI（Gemini 等）による高度な要約 | [project_overview.md](project_overview.md) |
| TODO-042 | 投稿履歴の保存・参照 | [project_overview.md](project_overview.md) |
| TODO-043 | 複数 RSS ソースへの対応 | [project_overview.md](project_overview.md) |
| TODO-044 | ニュースフィルタリング機能の強化 | [project_overview.md](project_overview.md) |
| TODO-045 | ニュース削除機能 | — |
| TODO-046 | CI/CD パイプラインの整備 | [README.md](../README.md) |

---

## 機能別の検討事項

### ニュース一覧（news_list）

| ID | 内容 |
|----|------|
| TODO-100 | カテゴリ取得失敗時のユーザー向けエラー表示（現状は `console.error` のみ） |
| TODO-101 | 取得件数 0 件時の専用メッセージ表示の要否 |
| TODO-102 | ページネーション・件数上限の定義 |

### カテゴリ選択（category_selection）

| ID | 内容 |
|----|------|
| TODO-110 | カテゴリ取得失敗時のユーザー向けエラー表示 |
| TODO-111 | カテゴリ追加・変更時の運用手順書 |

### 要約作成（news_summarize）

| ID | 内容 |
|----|------|
| TODO-120 | `isRelated` をフロントエンド UI で明示的に表示するか |

### 要約編集（news_edit）

| ID | 内容 |
|----|------|
| TODO-130 | 文字数上限・プレースホルダ以外の入力ガイドの要否 |
| TODO-131 | 編集内容の自動保存（localStorage 等）の要否 |
| TODO-132 | 要約再生成時の編集内容上書き確認ダイアログの要否 |

### Slack 投稿（slack_post）

| ID | 内容 |
|----|------|
| TODO-140 | 投稿失敗時の Slack エラー詳細のユーザー表示 |
| TODO-141 | API レベルでの `title` / `text` / `link` 必須バリデーション（現状はフロント依存） |

---

## 実装とドキュメントの乖離

| ID | 内容 | 備考 |
|----|------|------|
| TODO-200 | `body-parser` が `package.json` にあるが `index.js` で未使用 | 削除または使用予定を確認 |
| TODO-201 | `showContent` ステートが定義されているが UI 未使用 | 削除または記事本文表示機能の要否 |
| TODO-202 | 認証機能の feature ドキュメント未作成 | 実装後に `docs/features/authentication.md` を追加 |

---

## 開発環境・品質

| ID | 内容 | 関連 |
|----|------|------|
| TODO-300 | ブランチ戦略・レビュー要件・CI 手順の定義 | [README.md](../README.md), [coding_guidelines.md](../developer/coding_guidelines.md) |
| TODO-301 | コミットメッセージ規約の定義 | [coding_guidelines.md](../developer/coding_guidelines.md) |
| TODO-302 | テストフレームワーク・テスト方針の決定 | [coding_guidelines.md](../developer/coding_guidelines.md) |
| TODO-303 | ESLint / Prettier の導入可否 | [coding_guidelines.md](../developer/coding_guidelines.md) |
| TODO-304 | ファイル分割・レイヤー分離の方針（現状は単一ファイル構成） | [coding_guidelines.md](../developer/coding_guidelines.md) |

---

## 更新ルール

1. 新しい未完了事項は本ファイルに追記する（可能なら ID を付与）
2. 完了した項目は本ファイルから削除するか、完了日をコメントで残す
3. 関連ドキュメント（feature / decision_log 等）に影響がある場合は合わせて更新する
4. チーム開発開始時は [TODO-001](#運用) に従い GitHub Issues へ移行する
