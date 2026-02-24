import { motion } from 'framer-motion';

const QUOTES = [
    "The secret of getting ahead is getting started.",
    "Focus on being productive instead of busy.",
    "Your future is created by what you do today.",
    "Small steps every day add up to big results."
];

export const FocusQuote = () => {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
        >
            <p className="text-xl font-serif italic text-gray-400 mb-2">"{randomQuote}"</p>
            <div className="w-12 h-1 bg-gray-100 rounded-full" />
        </motion.div>
    );
};
