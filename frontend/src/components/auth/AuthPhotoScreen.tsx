import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, Check, Flame, Calendar, Plus, Trash2 } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import clsx from 'clsx';

interface AuthPhotoScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Topic {
  id: string;
  label: string;
  color: string;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
];

type Step = 'topic' | 'date' | 'camera' | 'preview';

export const AuthPhotoScreen = ({ isOpen, onClose }: AuthPhotoScreenProps) => {
  const [step, setStep] = useState<Step>('topic');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicText, setNewTopicText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 진행 일수 계산
  const dayCount = differenceInDays(new Date(), startDate) + 1;

  // 로컬 스토리지에서 주제 목록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('auth_topics');
    if (saved) {
      try {
        setTopics(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse topics', e);
        setTopics([]);
      }
    }
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('topic');
      setSelectedTopic(null);
      setStartDate(new Date());
      setCapturedImage(null);
      setNewTopicText('');
    }
  }, [isOpen]);

  // 주제 추가
  const handleAddTopic = () => {
    if (!newTopicText.trim()) return;

    // 중복 체크
    if (topics.some(t => t.label === newTopicText.trim())) {
      alert('이미 존재하는 주제입니다.');
      return;
    }

    const color = COLORS[topics.length % COLORS.length]; // 순차적으로 색상 배정
    const newTopic: Topic = {
      id: Date.now().toString(),
      label: newTopicText.trim(),
      color,
    };

    const updated = [...topics, newTopic];
    setTopics(updated);
    localStorage.setItem('auth_topics', JSON.stringify(updated));
    setNewTopicText('');
  };

  // 주제 삭제
  const handleDeleteTopic = (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    if (window.confirm('이 주제를 삭제하시겠습니까?')) {
      const updated = topics.filter(t => t.id !== topicId);
      setTopics(updated);
      localStorage.setItem('auth_topics', JSON.stringify(updated));
    }
  };

  // 주제 선택
  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setStep('date');
  };

  // 날짜 선택 후 카메라로
  const handleDateConfirm = () => {
    setStep('camera');
  };

  // 카메라 촬영
  const handleTakePhoto = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1080,
        height: 1080,
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
        setStep('preview');
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  // 이미지에 오버레이 합성 후 저장
  const saveWithOverlay = useCallback(async () => {
    if (!capturedImage || !selectedTopic || !canvasRef.current) return;

    setIsSaving(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Canvas 크기 설정
      const size = 1080;
      canvas.width = size;
      canvas.height = size;

      // 배경 이미지 로드
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = capturedImage;
      });

      // 이미지를 정사각형으로 크롭해서 그리기
      const imgRatio = img.width / img.height;
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

      if (imgRatio > 1) {
        // 가로가 더 긴 경우
        sWidth = img.height;
        sx = (img.width - sWidth) / 2;
      } else {
        // 세로가 더 긴 경우
        sHeight = img.width;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

      // 그라데이션 오버레이
      const gradient = ctx.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // 상단 텍스트: [주제] 날짜시간
      ctx.fillStyle = 'white';
      ctx.font = 'bold 36px "Noto Sans KR", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const now = new Date();
      const timestamp = format(now, 'yyyy.MM.dd HH:mm');
      ctx.fillText(`[${selectedTopic.label}] ${timestamp}`, 40, 70);

      // 하단 텍스트
      ctx.font = 'bold 48px "Noto Sans KR", sans-serif';
      ctx.fillText(`${selectedTopic.label} 챌린지`, 60, size - 180);

      // Day 숫자
      ctx.font = 'bold 120px "Outfit", sans-serif';
      ctx.fillStyle = '#ff6b35';
      ctx.shadowBlur = 16;
      ctx.fillText(`🔥 Day ${dayCount}`, 60, size - 60);

      // 갤러리에 저장 (Data URL을 blob으로 변환)
      const dataUrl = canvas.toDataURL('image/png');

      // 웹 다운로드 트리거
      const link = document.createElement('a');
      link.download = `auth_${selectedTopic.id}_day${dayCount}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      // localStorage에 기록 저장
      const historyKey = `auth_history_${selectedTopic.id}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.push({
        date: now.toISOString(),
        day: dayCount,
        startDate: startDate.toISOString(),
      });
      localStorage.setItem(historyKey, JSON.stringify(history));

      alert('인증샷이 저장되었습니다! 🔥');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [capturedImage, selectedTopic, dayCount, startDate, onClose]);

  // 뒤로가기
  const handleBack = () => {
    if (step === 'date') setStep('topic');
    else if (step === 'camera') setStep('date');
    else if (step === 'preview') {
      setCapturedImage(null);
      setStep('camera');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4">
              {step !== 'topic' ? (
                <button onClick={handleBack} className="p-2 text-white">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              ) : (
                <div className="w-10" />
              )}
              <h1 className="text-white font-bold text-lg">
                {step === 'topic' && '주제 선택'}
                {step === 'date' && '시작 날짜'}
                {step === 'camera' && '인증 촬영'}
                {step === 'preview' && '미리보기'}
              </h1>
              <button onClick={onClose} className="p-2 text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Step 1: Topic Selection */}
                {step === 'topic' && (
                  <motion.div
                    key="topic"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 space-y-4"
                  >
                    <div className="flex gap-2 mb-6">
                      <input
                        type="text"
                        className="flex-1 bg-gray-800 border-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                        placeholder="새로운 챌린지 주제 입력"
                        value={newTopicText}
                        onChange={(e) => setNewTopicText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                      />
                      <button
                        onClick={handleAddTopic}
                        className="bg-primary text-white p-3 rounded-xl disabled:opacity-50"
                        disabled={!newTopicText.trim()}
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>

                    <p className="text-gray-400 text-sm px-1 mb-2">내 주제 목록</p>

                    {topics.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <p>아직 등록된 주제가 없습니다.</p>
                        <p className="text-sm mt-1">'독서', '운동' 같은 주제를 추가해보세요!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pb-8">
                        {topics.map((topic) => (
                          <motion.div
                            key={topic.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group"
                          >
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelectTopic(topic)}
                              className="w-full p-6 round-2xl border-2 border-gray-700 bg-gray-800/50 hover:border-primary transition-colors rounded-2xl flex flex-col items-center"
                            >
                              <div
                                className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center font-bold text-white text-xl shadow-lg"
                                style={{ backgroundColor: topic.color }}
                              >
                                {topic.label.charAt(0)}
                              </div>
                              <span className="text-white font-medium truncate w-full text-center">
                                {topic.label}
                              </span>
                            </motion.button>
                            <button
                              onClick={(e) => handleDeleteTopic(e, topic.id)}
                              className="absolute top-2 right-2 p-1.5 bg-gray-900/80 text-gray-400 hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Date Selection */}
                {step === 'date' && (
                  <motion.div
                    key="date"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 flex flex-col items-center"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                      style={{ backgroundColor: selectedTopic?.color }}
                    >
                      {selectedTopic?.label.charAt(0)}
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">
                      {selectedTopic?.label} 챌린지
                    </h2>
                    <p className="text-gray-400 text-sm mb-8">
                      챌린지를 시작한 날짜를 선택하세요
                    </p>

                    <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-gray-300">시작 날짜</span>
                      </div>
                      <input
                        type="date"
                        value={format(startDate, 'yyyy-MM-dd')}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full p-4 bg-gray-700 rounded-xl text-white text-center text-lg outline-none focus:ring-2 focus:ring-primary"
                      />

                      <div className="mt-6 p-4 bg-gray-700/50 rounded-xl">
                        <div className="flex items-center justify-center gap-2">
                          <Flame className="w-6 h-6 text-orange-500" />
                          <span className="text-3xl font-bold text-white">Day {dayCount}</span>
                        </div>
                        <p className="text-gray-400 text-sm text-center mt-2">
                          {format(startDate, 'yyyy년 M월 d일', { locale: ko })}부터 시작
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDateConfirm}
                      className="mt-8 px-8 py-4 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      촬영하기
                    </button>
                  </motion.div>
                )}

                {/* Step 3: Camera */}
                {step === 'camera' && (
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-4"
                  >
                    <div className="text-center mb-8">
                      <div
                        className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                        style={{ backgroundColor: selectedTopic?.color }}
                      >
                        {selectedTopic?.label.charAt(0)}
                      </div>
                      <h2 className="text-white text-2xl font-bold mb-2">
                        {selectedTopic?.label}
                      </h2>
                      <div className="flex items-center justify-center gap-2 text-orange-500">
                        <Flame className="w-6 h-6" />
                        <span className="text-4xl font-bold">Day {dayCount}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleTakePhoto}
                      className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    >
                      <Camera className="w-10 h-10 text-gray-900" />
                    </button>

                    <p className="text-gray-400 mt-6 text-center">
                      버튼을 눌러 인증 사진을 촬영하세요
                    </p>
                  </motion.div>
                )}

                {/* Step 4: Preview */}
                {step === 'preview' && capturedImage && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Preview with overlay */}
                    <div className="relative aspect-square mx-4 rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

                      {/* Top text */}
                      <div className="absolute top-4 left-4 text-white">
                        <span className="font-bold text-sm drop-shadow-lg">
                          [{selectedTopic?.label}] {format(new Date(), 'yyyy.MM.dd HH:mm')}
                        </span>
                      </div>

                      {/* Bottom text */}
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-lg font-semibold drop-shadow-lg mb-1">
                          {selectedTopic?.label} 챌린지
                        </p>
                        <p className="text-4xl font-bold text-orange-500 drop-shadow-lg flex items-center gap-2">
                          <Flame className="w-8 h-8" />
                          Day {dayCount}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-4 flex gap-3">
                      <button
                        onClick={handleBack}
                        className="flex-1 py-4 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                      >
                        다시 찍기
                      </button>
                      <button
                        onClick={saveWithOverlay}
                        disabled={isSaving}
                        className={clsx(
                          "flex-1 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors",
                          isSaving
                            ? "bg-gray-600 text-gray-400"
                            : "bg-primary text-white hover:bg-primary/90"
                        )}
                      >
                        {isSaving ? (
                          '저장 중...'
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            저장하기
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hidden canvas for image compositing */}
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
