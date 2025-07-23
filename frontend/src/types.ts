export interface Document {
  id: string;
  title: string;
  content: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_public: boolean;
  metadata: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  preview_image?: string;
  created_at: string;
  is_builtin: boolean;
  metadata: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  document_id: string;
  message: string;
  response: string;
  timestamp: string;
  context: Record<string, any>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}