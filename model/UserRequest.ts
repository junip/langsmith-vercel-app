
interface ContentItem {
  type: string;
  text: string;
}

interface MessageInput {
  role: 'system' | 'user' | 'assistant';
  content: ContentItem[];
}

interface TextFormat {
  format: {
    type: string;
  };
}

export interface UserRequest {
  model?: string;
  temperature?: number;
  input: MessageInput[];
  text?: TextFormat;
  store?: boolean;
  previous_response_id?: string | null;
  service_tier?: string;
  top_p?: number;
}