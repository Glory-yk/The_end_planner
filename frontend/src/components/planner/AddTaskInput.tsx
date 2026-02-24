import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface AddTaskInputProps {
    onAdd: (title: string, time?: string) => void;
}

export const AddTaskInput = ({ onAdd }: AddTaskInputProps) => {
    const [title, setTitle] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        // Parse time hashtag (e.g., #14:00, #9:00, #1400, #9)
        // Regex looks for # followed by 1-2 digits, optionally : and 2 digits
        // Matches: #14, #9, #14:30, #09:00
        const timeRegex = /#(\d{1,2})(?::(\d{2}))?/;
        const match = title.match(timeRegex);

        let finalTitle = title;
        let timeStr: string | undefined;

        if (match) {
            const [fullMatch, hour, minute] = match;
            const h = parseInt(hour);
            const m = minute ? parseInt(minute) : 0;

            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
                timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                // Remove the hashtag from the title
                finalTitle = title.replace(fullMatch, '').trim();
                // Clean up double spaces if any
                finalTitle = finalTitle.replace(/\s+/, ' ');
            }
        }

        onAdd(finalTitle, timeStr);
        setTitle('');
    };

    return (
        <motion.div
            className="px-6 mb-4 sticky top-4 z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <form
                onSubmit={handleSubmit}
                className={`relative flex items-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm transition-all p-1 ${isFocused
                    ? 'ring-2 ring-primary/20'
                    : 'ring-1 ring-gray-100 dark:ring-slate-700'
                    }`}
            >
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="+ 할 일 추가 (#14 또는 #14:30으로 시간 지정)"
                    className="w-full px-4 py-3 bg-transparent outline-none text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className={clsx(
                        "p-2 rounded-xl transition-all",
                        title.trim()
                            ? "bg-primary text-white shadow-md hover:bg-primary/90"
                            : "bg-gray-100 text-gray-400"
                    )}
                    disabled={!title.trim()}
                >
                    <Plus className="w-5 h-5" />
                </motion.button>
            </form>
        </motion.div>
    );
};
