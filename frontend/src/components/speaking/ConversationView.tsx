'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mic, MicOff, Loader2, RotateCcw, AlertCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTTS } from '@/hooks/useTTS';
import { speakingApi, ChatMessage } from '@/api/speakingApi';

const Avatar3D = dynamic(
  () => import('./Avatar3D').then((m) => m.Avatar3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-b from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  },
);

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function ConversationView() {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported,
    error: speechError,
  } = useSpeechRecognition({ lang: 'en-US' });

  const { speak, stop: stopTTS, isSpeaking, isSupported: ttsSupported } = useTTS({
    lang: 'en-US',
    rate: 1.0,
  });

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const lastSentTranscriptRef = useRef<string>('');

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const sendUserMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;
    if (text === lastSentTranscriptRef.current) return;
    lastSentTranscriptRef.current = text;

    const newUserMessage: DisplayMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    resetTranscript();
    setIsThinking(true);
    setChatError(null);

    try {
      const apiMessages: ChatMessage[] = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await speakingApi.chat(apiMessages);
      const assistantMessage: DisplayMessage = {
        role: 'assistant',
        content: response.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (ttsSupported) {
        await speak(response.message);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to get response';
      setChatError(message);
    } finally {
      setIsThinking(false);
    }
  };

  const handleToggleMic = async () => {
    if (isSpeaking) {
      stopTTS();
      return;
    }

    if (isListening) {
      stopListening();
      const finalText = transcript.trim();
      if (finalText) {
        await sendUserMessage(finalText);
      }
    } else {
      setChatError(null);
      startListening();
    }
  };

  const handleReset = () => {
    stopTTS();
    stopListening();
    resetTranscript();
    setMessages([]);
    setChatError(null);
    lastSentTranscriptRef.current = '';
  };

  if (!speechSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Browser Not Supported
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
          Speech recognition is required for conversation mode. Please use
          Chrome or Edge.
        </p>
      </div>
    );
  }

  const micButtonState: 'idle' | 'listening' | 'speaking' | 'thinking' =
    isThinking
      ? 'thinking'
      : isSpeaking
        ? 'speaking'
        : isListening
          ? 'listening'
          : 'idle';

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Avatar */}
        <div className="h-[300px] md:h-full min-h-[300px] relative">
          <Avatar3D isSpeaking={isSpeaking} isListening={isListening} />

          {/* Status overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs">
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                isSpeaking
                  ? 'bg-green-400 animate-pulse'
                  : isListening
                    ? 'bg-red-400 animate-pulse'
                    : isThinking
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-gray-400',
              )}
            />
            {isSpeaking
              ? 'Aria is speaking'
              : isListening
                ? 'Listening...'
                : isThinking
                  ? 'Thinking...'
                  : 'Aria — your AI tutor'}
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-col bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 rounded-2xl overflow-hidden min-h-[300px]">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Conversation
              </h3>
            </div>
            <button
              onClick={handleReset}
              disabled={messages.length === 0 && !transcript}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={transcriptRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 && !transcript && !interimTranscript && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-500 text-sm gap-2">
                <Mic className="w-8 h-8" />
                <p>Tap the mic and start speaking</p>
                <p className="text-xs">
                  Aria will listen, then reply with voice
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={clsx(
                      'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-sm',
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Live interim transcript */}
            {(transcript || interimTranscript) && isListening && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl px-4 py-2 text-sm bg-primary/30 text-white rounded-br-sm italic">
                  {transcript}
                  {interimTranscript && (
                    <span className="opacity-70"> {interimTranscript}</span>
                  )}
                </div>
              </div>
            )}

            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-3 rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Errors */}
      {(speechError || chatError) && (
        <div className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {speechError || chatError}
        </div>
      )}

      {/* Mic Button */}
      <div className="flex flex-col items-center gap-2">
        <motion.button
          onClick={handleToggleMic}
          whileTap={{ scale: 0.95 }}
          disabled={isThinking}
          className={clsx(
            'relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors',
            micButtonState === 'listening' && 'bg-red-500 hover:bg-red-600 text-white',
            micButtonState === 'speaking' && 'bg-green-500 hover:bg-green-600 text-white',
            micButtonState === 'thinking' && 'bg-yellow-500 text-white cursor-not-allowed',
            micButtonState === 'idle' && 'bg-primary hover:bg-primary/90 text-white',
          )}
        >
          {micButtonState === 'listening' && (
            <motion.span
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {micButtonState === 'thinking' ? (
            <Loader2 className="w-8 h-8 animate-spin relative z-10" />
          ) : micButtonState === 'listening' ? (
            <MicOff className="w-8 h-8 relative z-10" />
          ) : micButtonState === 'speaking' ? (
            <Volume2 className="w-8 h-8 relative z-10" />
          ) : (
            <Mic className="w-8 h-8 relative z-10" />
          )}
        </motion.button>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {micButtonState === 'listening' && 'Tap to send'}
          {micButtonState === 'speaking' && 'Tap to interrupt'}
          {micButtonState === 'thinking' && 'Aria is thinking...'}
          {micButtonState === 'idle' && 'Tap to speak'}
        </span>
      </div>
    </div>
  );
}
