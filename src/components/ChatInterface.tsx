import { useState, useEffect, useRef } from 'react';
import { searchApi, type Source } from '../api/searchApi';
import { TypingIndicator } from './TypingIndicator';
import { ShimmerPlaceholder } from './ShimmerPlaceholder';
import './ChatInterface.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  sources?: Source[];
  isLoadingAnswer?: boolean;
  error?: string;
}

export function ChatInterface() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Monitor scroll position to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceFromBottom > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim() || loading) return;

    const userQuery = query.trim();
    setQuery('');
    setLoading(true);

    // 1. Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userQuery,
    };
    setMessages((prev) => [...prev, userMessage]);

    // 2. Add assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      sources: [],
      isLoadingAnswer: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // 3. Fetch sources (FAST - <100ms)
      const searchResponse = await searchApi.search({
        query: userQuery,
        language: 'en', // TODO: Add language selector
        limit: 10,
      });

      // 4. Update message with sources immediately
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, sources: searchResponse.sources }
            : msg
        )
      );

      // 5. Fetch AI summary (SLOW - 2-3s)
      const summaryResponse = await searchApi.summarize({
        query: userQuery,
        language: 'en',
        query_id: searchResponse.query_id,
        source_ids: searchResponse.sources.map((s) => s.id),
      });

      // 6. Update message with answer (replace placeholder)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: summaryResponse.answer,
                isLoadingAnswer: false,
              }
            : msg
        )
      );
    } catch (err) {
      // Handle error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                error: err instanceof Error ? err.message : 'Unknown error',
                isLoadingAnswer: false,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Lookuply</h1>
        <p className="chat-header-subtitle">Privacy-first AI search</p>
      </header>

      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Ask me anything</h2>
            <p>Get instant answers from the web with AI-powered search</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="message-group">
            {msg.role === 'user' ? (
              <div className="user-message">
                <strong>You:</strong> {msg.content}
              </div>
            ) : (
              <div className="assistant-message-container">
                {/* Sources - displayed immediately */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources">
                    <strong>Sources:</strong>
                    <ul>
                      {msg.sources.map((source) => (
                        <li key={source.id}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.title}
                          </a>
                          <p>{source.snippet}</p>
                          <small>Relevance: {(source.relevance_score * 100).toFixed(0)}%</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Answer or loading placeholder */}
                <div className="answer-section">
                  {msg.error ? (
                    <div className="error-message">
                      <strong>Error:</strong> {msg.error}
                    </div>
                  ) : msg.isLoadingAnswer ? (
                    // Loading state - show animated placeholder
                    <div className="loading-state">
                      <TypingIndicator message="AI generuje odpoveď..." />
                      <ShimmerPlaceholder lines={5} />
                    </div>
                  ) : msg.content ? (
                    // Loaded state - show answer
                    <div className="ai-message">
                      <strong>Lookuply:</strong>
                      <div className="answer-content">{msg.content}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          className="scroll-to-bottom"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="chat-submit"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <footer className="chat-footer">
        <small>No tracking • No cookies • Privacy-first</small>
      </footer>
    </div>
  );
}
