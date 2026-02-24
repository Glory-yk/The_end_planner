import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeColor = string;

interface ThemeContextType {
    primaryColor: ThemeColor;
    setPrimaryColor: (color: ThemeColor) => void;
    presets: { name: string; value: string }[];
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const PRESETS = [
    { name: 'Ocean Blue', value: '#3b82f6' },
    { name: 'Coral Red', value: '#ef4444' },
    { name: 'Forest Green', value: '#22c55e' },
    { name: 'Royal Purple', value: '#a855f7' },
    { name: 'Sunset Orange', value: '#f97316' },
    { name: 'Midnight', value: '#0f172a' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    // Primary Color State
    const [primaryColor, setPrimaryColor] = useState<ThemeColor>(() => {
        return localStorage.getItem('theme-primary') || PRESETS[0].value;
    });

    // Dark Mode State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage first, could also check system preference here
        return localStorage.getItem('theme-mode') === 'dark';
    });

    // Handle Primary Color Updates
    useEffect(() => {
        localStorage.setItem('theme-primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary', primaryColor);

        const r = parseInt(primaryColor.slice(1, 3), 16);
        const g = parseInt(primaryColor.slice(3, 5), 16);
        const b = parseInt(primaryColor.slice(5, 7), 16);
        document.documentElement.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
    }, [primaryColor]);

    // Handle Dark Mode Updates
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme-mode', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme-mode', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, presets: PRESETS, isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
