/**
 * Safely accesses localStorage to avoid ReferenceError during Next.js SSR build
 */
export const getSafeLocalStorageItem = (key: string): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

export const setSafeLocalStorageItem = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
};

export const removeSafeLocalStorageItem = (key: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};
