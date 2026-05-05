'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  MessageSquare,
  RotateCcw,
  Loader2,
  BookOpen,
  Star,
  AlertCircle,
  Volume2,
  CheckCircle2,
  MessagesSquare,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { speakingApi, SpeakingFeedback } from '@/api/speakingApi';
import { ConversationView } from './ConversationView';

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const color =
    score >= 8
      ? 'text-green-500'
      : score >= 6
        ? 'text-yellow-500'
        : 'text-red-500';
  const bg =
    score >= 8
      ? 'bg-green-50 dark:bg-green-900/20'
      : score >= 6
        ? 'bg-yellow-50 dark:bg-yellow-900/20'
        : 'bg-red-50 dark:bg-red-900/20';

  return (
    <div className={clsx('flex flex-col items-center gap-1 rounded-xl p-3', bg)}>
      <span className={clsx('text-2xl font-bold', color)}>{score}</span>
      <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function PracticeMode() {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error: speechError,
  } = useSpeechRecognition({ lang: 'en-US' });

  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      setFeedback(null);
      setFeedbackError(null);
      startListening();
    }
  };

  const handleGetFeedback = async () => {
    if (!transcript.trim()) return;
    setIsLoadingFeedback(true);
    setFeedbackError(null);

    try {
      const result = await speakingApi.getFeedback(transcript.trim());
      setFeedback(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get feedback';
      setFeedbackError(message);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleClear = () => {
    resetTranscript();
    setFeedback(null);
    setFeedbackError(null);
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Browser Not Supported
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
          Speech recognition is not available in this browser. Please use Chrome
          or Edge for the best experience.
        </p>
      </div>
    );
  }

  const fullTranscript = (transcript + ' ' + interimTranscript).trim();

  return (
    <div className="h-full flex flex-col px-6 pb-4 overflow-y-auto">
      {/* Mic Button */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <motion.button
          onClick={handleToggleMic}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            'relative w-24 h-24 rounded-full flex items-center justify-center transition-colors shadow-lg',
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-primary hover:bg-primary/90 text-white'
          )}
        >
          {isListening && (
            <motion.span
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {isListening ? (
            <MicOff className="w-10 h-10 relative z-10" />
          ) : (
            <Mic className="w-10 h-10 relative z-10" />
          )}
        </motion.button>
        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
          {isListening
            ? 'Listening... tap to stop'
            : 'Tap to start speaking'}
        </span>
      </div>

      {/* Speech Error */}
      {speechError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {speechError}
        </div>
      )}

      {/* Live Transcript */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
          Your Speech
        </label>
        <div className="min-h-[120px] max-h-[200px] overflow-y-auto rounded-xl bg-gray-50 dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-700 p-4">
          {fullTranscript ? (
            <p className="text-gray-900 dark:text-white leading-relaxed">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-400 dark:text-slate-500 italic">
                  {' '}
                  {interimTranscript}
                </span>
              )}
            </p>
          ) : (
            <p className="text-gray-400 dark:text-slate-500 italic">
              {isListening
                ? 'Start speaking... I\'m listening'
                : 'Your speech will appear here'}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleGetFeedback}
          disabled={!transcript.trim() || isListening || isLoadingFeedback}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
            transcript.trim() && !isListening && !isLoadingFeedback
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
          )}
        >
          {isLoadingFeedback ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              Get Feedback
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          disabled={!transcript && !feedback}
          className={clsx(
            'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
            transcript || feedback
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
          )}
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Feedback Error */}
      {feedbackError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {feedbackError}
        </div>
      )}

      {/* Feedback Results */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Overall Score */}
            <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Overall Score
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <ScoreCircle score={feedback.overallScore} label="Overall" />
                <ScoreCircle score={feedback.grammar.score} label="Grammar" />
                <ScoreCircle score={feedback.fluency.score} label="Fluency" />
                <ScoreCircle score={feedback.vocabulary.score} label="Vocab" />
              </div>
            </div>

            {/* Encouragement */}
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 ring-1 ring-green-100 dark:ring-green-800/30 p-4">
              <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                {feedback.encouragement}
              </p>
            </div>

            {/* Grammar Issues */}
            {feedback.grammar.issues.length > 0 && (
              <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Grammar
                  </h3>
                </div>
                <div className="space-y-3">
                  {feedback.grammar.issues.map((issue, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-gray-50 dark:bg-slate-900 p-3"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-red-400 line-through text-sm">
                          {issue.original}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                          {issue.corrected}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {issue.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fluency */}
            <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Fluency
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                {feedback.fluency.comments}
              </p>
            </div>

            {/* Vocabulary Suggestions */}
            {feedback.vocabulary.suggestions.length > 0 && (
              <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Vocabulary
                  </h3>
                </div>
                <div className="space-y-3">
                  {feedback.vocabulary.suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-gray-50 dark:bg-slate-900 p-3"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-gray-500 text-sm">
                          &quot;{sug.original}&quot;
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-purple-600 dark:text-purple-400 font-medium text-sm">
                          &quot;{sug.better}&quot;
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {sug.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pronunciation Tips */}
            {feedback.pronunciation.tips.length > 0 && (
              <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-gray-100 dark:ring-slate-700 p-5 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Pronunciation Tips
                  </h3>
                </div>
                <ul className="space-y-2">
                  {feedback.pronunciation.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300"
                    >
                      <span className="text-teal-500 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Mode = 'conversation' | 'practice';

export function SpeakingPractice() {
  const [mode, setMode] = useState<Mode>('conversation');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <Volume2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Speak With Me
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {mode === 'conversation'
                ? 'Have a live conversation with Aria, your AI tutor'
                : "I'll listen until you're done, then give detailed feedback"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode('conversation')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
              mode === 'conversation'
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            )}
          >
            <MessagesSquare className="w-4 h-4" />
            Conversation
          </button>
          <button
            onClick={() => setMode('practice')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
              mode === 'practice'
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Practice + Feedback
          </button>
        </div>
      </div>

      {/* Mode content */}
      <div className="flex-1 min-h-0">
        {mode === 'conversation' ? <ConversationView /> : <PracticeMode />}
      </div>
    </div>
  );
}
