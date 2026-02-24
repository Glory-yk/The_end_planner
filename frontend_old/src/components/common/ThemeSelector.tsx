import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Check, X, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeSelector = () => {
    const { primaryColor, setPrimaryColor, presets, isDarkMode, toggleDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors active:scale-95 dark:text-gray-300 dark:hover:bg-slate-700"
                title="Change Theme"
            >
                <Palette className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 z-50 origin-top-right"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Appearance</span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-slate-700">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Dark Mode</span>
                            <button
                                onClick={toggleDarkMode}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                            >
                                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {isDarkMode ? 'On' : 'Off'}
                                </span>
                            </button>
                        </div>

                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 block">Theme Color</span>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {presets.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => setPrimaryColor(preset.value)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative ring-1 ring-gray-100 dark:ring-slate-600"
                                    style={{ backgroundColor: preset.value }}
                                    title={preset.name}
                                >
                                    {primaryColor === preset.value && (
                                        <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Custom</span>
                            <div className="flex-1 h-8 rounded-lg overflow-hidden relative border border-gray-200 dark:border-slate-600">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div
                                    className="w-full h-full"
                                    style={{ backgroundColor: primaryColor }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
