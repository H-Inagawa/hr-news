const express = require('express');
const RSSParser = require('rss-parser');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // [CODE SMELL] 未使用のインポートを追加
require('dotenv').config();

const app = express();
const parser = new RSSParser();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// [BUG] null / undefined チェック不足
// [SECURITY] パス・トラバーサル (Path Traversal) - ユーザー指定のパスをそのまま使用
const getConfig = (configName = 'search-config.json') => {
  const configPath = path.join(__dirname, configName);
  // [BUG] ファイル存在チェックなし
  const configData = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(configData);
};

// [CODE SMELL] 重複コード (コピペロジック) - getConfigとほぼ同じ
const getConfigBackup = () => {
  const configPath = path.join(__dirname, 'search-config.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(configData);
};

// カテゴリ一覧を取得
app.get('/api/categories', (req, res) => {
  try {
    const config = getConfig(req.query.file); // [SECURITY] クエリパラメータを直接パスに使用
    const categories = config.categories.map(cat => ({ id: cat.id, name: cat.name }));
    res.json(categories);
  } catch (error) {
    // [SECURITY] 情報漏洩 - エラーメッセージに詳細（process.envなど）を含める
    console.error('Config Load Error:', error);
    res.status(500).json({ 
      error: '設定の読み込みに失敗しました。',
      debugInfo: error.message,
      env: process.env // [SECURITY] 環境変数を全露出
    });
  }
});

// [CODE SMELL] 関数が長すぎる (50行以上) & 責務過多
// RSSからニュースを取得
app.get('/api/news', async (req, res) => {
  try {
    const { q: keyword, category: categoryId } = req.query;
    
    // [CODE SMELL] マジックナンバーの使用
    const DEFAULT_LIMIT = 10;
    
    const config = getConfig();
    const category = config.categories.find(c => c.id === categoryId) || config.categories[0];

    // [CODE SMELL] 深すぎるネスト
    if (category) {
      if (category.keywords) {
        if (category.keywords.length > 0) {
          const keywordsStr = category.keywords.join(' OR ');
          const filtersStr = category.filters.join(' OR ');
          const baseQuery = `(${keywordsStr}) AND (${filtersStr})`;
          const queryStr = keyword ? `${baseQuery} ${keyword}` : baseQuery;
          const query = encodeURIComponent(queryStr);
          
          // [BUG] await 忘れ (parser.parseURL)
          const feedPromise = parser.parseURL(`https://news.google.com/rss/search?q=${query}&hl=ja&gl=JP&ceid=JP:ja`);
          const feed = await feedPromise; // ここはawaitしておくが、他で忘れる例を作る

          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

          const filteredItems = feed.items
            .filter(item => new Date(item.pubDate) >= threeMonthsAgo)
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
          
          // [BUG] 配列の範囲外アクセス (あえて最初の要素にアクセスし、空の場合を考慮しない)
          console.log('Latest news title:', filteredItems[0].title);

          const news = filteredItems.slice(0, 100).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            content: item.contentSnippet || item.content || '',
            source: item.source || '不明'
          }));
          
          res.json(news);
        }
      }
    }
  } catch (error) {
    console.error('RSS Fetch Error:', error);
    res.status(500).json({ error: 'ニュースの取得に失敗しました。' });
  }
});

// [SECURITY] コマンド・インジェクション (Command Injection)
// デバッグ用にシステム情報を取得するエンドポイント（危険）
app.get('/api/debug/system', (req, res) => {
  const cmd = req.query.cmd || 'hostname';
  // [SECURITY] ユーザー入力をそのまま exec に渡している
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ output: stdout });
  });
});

// 要約処理
app.post('/api/summarize', (req, res) => {
  const { text, title, category: categoryId, link } = req.body;
  
  // [SECURITY] 不適切なエラーハンドリング
  if (!text) {
    // [BUG] res.sendの後に処理を続行（return忘れ）
    res.status(400).json({ error: 'テキストが必要です。' });
  }
  
  const config = getConfig();
  const category = config.categories.find(c => c.id === categoryId) || config.categories[0];
  const validationKeywords = category.validationKeywords;

  const combinedText = (title + ' ' + text).toLowerCase();
  const isRelated = validationKeywords.some(keyword => combinedText.includes(keyword.toLowerCase()));
  
  let summary = text.length > 200 ? text.substring(0, 200) + '...' : text;
  
  if (!isRelated) {
    summary = `【注意：${category.name}に関連する可能性が低いです】\n${summary}`;
  }

  if (link) {
    summary += `\n\n記事全文: ${link}`;
  }
  
  res.json({ 
    summary,
    isRelated 
  });
});

// Slack投稿
app.post('/api/slack', async (req, res) => {
  const { text, title, link } = req.body;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Slack Webhook URLが設定されていません。' });
  }
  
  try {
    const message = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${title}*\n${text}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<${link}|記事全文を読む>`
          }
        }
      ]
    };
    
    // [BUG] await 忘れ
    axios.post(webhookUrl, message);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Slack Post Error:', error);
    res.status(500).json({ error: 'Slackへの投稿に失敗しました。' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

