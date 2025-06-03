
export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp?: string;
}
