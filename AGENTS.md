# AGENTS

AI エージェント向けの作業指示書。プロジェクト理解の順序と行動ルールを定義する。

---

## ドキュメント読込順

以下の順序でドキュメントを読み、プロジェクトを理解すること。

1. [README.md](README.md)
2. [docs/project_overview.md](docs/project_overview.md)
3. [docs/system_architecture.md](docs/system_architecture.md)
4. [docs/database.md](docs/database.md)
5. [docs/features/](docs/features/)
6. [docs/decision_log.md](docs/decision_log.md)
7. [developer/coding_guidelines.md](developer/coding_guidelines.md)

---

## ドキュメント優先順位

ソースコードよりもドキュメントを信頼する。

ただし、ドキュメントと実装に差異がある場合は、実装を確認したうえで差異を報告し、独断で仕様を変更しないこと。

---

## AIルール

- 実装前に関連ドキュメントを読む
- 実装変更時はドキュメントを更新する
- 不明点は TODO 化する
- 推測で仕様変更しない
- 設計判断は [docs/decision_log.md](docs/decision_log.md) に記録する
- 作業者からの指示は `instruction-templates/` のテンプレートを使用する（ローカル配置・Git 管理外）
- 既存の命名規則・ディレクトリ構成に従う
- 変更は最小単位で行い、無関係なファイルは変更しない
- API キー・秘密情報をドキュメントやコードにハードコードしない

---

## 実装時の原則

- 仕様書に存在しない機能は独断で追加しない
- ドキュメントと実装の不整合を放置しない
- 大きな仕様変更時は `docs/features/` 内の該当 feature ドキュメントを更新する

---

## 作業完了時の確認

- 仕様変更に伴うドキュメント更新が完了しているか
- 命名規則・コーディング規約に従っているか
- 影響範囲を明示できているか
