/**
 * API client for Lookuply Search API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

export interface Source {
  title: string;
  url: string;
  snippet: string;
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

export const searchApi = {
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

  async health(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  },
};
