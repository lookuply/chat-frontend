import { useState } from 'react';
import { searchApi, type ChatResponse } from '../api/searchApi';
import './ChatInterface.css';

export function ChatInterface() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await searchApi.chat({ query: query.trim() });
      setMessages([...messages, response]);
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Lookuply</h1>
        <p>Privacy-first AI search</p>
      </header>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Ask me anything</h2>
            <p>Get instant answers from the web with AI-powered search</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="message-group">
            <div className="user-message">
              <strong>You:</strong> {msg.query}
            </div>
            <div className="ai-message">
              <strong>Lookuply:</strong> {msg.answer}
            </div>
            {msg.sources.length > 0 && (
              <div className="sources">
                <strong>Sources:</strong>
                <ul>
                  {msg.sources.map((source, i) => (
                    <li key={i}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                      <p>{source.snippet}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          className="chat-input"
        />
        <button type="submit" disabled={loading || !query.trim()} className="chat-submit">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <footer className="chat-footer">
        <small>No tracking • No cookies • Privacy-first</small>
      </footer>
    </div>
  );
}
