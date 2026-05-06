import { useState } from 'react'
import axios from 'axios'

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  source: string;
  summary?: string;
}

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // ニュース取得
  const fetchNews = async () => {
    setLoading(true);
    setStatus('ニュースを取得中...');
    try {
      const response = await axios.get(`/api/news?q=${encodeURIComponent(searchKeyword)}`);
      setNews(response.data);
      setStatus(`成功: ${response.data.length}件のニュースを取得しました。`);
    } catch (error) {
      console.error(error);
      setStatus('エラー: ニュースの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // 要約作成
  const handleSummarize = async (index: number) => {
    const item = news[index];
    try {
      const response = await axios.post('/api/summarize', { 
        text: item.content,
        title: item.title
      });
      const updatedNews = [...news];
      updatedNews[index].summary = response.data.summary;
      setNews(updatedNews);
      setStatus('要約を作成しました。');
    } catch (error) {
      setStatus('エラー: 要約の作成に失敗しました。');
    }
  };

  // Slack投稿
  const handlePostSlack = async (index: number) => {
    const item = news[index];
    if (!item.summary) {
      setStatus('エラー: 先に要約を作成してください。');
      return;
    }

    try {
      await axios.post('/api/slack', {
        title: item.title,
        text: item.summary,
        link: item.link
      });
      setStatus('Slackに投稿しました！');
    } catch (error) {
      setStatus('エラー: Slackへの投稿に失敗しました。');
    }
  };

  const updateSummary = (index: number, value: string) => {
    const updatedNews = [...news];
    updatedNews[index].summary = value;
    setNews(updatedNews);
  };

  return (
    <div className="container">
      <header>
        <h1>労務ニュース管理</h1>
        <p>最新の労務関連ニュースを取得し、要約してSlackに共有します。</p>
      </header>

      <div className="search-container">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="検索ワードを入力（例: 法改正、DX）"
          className="search-input"
        />
        <button 
          onClick={fetchNews} 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? '取得中...' : '最新ニュースを取得'}
        </button>
        {status && <span className="status-badge">{status}</span>}
      </div>

      <div className="news-list">
        {news.map((item, index) => (
          <div key={index} className="news-card">
            <h3>{item.title}</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              {item.source} - {new Date(item.pubDate).toLocaleDateString()}
            </p>
            
            {!item.summary ? (
              <button onClick={() => handleSummarize(index)}>要約を作成</button>
            ) : (
              <div className="edit-area">
                <textarea
                  value={item.summary}
                  onChange={(e) => updateSummary(index, e.target.value)}
                  placeholder="要約を編集してください..."
                />
                <div className="controls">
                  <button 
                    onClick={() => handlePostSlack(index)}
                    className="btn-success"
                  >
                    Slackに投稿
                  </button>
                  <button onClick={() => handleSummarize(index)}>再要約</button>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '1rem' }}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.9rem' }}>
                元の記事を見る →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
