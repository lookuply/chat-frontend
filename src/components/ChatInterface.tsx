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
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to last user message (top of conversation)
  const scrollToLastUserMessage = () => {
    lastUserMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Check if content exceeds viewport and update scroll button visibility
  const checkScrollButtonVisibility = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollButton(distanceFromBottom > 200);
  };

  // Monitor scroll position to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollButtonVisibility);
    return () => container.removeEventListener('scroll', checkScrollButtonVisibility);
  }, []);

  // Check scroll button visibility when messages change
  useEffect(() => {
    // Wait for DOM to update, then check
    setTimeout(checkScrollButtonVisibility, 100);
  }, [messages]);

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

    // 3. Scroll to the new user message (top of conversation)
    setTimeout(scrollToLastUserMessage, 50);

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

      // 5. Check if we have sources - if not, show "no results" message
      if (searchResponse.sources.length === 0) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "I couldn't find any results for your query. Our search index is still being populated. Please try again later or try a different query.",
                  isLoadingAnswer: false,
                }
              : msg
          )
        );
        return;
      }

      // 6. Skip AI summary - temporarily disabled due to LLM timeouts
      // TODO: Re-enable when Ollama performance is fixed
      // const summaryResponse = await searchApi.summarize({
      //   query: userQuery,
      //   language: 'en',
      //   query_id: searchResponse.query_id,
      //   source_ids: searchResponse.sources.map((s) => s.id),
      // });

      // 7. Update message - no AI answer, sources only
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: '', // No AI answer - sources only
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
      // Refocus on input after search
      setTimeout(() => inputRef.current?.focus(), 100);
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
            <h2>Search anything</h2>
            <p>Privacy-first AI search</p>
          </div>
        )}

        {messages.map((msg, index) => {
          // Check if this is the last user message
          const isLastUserMessage = msg.role === 'user' &&
            !messages.slice(index + 1).some(m => m.role === 'user');

          return (
            <div key={msg.id} className="message-group">
              {msg.role === 'user' ? (
                <div
                  className="user-message"
                  ref={isLastUserMessage ? lastUserMessageRef : null}
                >
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
        );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          className="scroll-to-bottom"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="search-bar-container">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            disabled={loading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="chat-submit"
          >
            {loading ? '...' : '↑'}
          </button>
        </div>
      </form>

      <footer className="chat-footer">
        <small>No tracking • No cookies • Privacy-first</small>
      </footer>
    </div>
  );
}
