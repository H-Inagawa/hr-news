# ニュース取得・要約・Slack投稿アプリ

このアプリは、最新のニュース（労務、AI関連など）をRSSから取得し、要約・編集してSlackの特定チャンネルに投稿するためのツールです。カテゴリや検索キーワードは設定ファイルで柔軟に管理できます。

## 構成・仕様
- **取得元**: Google News RSS (`hl=ja&gl=JP`) 
  - `backend/search-config.json` で定義されたカテゴリ別のキーワードとフィルタを使用して取得します。
  - 基本クエリ: `(キーワード1 OR キーワード2...) AND (フィルタ1 OR フィルタ2...) + [追加検索ワード]`
  - 実行日から **3か月以内** のニュースのみを取得し、日付の新しい順に表示します。
- **検証機能**: 要約時にカテゴリ別のキーワードが含まれているかをチェックし、関連性が低い場合は警告を表示します。
- **設定のカスタマイズ**: `backend/search-config.json` を編集することで、新しいカテゴリの追加やキーワードの変更が可能です。
- **技術スタック**:
  - **Backend**: Node.js (Express), `rss-parser` (RSS解析), `axios` (Slack API通信), `dotenv`
  - **Frontend**: React (TypeScript), Vite, `axios` (API通信), Vanilla CSS
- **デザイン・UI**: 
  - **固定ヘッダー**: 画面上部にタイトルと検索バーを固定。スクロール中も常に操作可能です。
  - **件数・ステータス表示**: 取得したニュースの総件数を常時表示。操作状況もリアルタイムで確認できます。
  - **Glassmorphism**: 透過ぼかしを活用した、清潔感のあるモダンなホワイトモードUI。
  - **レスポンシブ対応**: PCおよびモバイル端末での閲覧に最適化。

## Git管理
以下の情報は `.gitignore` により管理対象から除外されています：
- `node_modules/`: インストールされたライブラリ
- `.env`: Slack Webhook URL などの機密情報
- `dist/`: ビルド済みファイル

## セットアップ手順

### 1. リポジトリの準備
リポジトリをクローンまたはダウンロードしてください。

### 2. バックエンドの設定
1. `backend` ディレクトリに移動します。
   ```bash
   cd backend
   ```
2. 依存関係をインストールします。
   ```bash
   npm install
   ```
3. `.env` ファイルを開き、`SLACK_WEBHOOK_URL` にSlackのIncoming Webhook URLを設定します。
4. `search-config.json` を確認し、必要に応じてキーワードを調整します。
5. サーバーを起動します。
   ```bash
   npm start
   ```
   サーバーはデフォルトで `http://localhost:5000` で動作します。

### 3. フロントエンドの設定
1. `frontend` ディレクトリに移動します。
   ```bash
   cd ../frontend
   ```
2. 依存関係をインストールします。
   ```bash
   npm install
   ```
3. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
   ブラウザで表示されたURL（通常は `http://localhost:5173`）にアクセスします。

## 使い方
1. プルダウンから「カテゴリ」を選択します（例：労務、AI関連）。
2. 必要に応じて「追加検索ワード」を入力し、「最新ニュースを取得」ボタンを押します。
3. 各ニュースカードのアクションを選択します：
   - **記事を見る** (緑): ニュースの元記事を別タブで開きます。
   - **要約を作成** (灰): 内容を要約し、エディタを表示します。
4. 要約内容を確認・編集します。
   - **検証**: 選択したカテゴリとの関連性が低いと判断された場合、警告メッセージが表示されます。
5. **Slackに投稿** (赤): 編集した内容をSlackに送信します。

## 技術スタック詳細
- **Frontend**: React, TypeScript, Axios, CSS (Vanilla)
- **Backend**: Express, rss-parser, Axios, dotenv
- **Design**: Modern Light Mode, Glassmorphism, Responsive Layout