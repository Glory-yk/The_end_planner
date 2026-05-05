import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class SpeakingService {
  private readonly logger = new Logger(SpeakingService.name);
  private readonly ollamaUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.ollamaUrl =
      this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    this.model = this.configService.get<string>('OLLAMA_MODEL') || 'gemma3';
  }

  async getFeedback(
    transcript: string,
    language?: string,
  ): Promise<SpeakingFeedback> {
    const lang = language || 'en';
    const targetLang = lang === 'en' ? 'English' : lang;

    const prompt = `You are an expert language tutor. Analyze the following spoken transcript and provide detailed feedback. The speaker is practicing ${targetLang}.

Transcript:
"${transcript}"

Respond ONLY with valid JSON (no markdown, no code fences, no commentary) in this exact shape:
{
  "overallScore": <integer 1-10>,
  "grammar": {
    "score": <integer 1-10>,
    "issues": [{"original": "<phrase>", "corrected": "<corrected phrase>", "explanation": "<why>"}]
  },
  "fluency": {
    "score": <integer 1-10>,
    "comments": "<overall fluency assessment>"
  },
  "vocabulary": {
    "score": <integer 1-10>,
    "suggestions": [{"original": "<word/phrase>", "better": "<suggested alternative>", "reason": "<why it's better>"}]
  },
  "pronunciation": {
    "tips": ["<tip1>", "<tip2>"]
  },
  "encouragement": "<positive encouraging message>"
}

Be constructive and encouraging. If the transcript is mostly correct, still provide at least one vocabulary suggestion. Keep explanations concise.`;

    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.4 },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with ${response.status}`);
      }

      const data = (await response.json()) as { response: string };
      return this.parseFeedback(data.response);
    } catch (err) {
      this.logger.error('Ollama feedback request failed', err);
      return this.fallbackFeedback(
        'Could not reach the local model. Make sure Ollama is running and the model is installed.',
      );
    }
  }

  async chat(
    messages: ChatMessage[],
    language?: string,
  ): Promise<ChatResponse> {
    const lang = language || 'en';
    const targetLang = lang === 'en' ? 'English' : lang;

    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are a friendly, patient ${targetLang} conversation tutor named Aria. Have a natural, encouraging conversation with the student to help them practice ${targetLang} speaking.

Rules:
- Keep responses SHORT (1-3 sentences). This is a spoken conversation, not an essay.
- Ask follow-up questions to keep the conversation flowing.
- Use simple, natural ${targetLang} appropriate to the student's apparent level.
- Do NOT correct grammar mid-conversation unless they ask. Just respond naturally.
- Be warm, curious, and encouraging.
- Never use emojis, markdown, or special formatting — your reply will be spoken aloud.
- Never describe yourself with stage directions like "*smiles*". Just speak.`,
    };

    const fullMessages = [systemMessage, ...messages];

    try {
      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: fullMessages,
          stream: false,
          options: { temperature: 0.8 },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with ${response.status}`);
      }

      const data = (await response.json()) as {
        message: { role: string; content: string };
      };
      return { message: data.message.content.trim() };
    } catch (err) {
      this.logger.error('Ollama chat request failed', err);
      return {
        message:
          "I'm sorry, I'm having trouble connecting right now. Make sure Ollama is running with a model installed, and let's try again.",
      };
    }
  }

  private parseFeedback(raw: string): SpeakingFeedback {
    const trimmed = raw.trim();
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    const candidate = jsonMatch ? jsonMatch[0] : trimmed;

    try {
      return JSON.parse(candidate) as SpeakingFeedback;
    } catch {
      this.logger.warn('Failed to parse model output as JSON');
      return this.fallbackFeedback(
        'The model returned a response, but it was not valid JSON.',
      );
    }
  }

  private fallbackFeedback(message: string): SpeakingFeedback {
    return {
      overallScore: 7,
      grammar: { score: 7, issues: [] },
      fluency: { score: 7, comments: message },
      vocabulary: { score: 7, suggestions: [] },
      pronunciation: { tips: [] },
      encouragement: 'Keep practicing! Every conversation makes you better.',
    };
  }
}
