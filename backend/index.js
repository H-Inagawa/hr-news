const express = require('express');
const RSSParser = require('rss-parser');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const parser = new RSSParser();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 設定ファイルの読み込み
const getConfig = () => {
  const configPath = path.join(__dirname, 'search-config.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(configData);
};

// カテゴリ一覧を取得
app.get('/api/categories', (req, res) => {
  try {
    const config = getConfig();
    const categories = config.categories.map(cat => ({ id: cat.id, name: cat.name }));
    res.json(categories);
  } catch (error) {
    console.error('Config Load Error:', error);
    res.status(500).json({ error: '設定の読み込みに失敗しました。' });
  }
});

// RSSからニュースを取得
app.get('/api/news', async (req, res) => {
  try {
    const { q: keyword, category: categoryId } = req.query;
    const config = getConfig();
    const category = config.categories.find(c => c.id === categoryId) || config.categories[0];

    // クエリの組み立て: (キーワード1 OR キーワード2...) AND (フィルタ1 OR フィルタ2...)
    const keywordsStr = category.keywords.join(' OR ');
    const filtersStr = category.filters.join(' OR ');
    const baseQuery = `(${keywordsStr}) AND (${filtersStr})`;
    
    const queryStr = keyword ? `${baseQuery} ${keyword}` : baseQuery;
    const query = encodeURIComponent(queryStr);
    
    const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${query}&hl=ja&gl=JP&ceid=JP:ja`);
    
    // 3か月前の日付を計算
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // 3か月以内のニュースのみフィルタリングし、日付順にソート
    const filteredItems = feed.items
      .filter(item => new Date(item.pubDate) >= threeMonthsAgo)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    const news = filteredItems.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.contentSnippet || item.content || '',
      source: item.source || '不明'
    }));
    
    res.json(news);
  } catch (error) {
    console.error('RSS Fetch Error:', error);
    res.status(500).json({ error: 'ニュースの取得に失敗しました。' });
  }
});

// 要約処理
app.post('/api/summarize', (req, res) => {
  const { text, title, category: categoryId, link } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'テキストが必要です。' });
  }
  
  const config = getConfig();
  const category = config.categories.find(c => c.id === categoryId) || config.categories[0];
  const validationKeywords = category.validationKeywords;

  // カテゴリ関連性との関連性を検証
  const combinedText = (title + ' ' + text).toLowerCase();
  const isRelated = validationKeywords.some(keyword => combinedText.includes(keyword.toLowerCase()));
  
  // 150-200文字程度に要約（簡易的に200文字で切り詰め）
  let summary = text.length > 200 ? text.substring(0, 200) + '...' : text;
  
  if (!isRelated) {
    summary = `【注意：${category.name}に関連する可能性が低いです】\n${summary}`;
  }

  // 末尾にリンクを追加
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
    
    await axios.post(webhookUrl, message);
    res.json({ success: true });
  } catch (error) {
    console.error('Slack Post Error:', error);
    res.status(500).json({ error: 'Slackへの投稿に失敗しました。' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

