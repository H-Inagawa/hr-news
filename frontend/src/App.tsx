import { useState, useEffect } from 'react'
import axios from 'axios'

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  source: string;
  summary?: string;
  showContent?: boolean;
  showSummaryEditor?: boolean;
}

interface Category {
  id: string;
  name: string;
}

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [newsCount, setNewsCount] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // カテゴリ一覧取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // ニュース取得
  const fetchNews = async () => {
    setLoading(true);
    setStatus('ニュースを取得中...');
    try {
      const response = await axios.get(`/api/news?q=${encodeURIComponent(searchKeyword)}&category=${selectedCategory}`);
      const initializedNews = response.data.map((item: any) => ({
        ...item,
        showContent: false,
        showSummaryEditor: false
      }));
      setNews(initializedNews);
      setNewsCount(initializedNews.length);
      setStatus('');
    } catch (error) {
      console.error(error);
      setStatus('エラー: ニュースの取得に失敗しました。');
      setNewsCount(null);
    } finally {
      setLoading(false);
    }
  };

  // 要約作成
  const handleSummarize = async (index: number) => {
    const item = news[index];
    setStatus('要約を作成中...');
    try {
      const response = await axios.post('/api/summarize', { 
        text: item.content,
        title: item.title,
        category: selectedCategory,
        link: item.link
      });
      const updatedNews = [...news];
      updatedNews[index].summary = response.data.summary;
      updatedNews[index].showSummaryEditor = true;
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

  const toggleSummaryEditor = (index: number) => {
    const updatedNews = [...news];
    updatedNews[index].showSummaryEditor = !updatedNews[index].showSummaryEditor;
    setNews(updatedNews);
  };

  const updateSummary = (index: number, value: string) => {
    const updatedNews = [...news];
    updatedNews[index].summary = value;
    setNews(updatedNews);
  };

  return (
    <div className="container">
      <header>
        <h1>ニュース管理</h1>
        <p>最新のニュースを取得し、要約してSlackに共有します。</p>
      </header>

      <div className="search-container">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
          style={{ 
            padding: '0.5rem', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            marginRight: '0.5rem'
          }}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="追加検索ワードを入力（任意）"
          className="search-input"
        />
        <button 
          onClick={fetchNews} 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? '取得中...' : '最新ニュースを取得'}
        </button>
        <div className="status-group" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {newsCount !== null && (
            <span className="count-badge" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.85rem' }}>
              取得件数: {newsCount}件
            </span>
          )}
          {status && <span className="status-badge" style={{ fontSize: '0.85rem', color: '#2563eb' }}>{status}</span>}
        </div>
      </div>

      <div className="news-list">
        {news.map((item, index) => (
          <div key={index} className="news-card">
            <h3>{item.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
              {item.source} - {new Date(item.pubDate).toLocaleDateString()}
            </p>

            <div className="card-actions" style={{ marginBottom: '1rem' }}>
              <button 
                onClick={() => window.open(item.link, '_blank', 'width=1000,height=800,noopener,noreferrer')} 
                className="btn-view"
              >
                記事を見る
              </button>
              <button onClick={() => handleSummarize(index)} className="btn-summarize">
                {item.summary ? '要約を再生成' : '要約を作成'}
              </button>
              {item.summary && (
                <button onClick={() => toggleSummaryEditor(index)} className="btn-summarize">
                  {item.showSummaryEditor ? 'エディタを閉じる' : 'エディタを開く'}
                </button>
              )}
            </div>
            
            {item.showSummaryEditor && item.summary && (
              <div className="edit-area">
                <textarea
                  value={item.summary}
                  onChange={(e) => updateSummary(index, e.target.value)}
                  placeholder="要約を編集してください..."
                  rows={8}
                />
                <div className="controls">
                  <button 
                    onClick={() => handlePostSlack(index)}
                    className="btn-post"
                    style={{ width: '100%' }}
                  >
                    Slackに投稿
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
