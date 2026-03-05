'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
    CalendarDays, Flag, Clock, ChevronDown, X, Target, Plus
} from 'lucide-react';

// ── Time parsing ──────────────────────────────────────────────────────────────

/**
 * 제목에서 HH:MM 패턴을 찾아 분리
 * e.g. "발표 준비 10:00" → { cleanTitle: "발표 준비", time: "10:00" }
 */
function parseTimeFromText(text: string): { cleanTitle: string; time: string | null } {
    const match = text.match(/\b(\d{1,2}):(\d{2})\b/);
    if (!match) return { cleanTitle: text, time: null };
    const h = match[1].padStart(2, '0');
    const m = match[2];
    if (parseInt(h) > 23 || parseInt(m) > 59) return { cleanTitle: text, time: null };
    return {
        cleanTitle: text.replace(match[0], '').replace(/\s+/g, ' ').trim(),
        time: `${h}:${m}`,
    };
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const toDay = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

    if (dateStr === toDay(today)) return '오늘';
    if (dateStr === toDay(tomorrow)) return '내일';

    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTimePretty(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h < 12 ? '오전' : '오후';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${period} ${hour}시${m > 0 ? m + '분' : ''}`;
}

// ── Priority config ───────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
    { value: 0, label: '우선 순위', color: 'text-gray-400' },
    { value: 1, label: '낮음', color: 'text-green-500' },
    { value: 2, label: '보통', color: 'text-yellow-500' },
    { value: 3, label: '높음', color: 'text-red-500' },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface AddTaskFormData {
    title: string;
    description?: string;
    scheduledDate?: string | null;
    startTime?: string | null;
    duration?: number | null;
    deadline?: string | null;
    priority?: number;
}

interface AddTaskFormProps {
    projectName: string;
    projectColor?: string | null;
    /** 하위 태스크를 추가 중인 부모 이름 (있으면 표시됨) */
    parentLabel?: string | null;
    isSubmitting?: boolean;
    onSubmit: (data: AddTaskFormData) => Promise<void>;
    onCancel: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const AddTaskForm = ({
    projectName,
    projectColor,
    parentLabel,
    isSubmitting,
    onSubmit,
    onCancel,
}: AddTaskFormProps) => {
    const themeColor = projectColor || '#ef4444';

    // raw input (title + optional time typed inline)
    const [rawTitle, setRawTitle] = useState('');
    const [description, setDescription] = useState('');

    // chips state
    const [scheduledDate, setScheduledDate] = useState('');
    const [startTime, setStartTime] = useState('');          // HH:mm
    const [duration, setDuration] = useState('');             // minutes as string
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState(0);

    // popover toggles
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showDurationPicker, setShowDurationPicker] = useState(false);
    const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);

    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => { titleRef.current?.focus(); }, []);

    // ── Time parsing from title ───────────────────────────────────────────────

    const handleTitleChange = (val: string) => {
        const { cleanTitle, time } = parseTimeFromText(val);
        if (time) {
            setStartTime(time);
            setRawTitle(cleanTitle);
        } else {
            setRawTitle(val);
        }
    };

    // Derive display title (without the time, which is shown as chip)
    const displayTitle = rawTitle;

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!displayTitle.trim()) return;
        await onSubmit({
            title: displayTitle.trim(),
            description: description.trim() || undefined,
            scheduledDate: scheduledDate || null,
            startTime: startTime || null,
            duration: duration ? parseInt(duration) : null,
            deadline: deadline || null,
            priority,
        });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') onCancel();
    };

    // ── Chip helpers ──────────────────────────────────────────────────────────

    const clearStartTime = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStartTime('');
    };
    const clearDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScheduledDate('');
        setShowDatePicker(false);
    };
    const clearDuration = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDuration('');
        setShowDurationPicker(false);
    };
    const clearDeadline = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeadline('');
        setShowDeadlinePicker(false);
    };

    const dateLabel = scheduledDate
        ? `${formatDateLabel(scheduledDate)}${startTime ? ' ' + formatTimePretty(startTime) : ''}`
        : null;

    const priorityOpt = PRIORITY_OPTIONS.find(p => p.value === priority) ?? PRIORITY_OPTIONS[0];

    return (
        <div
            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden"
        >
            {/* ── Parent hint ── */}
            {parentLabel && (
                <div className="px-4 pt-3 text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span><span className="font-medium">{parentLabel}</span>의 하위 할 일</span>
                </div>
            )}

            {/* ── Title ── */}
            <div className="px-4 pt-3">
                <input
                    ref={titleRef}
                    type="text"
                    value={displayTitle}
                    onChange={e => handleTitleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="할 일 제목"
                    className="w-full text-lg font-bold bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600"
                />
            </div>

            {/* ── Parsed time badge ── */}
            {startTime && (
                <div className="px-4 pt-1">
                    <span
                        className="inline-flex items-center gap-1.5 text-2xl font-bold px-3 py-1 rounded-lg text-white select-none"
                        style={{ backgroundColor: themeColor }}
                    >
                        {startTime}
                        <button
                            onClick={clearStartTime}
                            className="opacity-70 hover:opacity-100 transition-opacity ml-1"
                            title="시간 제거"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </span>
                </div>
            )}

            {/* ── Description ── */}
            <div className="px-4 pt-2 pb-1">
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="설명"
                    rows={1}
                    className="w-full text-sm bg-transparent outline-none text-gray-500 dark:text-slate-400 placeholder-gray-300 dark:placeholder-slate-600 resize-none leading-relaxed"
                    onInput={e => {
                        const t = e.currentTarget;
                        t.style.height = 'auto';
                        t.style.height = t.scrollHeight + 'px';
                    }}
                />
            </div>

            {/* ── Chip row ── */}
            <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-gray-100 dark:border-slate-800">

                {/* Date chip */}
                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(v => !v)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${dateLabel
                            ? 'border-transparent bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                            : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                    >
                        <CalendarDays className="w-3.5 h-3.5" />
                        {dateLabel ?? '날짜'}
                        {dateLabel && (
                            <span onClick={clearDate} className="ml-1 hover:text-red-500 transition-colors">
                                <X className="w-3 h-3" />
                            </span>
                        )}
                    </button>
                    {showDatePicker && (
                        <div className="absolute top-full left-0 mt-1 z-50 flex flex-col gap-1 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl">
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={e => { setScheduledDate(e.target.value); setShowDatePicker(false); }}
                                className="text-xs bg-transparent border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none text-gray-700 dark:text-slate-300 focus:border-primary/50"
                            />
                        </div>
                    )}
                </div>

                {/* Priority chip */}
                <div className="relative">
                    <button
                        onClick={() => setShowPriorityMenu(v => !v)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${priority > 0
                            ? 'border-transparent bg-yellow-50 dark:bg-yellow-900/20 font-medium ' + priorityOpt.color
                            : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300'
                            }`}
                    >
                        <Flag className="w-3.5 h-3.5" />
                        {priorityOpt.label}
                        <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>
                    {showPriorityMenu && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[120px]">
                            {PRIORITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { setPriority(opt.value); setShowPriorityMenu(false); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${opt.color}`}
                                >
                                    <Flag className="w-3.5 h-3.5" />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Duration chip */}
                <div className="relative">
                    <button
                        onClick={() => setShowDurationPicker(v => !v)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${duration
                            ? 'border-transparent bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300'
                            }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        {duration ? `${duration}분` : '작업 시간'}
                        {duration && (
                            <span onClick={clearDuration} className="ml-1 hover:text-red-500 transition-colors">
                                <X className="w-3 h-3" />
                            </span>
                        )}
                    </button>
                    {showDurationPicker && (
                        <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl flex gap-1 flex-wrap w-44">
                            {[15, 30, 45, 60, 90, 120].map(min => (
                                <button
                                    key={min}
                                    onClick={() => { setDuration(String(min)); setShowDurationPicker(false); }}
                                    className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-primary/20 hover:text-primary transition-colors text-gray-600 dark:text-slate-300"
                                >
                                    {min >= 60 ? `${min / 60}시간` : `${min}분`}
                                </button>
                            ))}
                            <input
                                type="number"
                                placeholder="직접 입력(분)"
                                className="w-full mt-1 text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-transparent outline-none text-gray-700 dark:text-slate-300 focus:border-primary/50"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        const v = (e.target as HTMLInputElement).value;
                                        if (v) { setDuration(v); setShowDurationPicker(false); }
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Deadline chip */}
                <div className="relative">
                    <button
                        onClick={() => setShowDeadlinePicker(v => !v)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${deadline
                            ? 'border-transparent bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                            : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300'
                            }`}
                    >
                        <Target className="w-3.5 h-3.5" />
                        {deadline ? `마감 ${formatDateLabel(deadline)}` : '마감일'}
                        {deadline && (
                            <span onClick={clearDeadline} className="ml-1 hover:text-red-500 transition-colors">
                                <X className="w-3 h-3" />
                            </span>
                        )}
                    </button>
                    {showDeadlinePicker && (
                        <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl">
                            <input
                                type="date"
                                value={deadline}
                                onChange={e => { setDeadline(e.target.value); setShowDeadlinePicker(false); }}
                                className="text-xs bg-transparent border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none text-gray-700 dark:text-slate-300 focus:border-primary/50"
                            />
                        </div>
                    )}
                </div>

                {/* Time chip (manual pick, separate from auto-parse) */}
                {!startTime && (
                    <div className="relative">
                        <button
                            onClick={() => setShowTimePicker(v => !v)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 transition-colors"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            시간
                        </button>
                        {showTimePicker && (
                            <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl">
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={e => { setStartTime(e.target.value); setShowTimePicker(false); }}
                                    className="text-xs bg-transparent border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 outline-none text-gray-700 dark:text-slate-300 focus:border-primary/50 w-28"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Bottom bar ── */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                {/* Project tag */}
                <span
                    className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                    style={{ color: themeColor }}
                >
                    <span className="text-sm font-bold">#</span>
                    {projectName}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!displayTitle.trim() || isSubmitting}
                        className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: themeColor }}
                    >
                        {isSubmitting ? '추가 중...' : '작업 추가'}
                    </button>
                </div>
            </div>
        </div>
    );
};
