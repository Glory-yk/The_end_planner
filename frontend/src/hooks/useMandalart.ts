// This hook is DEPRECATED.
// Please use useAppStore() instead for unified state management.
// Keeping this file to prevent import errors from old code.

import { useAppStore } from './useAppStore';

export const useMandalart = () => {
    const { mandalartData, updateMandalartCell } = useAppStore();

    return {
        data: mandalartData,
        updateCell: updateMandalartCell
    };
};
