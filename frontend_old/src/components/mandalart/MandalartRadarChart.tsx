import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface RadarData {
    label: string;
    value: number; // 0-100
    color: string;
}

interface MandalartRadarChartProps {
    data: RadarData[];
    size?: number;
}

export const MandalartRadarChart = ({ data, size = 300 }: MandalartRadarChartProps) => {
    // 8 points for Mandalart
    const NUM_POINTS = 8;
    const CENTER = size / 2;
    const RADIUS = (size / 2) - 40; // Padding for labels

    // Calculate points for the polygon
    const getPoint = (index: number, value: number) => {
        const angle = (Math.PI * 2 * index) / NUM_POINTS - Math.PI / 2;
        const r = (RADIUS * value) / 100;
        const x = CENTER + r * Math.cos(angle);
        const y = CENTER + r * Math.sin(angle);
        return { x, y };
    };

    // Current data polygon path
    const dataPath = useMemo(() => {
        return data.map((d, i) => {
            const { x, y } = getPoint(i, d.value);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ') + ' Z';
    }, [data, CENTER, RADIUS]);

    // Background Grid (Spider Web) - 20%, 40%, 60%, 80%, 100%
    const gridLevels = [20, 40, 60, 80, 100];

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Grid */}
                {gridLevels.map((level) => (
                    <polygon
                        key={level}
                        points={Array.from({ length: NUM_POINTS }).map((_, i) => {
                            const { x, y } = getPoint(i, level);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={0.1}
                        strokeDasharray={level === 100 ? "" : "4 4"}
                        className="text-gray-400 dark:text-gray-600"
                    />
                ))}

                {/* Axes */}
                {Array.from({ length: NUM_POINTS }).map((_, i) => {
                    const { x, y } = getPoint(i, 100);
                    return (
                        <line
                            key={i}
                            x1={CENTER}
                            y1={CENTER}
                            x2={x}
                            y2={y}
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            className="text-gray-400 dark:text-gray-600"
                        />
                    );
                })}

                {/* Data Area */}
                <motion.path
                    initial={{
                        d: data.map((_, i) => {
                            const { x, y } = getPoint(i, 0);
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ') + ' Z'
                    }}
                    animate={{ d: dataPath }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    fill="rgba(59, 130, 246, 0.2)" // Primary color with opacity
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    className="drop-shadow-sm"
                />

                {/* Data Points */}
                {data.map((d, i) => {
                    const { x, y } = getPoint(i, d.value);
                    return (
                        <motion.circle
                            key={i}
                            initial={{ cx: CENTER, cy: CENTER, opacity: 0 }}
                            animate={{ cx: x, cy: y, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 }}
                            r={4}
                            fill={d.color || 'var(--color-primary)'}
                            stroke="white"
                            strokeWidth={2}
                            className="dark:stroke-slate-800"
                        />
                    );
                })}

                {/* Labels */}
                {data.map((d, i) => {
                    const { x, y } = getPoint(i, 115); // Place slightly outside via percentage

                    return (
                        <foreignObject
                            key={i}
                            x={x - 40}
                            y={y - 10}
                            width={80}
                            height={25}
                            style={{ overflow: 'visible' }}
                        >
                            <div
                                className={`text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300 text-center truncate px-1 rounded bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm`}
                                title={d.label}
                            >
                                {d.label}
                            </div>
                        </foreignObject>
                    );
                })}
            </svg>
        </div>
    );
};
