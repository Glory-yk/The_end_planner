import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface AddTaskInputProps {
    onAdd: (title: string) => void;
}

export const AddTaskInput = ({ onAdd }: AddTaskInputProps) => {
    const [title, setTitle] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title);
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
                    placeholder="+ 할 일 추가"
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
