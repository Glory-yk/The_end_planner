import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BackgroundContainerProps {
    children: React.ReactNode;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const BackgroundContainer = ({ children }: BackgroundContainerProps) => {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours();

            if (hour >= 6 && hour < 12) {
                setTimeOfDay('morning');
            } else if (hour >= 12 && hour < 18) {
                setTimeOfDay('afternoon');
            } else if (hour >= 18 && hour < 22) {
                setTimeOfDay('evening');
            } else {
                setTimeOfDay('night');
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const getGradient = (time: TimeOfDay) => {
        switch (time) {
            case 'morning':
                // Warm Peach: #FFE5B4 -> #FCB69F
                return 'linear-gradient(135deg, #FFE5B4 0%, #FFECD2 50%, #FCB69F 100%)';
            case 'afternoon':
                // Energetic: #667eea -> #f093fb
                return 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)';
            case 'evening':
                // Calm Deep: Teal/Slate
                return 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)';
            case 'night':
                // Dark Mode: Deep Blue/Black
                return 'linear-gradient(135deg, #0f172a 0%, #334155 100%)';
        }
    };

    return (
        <motion.div
            className="min-h-screen w-full transition-colors duration-1000 relative overflow-hidden"
            animate={{ background: getGradient(timeOfDay) }}
            transition={{ duration: 2 }} // Smooth gradient transition
        >
            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
