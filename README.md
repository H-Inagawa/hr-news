# 労務ニュース取得・要約・Slack投稿アプリ

このアプリは、最新の労務関連ニュースをRSSから取得し、要約・編集してSlackの特定チャンネルに投稿するためのツールです。

## 構成・仕様
- **取得元**: Google News RSS (`hl=ja&gl=JP`) 
  - 以下のベースクエリに、ユーザーが入力した「検索ワード」を組み合わせて取得します：
    `(労働基準法 OR 社会保険 OR 雇用保険 OR 労務) AND (改正 OR 変更 OR 最新 OR 義務化) + [検索ワード]`
  - 実行日から **3か月以内** のニュースのみを取得し、日付の新しい順に表示します。
- **検証機能**: 要約時に「労務」「雇用」「働き方」「労働基準法」などのキーワードが含まれているかをチェックし、関連性が低い場合は警告を表示します。
- **技術スタック**:
  - **Backend**: Node.js (Express), `rss-parser` (RSS解析), `axios` (Slack API通信), `dotenv`
  - **Frontend**: React (TypeScript), Vite, `axios` (API通信), Vanilla CSS
- **デザイン**: 
  - 清潔感のあるホワイトモード（ライトモード）を基調としたモダンなUI。
  - Glassmorphism（グラスモルフィズム）風のカードデザイン。
  - レスポンシブ対応。

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
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXXX/YYYYY/ZZZZZ
   ```
4. サーバーを起動します。
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
1. 「最新ニュースを取得」ボタンを押すと、Google Newsから労務関連のニュースが読み込まれます。
2. 各ニュースカードの「要約を作成」ボタンを押すと、内容が200文字以内に要約されます。
   - **検証**: 労務情報との関連性が低いと判断された場合、要約の冒頭に警告メッセージが表示されます。
3. テキストエリアで要約内容を自由に編集できます。
4. 「Slackに投稿」ボタンを押すと、編集した内容がSlackに送信されます。

## 技術スタック
- **Frontend**: React, TypeScript, Axios, CSS (Vanilla)
- **Backend**: Express, rss-parser, Axios, dotenv
- **Design**: Modern Dark Mode, Glassmorphism, Responsive Layout