import client from './client';

export interface SpeakingFeedback {
  overallScore: number;
  grammar: {
    score: number;
    issues: { original: string; corrected: string; explanation: string }[];
  };
  fluency: {
    score: number;
    comments: string;
  };
  vocabulary: {
    score: number;
    suggestions: { original: string; better: string; reason: string }[];
  };
  pronunciation: {
    tips: string[];
  };
  encouragement: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
}

export const speakingApi = {
  async getFeedback(transcript: string, language?: string): Promise<SpeakingFeedback> {
    const response = await client.post<SpeakingFeedback>('/speaking/feedback', {
      transcript,
      language,
    });
    return response.data;
  },

  async chat(messages: ChatMessage[], language?: string): Promise<ChatResponse> {
    const response = await client.post<ChatResponse>('/speaking/chat', {
      messages,
      language,
    });
    return response.data;
  },
};
