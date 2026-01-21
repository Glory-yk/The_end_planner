export interface MotivationalQuote {
    text: string;
    author?: string;
    category: 'start' | 'progress' | 'complete' | 'general';
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
    // Start Quotes
    {
        text: "큰 목표는 작은 단계로 나누면 이룰 수 있습니다.",
        category: 'start'
    },
    {
        text: "시작이 반이다. 첫 걸음을 내딛는 것만으로도 대단해요!",
        category: 'start'
    },
    {
        text: "명확한 목표는 성공으로 가는 지도입니다.",
        category: 'start'
    },

    // Progress Quotes
    {
        text: "한 걸음 한 걸음이 모여 길이 됩니다.",
        category: 'progress'
    },
    {
        text: "진행 중이라는 것 자체가 성공입니다!",
        category: 'progress'
    },
    {
        text: "꾸준함이 천재를 이깁니다.",
        category: 'progress'
    },

    // Complete Quotes
    {
        text: "축하합니다! 목표를 완성했어요! 🎉",
        category: 'complete'
    },
    {
        text: "완벽한 계획이 완성되었습니다! 이제 실행만 남았어요!",
        category: 'complete'
    },
    {
        text: "당신의 꿈이 더 선명해졌습니다! ✨",
        category: 'complete'
    },

    // General Inspirational Quotes
    {
        text: "행동은 모든 성공의 가장 기본적인 열쇠다.",
        author: "파블로 피카소",
        category: 'general'
    },
    {
        text: "성공은 매일 반복한 작은 노력들의 합이다.",
        author: "로버트 콜리어",
        category: 'general'
    },
    {
        text: "목표 없는 꿈은 한낱 꿈일 뿐이다.",
        author: "괴테",
        category: 'general'
    },
    {
        text: "위대한 일을 하려면 행동할 뿐만 아니라 꿈도 꾸어야 하고, 계획할 뿐만 아니라 믿어야 한다.",
        author: "아나톨 프랑스",
        category: 'general'
    },
    {
        text: "할 수 있다고 믿으면 이미 절반은 이룬 것이다.",
        author: "시어도어 루스벨트",
        category: 'general'
    }
];

export const getQuoteByCategory = (category: 'start' | 'progress' | 'complete' | 'general') => {
    const quotes = MOTIVATIONAL_QUOTES.filter(q => q.category === category);
    return quotes[Math.floor(Math.random() * quotes.length)];
};

export const getRandomQuote = () => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};
