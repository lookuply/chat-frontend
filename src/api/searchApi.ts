/**
 * API client for Lookuply Search API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  relevance_score: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  query: string;
}

export interface ChatRequest {
  query: string;
  limit?: number;
}

// New progressive loading types
export interface SearchRequest {
  query: string;
  language: string;
  limit?: number;
}

export interface SearchResponse {
  sources: Source[];
  query_id: string;
}

export interface SummarizeRequest {
  query: string;
  language: string;
  query_id: string;
  source_ids: string[];
}

export interface SummarizeResponse {
  answer: string;
  query_id: string;
}

export const searchApi = {
  // Original chat endpoint (backwards compatible)
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  },

  // NEW: Fast endpoint - sources only (<100ms)
  async search(request: SearchRequest): Promise<SearchResponse> {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  },

  // NEW: Slow endpoint - AI answer generation (2-3s)
  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Summarize failed: ${response.statusText}`);
    }

    return response.json();
  },

  async health(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  },
};
