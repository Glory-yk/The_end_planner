export interface MainGoalTemplate {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    centerGoal: string;
}

export interface SubGoalTemplate {
    id: string;
    name: string;
    icon: string;
    category: string;
    suggestions: string[]; // 8 suggestions for sub-goal cells
}

// Main Goal Templates
export const MAIN_GOAL_TEMPLATES: MainGoalTemplate[] = [
    { id: 'health', name: '건강한 삶', icon: '💪', category: '건강', description: '신체적, 정신적 건강 증진', centerGoal: '건강한 삶' },
    { id: 'study', name: '학습 목표', icon: '📚', category: '학습', description: '지식과 기술 향상', centerGoal: '전문가 되기' },
    { id: 'english', name: '영어 마스터', icon: '🌎', category: '어학', description: '영어 능력 향상', centerGoal: '영어 유창하게' },
    { id: 'career', name: '커리어 성장', icon: '💼', category: '커리어', description: '전문성 강화', centerGoal: '커리어 성장' },
    { id: 'finance', name: '재정 관리', icon: '💰', category: '재정', description: '경제적 자유', centerGoal: '재정 자유' },
    { id: 'habit', name: '좋은 습관', icon: '🎯', category: '습관', description: '일상 루틴 개선', centerGoal: '좋은 습관' },
    { id: 'relationship', name: '관계 개선', icon: '❤️', category: '관계', description: '소중한 인연', centerGoal: '좋은 관계' },
    { id: 'coding', name: '개발 실력', icon: '💻', category: '개발', description: '코딩 마스터', centerGoal: '시니어 개발자' }
];

// Sub-Goal Templates by Category
export const SUB_GOAL_TEMPLATES: Record<string, SubGoalTemplate[]> = {
    health: [
        { id: 'exercise', name: '규칙적인 운동', icon: '🏃', category: '건강', suggestions: ['아침 조깅', '근력 운동', '요가/필라테스', '스트레칭', '주 3회 이상', '운동 기록', '헬스장 등록', '홈트 루틴'] },
        { id: 'diet', name: '건강한 식습관', icon: '🥗', category: '건강', suggestions: ['채소 많이', '단백질 섭취', '물 2L', '간식 줄이기', '식사 시간', '영양 균형', '과식 방지', '건강식 레시피'] },
        { id: 'sleep', name: '충분한 수면', icon: '😴', category: '건강', suggestions: ['7-8시간', '규칙적 취침', '기상 시간', '수면 환경', '카페인 제한', '스마트폰 OFF', '이완 루틴', '수면 추적'] },
        { id: 'stress', name: '스트레스 관리', icon: '🧘', category: '건강', suggestions: ['명상 10분', '호흡 운동', '취미 시간', '산책', '일기 쓰기', '음악 감상', '친구 만남', '휴식 시간'] }
    ],
    study: [
        { id: 'daily-study', name: '매일 공부', icon: '📖', category: '학습', suggestions: ['2시간 확보', '플래너 작성', '집중 시간', '복습 30분', '노트 정리', '이해 확인', '문제 풀이', '학습 기록'] },
        { id: 'online-course', name: '온라인 강의', icon: '💻', category: '학습', suggestions: ['강의 등록', '매일 1강', '필기', '실습', '질문하기', '진도 관리', '완강 목표', '수료증'] },
        { id: 'reading', name: '독서', icon: '📚', category: '학습', suggestions: ['월 2권', '관련 서적', '노트 작성', '핵심 정리', '독서 시간', '서점 방문', '리뷰 쓰기', '독서 모임'] },
        { id: 'practice', name: '실습 프로젝트', icon: '🛠️', category: '학습', suggestions: ['프로젝트 기획', '단계별 진행', '코드/자료', '포트폴리오', '피드백', '개선', '공유하기', '완성도'] }
    ],
    english: [
        { id: 'listening', name: '듣기 연습', icon: '🎧', category: '어학', suggestions: ['매일 30분', '팟캐스트', '미드/영화', 'TED 강연', '받아쓰기', '쉐도잉', '속도 조절', '반복 청취'] },
        { id: 'vocabulary', name: '영단어 암기', icon: '📝', category: '어학', suggestions: ['하루 20개', '앱 활용', '문장으로', '복습', '단어장', '연상법', '예문 작성', '테스트'] },
        { id: 'writing', name: '영어 작문', icon: '✍️', category: '어학', suggestions: ['일기 쓰기', '에세이', '문법 확인', '첨삭', '표현 정리', '템플릿', '매일 5문장', '블로그'] },
        { id: 'speaking', name: '회화 연습', icon: '🗣️', category: '어학', suggestions: ['스터디 참여', '원어민 대화', '녹음 연습', '발음 교정', '프리토킹', '상황극', '자신감', '실전 연습'] }
    ],
    career: [
        { id: 'skill-up', name: '업무 스킬', icon: '⚡', category: '커리어', suggestions: ['전문 지식', '도구 활용', '효율화', '자동화', '문서화', '프로세스', '베스트 프랙티스', '지속 학습'] },
        { id: 'certification', name: '자격증', icon: '🏆', category: '커리어', suggestions: ['목표 설정', '시험 일정', '학습 계획', '교재 구입', '인강 수강', '모의고사', '약점 보완', '합격'] },
        { id: 'networking', name: '네트워킹', icon: '🤝', category: '커리어', suggestions: ['업계 모임', 'LinkedIn', '컨퍼런스', '멘토 찾기', '정기 만남', '정보 교류', '인맥 관리', '기여하기'] },
        { id: 'side-project', name: '사이드 프로젝트', icon: '🚀', category: '커리어', suggestions: ['아이디어', '기획서', '개발/실행', 'MVP', '피드백', '개선', '런칭', '성과 정리'] }
    ],
    finance: [
        { id: 'saving', name: '저축', icon: '🏦', category: '재정', suggestions: ['목표 금액', '월 저축액', '자동 이체', '비상금', '적금', '저축 통장', '지출 줄이기', '목표 달성'] },
        { id: 'expense', name: '지출 관리', icon: '📊', category: '재정', suggestions: ['가계부', '고정비', '변동비', '불필요 지출', '카드 통제', '영수증', '월말 정산', '예산 설정'] },
        { id: 'investment', name: '투자', icon: '📈', category: '재정', suggestions: ['재테크 공부', '주식', '펀드', '부동산', '포트폴리오', '리스크 관리', '장기 투자', '수익률'] },
        { id: 'side-income', name: '부업', icon: '💵', category: '재정', suggestions: ['재능 활용', '플랫폼', '시간 관리', '수입 목표', '세금', '확장', '자동화', '복수 수입'] }
    ],
    habit: [
        { id: 'morning', name: '아침 루틴', icon: '🌅', category: '습관', suggestions: ['일찍 기상', '물 마시기', '스트레칭', '명상', '계획 확인', '건강한 아침', '에너지 충전', '하루 준비'] },
        { id: 'evening', name: '저녁 루틴', icon: '🌙', category: '습관', suggestions: ['정리 정돈', '내일 준비', '일기 쓰기', '감사 3가지', '독서', '전자기기 OFF', '이완', '수면 준비'] },
        { id: 'meditation', name: '명상/요가', icon: '🧘', category: '습관', suggestions: ['매일 10분', '호흡 집중', '마음 챙김', '스트레스 해소', '앱 활용', '루틴화', '점진적 증가', '평온함'] },
        { id: 'digital-detox', name: '디지털 디톡스', icon: '📵', category: '습관', suggestions: ['스마트폰 줄이기', 'SNS 시간', '알림 OFF', '독서 시간', '오프라인', '취침 2시간 전', '주말 디톡스', '균형'] }
    ],
    relationship: [
        { id: 'family', name: '가족과 시간', icon: '👨‍👩‍👧‍👦', category: '관계', suggestions: ['함께 식사', '대화 시간', '여행', '기념일', '전화', '관심 표현', '이해하기', '추억 만들기'] },
        { id: 'friends', name: '친구 만남', icon: '👥', category: '관계', suggestions: ['정기 모임', '소식 나누기', '함께 활동', '진심 대화', '축하/위로', '먼저 연락', '우정 유지', '새 인연'] },
        { id: 'communication', name: '소통', icon: '💬', category: '관계', suggestions: ['경청하기', '공감 표현', '감사 전달', '칭찬', '솔직함', '이해', '갈등 해결', '존중'] },
        { id: 'volunteer', name: '봉사활동', icon: '🤲', category: '관계', suggestions: ['봉사 참여', '정기 활동', '재능 기부', '나눔', '공동체', '의미', '보람', '인연'] }
    ],
    coding: [
        { id: 'algorithm', name: '알고리즘', icon: '🧩', category: '개발', suggestions: ['매일 1문제', 'LeetCode', '백준', '이해', '최적화', '복잡도', '패턴', '복습'] },
        { id: 'project', name: '프로젝트', icon: '🎨', category: '개발', suggestions: ['아이디어', '설계', '구현', '테스트', 'Git', 'README', '배포', '유지보수'] },
        { id: 'code-review', name: '코드 리뷰', icon: '👀', category: '개발', suggestions: ['동료 코드', '피드백', '베스트 프랙티스', '리팩토링', '질문', '공유', '토론', '성장'] },
        { id: 'blog', name: '기술 블로그', icon: '📝', category: '개발', suggestions: ['주 1회', '학습 정리', '트러블슈팅', 'TIL', '시리즈', 'SEO', '피드백', '꾸준함'] }
    ]
};

// Helper functions
export const getMainGoalTemplate = (id: string) => {
    return MAIN_GOAL_TEMPLATES.find(t => t.id === id);
};

export const getSubGoalTemplates = (category: string) => {
    return SUB_GOAL_TEMPLATES[category] || [];
};

// Legacy support - Full templates for backward compatibility
export interface MandalartTemplate {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    centerGoal: string;
    subGoals: string[];
}

export const MANDALART_TEMPLATES: MandalartTemplate[] = MAIN_GOAL_TEMPLATES.map(main => {
    const subTemplates = getSubGoalTemplates(main.id);
    return {
        ...main,
        subGoals: subTemplates.slice(0, 8).map(t => t.name)
    };
});
