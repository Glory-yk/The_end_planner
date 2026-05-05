'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { lang = 'en-US', rate = 1.0, pitch = 1.0 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  const pickVoice = useCallback(
    (langCode: string): SpeechSynthesisVoice | null => {
      if (voices.length === 0) return null;
      const exact = voices.find((v) => v.lang === langCode);
      if (exact) return exact;
      const prefix = langCode.split('-')[0];
      const partial = voices.find((v) => v.lang.startsWith(prefix));
      return partial || voices[0];
    },
    [voices],
  );

  const speak = useCallback(
    (text: string, onEnd?: () => void): Promise<void> => {
      return new Promise((resolve) => {
        if (!isSupported || !text.trim()) {
          onEnd?.();
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = pitch;

        const voice = pickVoice(lang);
        if (voice) utterance.voice = voice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
          onEnd?.();
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
          onEnd?.();
          resolve();
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      });
    },
    [isSupported, lang, rate, pitch, pickVoice],
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
}
