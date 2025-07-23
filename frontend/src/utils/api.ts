import { Document, Template, Category, ChatMessage, ApiResponse } from '../types';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Document API
export const documentApi = {
  getAll: (skip = 0, limit = 20): Promise<ApiResponse<Document[]>> =>
    apiRequest(`/api/documents?skip=${skip}&limit=${limit}`),

  getById: (id: string): Promise<ApiResponse<Document>> =>
    apiRequest(`/api/documents/${id}`),

  create: (document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Document>> =>
    apiRequest('/api/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    }),

  update: (id: string, updates: Partial<Document>): Promise<ApiResponse<Document>> =>
    apiRequest(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  delete: (id: string): Promise<ApiResponse<void>> =>
    apiRequest(`/api/documents/${id}`, {
      method: 'DELETE',
    }),
};

// Template API
export const templateApi = {
  getAll: (category?: string): Promise<ApiResponse<Template[]>> => {
    const url = category ? `/api/templates?category=${category}` : '/api/templates';
    return apiRequest(url);
  },

  getById: (id: string): Promise<ApiResponse<Template>> =>
    apiRequest(`/api/templates/${id}`),

  getCategories: (): Promise<ApiResponse<{ categories: Category[] }>> =>
    apiRequest('/api/categories'),
};

// Chat API
export const chatApi = {
  sendMessage: (documentId: string, message: string, context?: Record<string, any>): Promise<ApiResponse<any>> =>
    apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        message,
        context,
      }),
    }),
};

// Health check
export const healthApi = {
  check: (): Promise<ApiResponse<{ status: string; message: string }>> =>
    apiRequest('/api/health'),
};