const express = require('express');
const RSSParser = require('rss-parser');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const parser = new RSSParser();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// RSSからニュースを取得
app.get('/api/news', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const baseQuery = '(労働基準法 OR 社会保険 OR 雇用保険 OR 労務) AND (改正 OR 変更 OR 最新 OR 義務化)';
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

// 労務関連キーワード
const LABOR_KEYWORDS = ['労務', '雇用', '労働', '給与', '賃金', '社会保険', '年金', '働き方', '厚生', '就業規則', 'ハラスメント', '育休', '有給', '裁量労働', '最低賃金', '労働基準法'];

// 要約処理
app.post('/api/summarize', (req, res) => {
  const { text, title } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'テキストが必要です。' });
  }
  
  // 労務情報との関連性を検証
  const combinedText = (title + ' ' + text).toLowerCase();
  const isLaborRelated = LABOR_KEYWORDS.some(keyword => combinedText.includes(keyword.toLowerCase()));
  
  // 150-200文字程度に要約（簡易的に200文字で切り詰め）
  let summary = text.length > 200 ? text.substring(0, 200) + '...' : text;
  
  if (!isLaborRelated) {
    summary = `【注意：労務関連の可能性が低いです】\n${summary}`;
  }
  
  res.json({ 
    summary,
    isLaborRelated 
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
