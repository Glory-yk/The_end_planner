// v4: Enforce lenient input and strict save logic
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

interface TimePickerModalProps {
    isOpen: boolean;
    taskTitle: string;
    currentTime?: string;
    onClose: () => void;
    onConfirm: (time: string) => void;
    onClear: () => void;
}

export const TimePickerModal = ({
    isOpen,
    taskTitle,
    currentTime,
    onClose,
    onConfirm,
    onClear
}: TimePickerModalProps) => {
    // 입력 중 편의를 위해 문자열로 관리
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');
    const hourInputRef = useRef<HTMLInputElement>(null);
    const minuteInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const [h, m] = (currentTime || '09:00').split(':');
            setHour(h.padStart(2, '0'));
            setMinute(m.padStart(2, '0'));
            // 모달이 열릴 때 시 입력창에 포커스 및 전체 선택
            setTimeout(() => {
                if (hourInputRef.current) {
                    hourInputRef.current.focus();
                    hourInputRef.current.select();
                }
            }, 100);
        }
    }, [isOpen, currentTime]);

    const getClampedTime = (hStr: string, mStr: string) => {
        let hNum = parseInt(hStr || '0');
        let mNum = parseInt(mStr || '0');

        if (isNaN(hNum)) hNum = 9;
        if (isNaN(mNum)) mNum = 0;

        const h = Math.min(23, Math.max(0, hNum));
        const m = Math.min(59, Math.max(0, mNum));

        return {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0')
        };
    };

    const handleConfirm = () => {
        const { h, m } = getClampedTime(hour, minute);
        onConfirm(`${h}:${m}`);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '');

        if (val.length > 2) {
            // If user types more, take the last 2 digits (rolling input style)
            val = val.slice(-2);
        }

        // Allow entering any number (00-99) while typing.
        // We do NOT clamp > 23 here, to avoid interaction issues.
        // We only clamp on Blur or Confirm.

        setHour(val);

        // Auto-advance if 2 digits entered
        if (val.length === 2 && minuteInputRef.current) {
            minuteInputRef.current.focus();
            minuteInputRef.current.select(); // Select all in minute for easy overwrite
        }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '');

        if (val.length > 2) {
            val = val.slice(-2);
        }

        // Allow entering any number (00-99) while typing.
        setMinute(val);
    };

    const handleHourBlur = () => {
        if (!hour) return;
        const { h } = getClampedTime(hour, '0');
        setHour(h);
    };

    const handleMinuteBlur = () => {
        if (!minute) return;
        const { m } = getClampedTime('0', minute);
        setMinute(m);
    };

    // 키보드 방향키 조작 지원
    const handleKeyDown = (e: React.KeyboardEvent, type: 'hour' | 'minute') => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (type === 'hour') {
                const h = parseInt(hour || '0');
                const nextH = isNaN(h) ? 0 : (h + 1) % 24;
                setHour(nextH.toString().padStart(2, '0'));
            } else {
                const m = parseInt(minute || '0');
                // 5분 단위 증가
                const nextM = Math.ceil(((isNaN(m) ? 0 : m) + 1) / 5) * 5;
                setMinute((nextM % 60).toString().padStart(2, '0'));
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (type === 'hour') {
                const h = parseInt(hour || '0');
                const prevH = isNaN(h) ? 23 : (h - 1 < 0 ? 23 : h - 1);
                setHour(prevH.toString().padStart(2, '0'));
            } else {
                const m = parseInt(minute || '0');
                // 5분 단위 감소
                const prevM = Math.floor(((isNaN(m) ? 0 : m) - 1) / 5) * 5;
                setMinute((prevM < 0 ? 55 : prevM).toString().padStart(2, '0'));
            }
        } else if (e.key === 'Enter') {
            handleConfirm();
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-gray-900 dark:text-white font-sans">시간 설정 (24시간)</span>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Task Title */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-900/50">
                            <p className="text-sm text-gray-600 dark:text-slate-300 truncate font-sans">{taskTitle}</p>
                        </div>

                        {/* Time Picker Input */}
                        <div className="p-8 flex justify-center items-center gap-4">
                            <input
                                ref={hourInputRef}
                                type="text"
                                inputMode="numeric"
                                value={hour}
                                onChange={handleHourChange}
                                onBlur={handleHourBlur}
                                onKeyDown={(e) => handleKeyDown(e, 'hour')}
                                onFocus={handleFocus}
                                placeholder="00"
                                className="w-20 text-center text-5xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary outline-none dark:text-white font-sans placeholder:text-gray-200"
                            />
                            <span className="text-4xl font-bold text-gray-300 dark:text-slate-600 pb-2">:</span>
                            <input
                                ref={minuteInputRef}
                                type="text"
                                inputMode="numeric"
                                value={minute}
                                onChange={handleMinuteChange}
                                onBlur={handleMinuteBlur}
                                onKeyDown={(e) => handleKeyDown(e, 'minute')}
                                onFocus={handleFocus}
                                placeholder="00"
                                className="w-20 text-center text-5xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary outline-none dark:text-white font-sans placeholder:text-gray-200"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 p-4 border-t border-gray-100 dark:border-slate-700">
                            {currentTime && (
                                <button
                                    onClick={onClear}
                                    className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors font-sans"
                                >
                                    시간 해제
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-3 text-sm font-medium bg-black dark:bg-primary text-white rounded-xl hover:bg-gray-800 dark:hover:bg-primary/90 transition-colors font-sans"
                            >
                                확인
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
