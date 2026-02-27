import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, HelpCircle, Lightbulb, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface HelpCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'guide' | 'examples' | 'faq';

export const MandalartHelpCenter = ({ isOpen, onClose }: HelpCenterProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('guide');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[85vh] bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    만다라트 가이드
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex-shrink-0 flex border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('guide')}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-medium text-sm",
                                    activeTab === 'guide'
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                            >
                                <BookOpen className="w-4 h-4" />
                                작성 가이드
                            </button>
                            <button
                                onClick={() => setActiveTab('examples')}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-medium text-sm",
                                    activeTab === 'examples'
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                            >
                                <Lightbulb className="w-4 h-4" />
                                성공 사례
                            </button>
                            <button
                                onClick={() => setActiveTab('faq')}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-medium text-sm",
                                    activeTab === 'faq'
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                                )}
                            >
                                <HelpCircle className="w-4 h-4" />
                                자주 묻는 질문
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'guide' && <GuideContent key="guide" />}
                                {activeTab === 'examples' && <ExamplesContent key="examples" />}
                                {activeTab === 'faq' && <FAQContent key="faq" />}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const GuideContent = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-6"
    >
        <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                만다라트란?
            </h3>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                만다라트는 일본의 디자이너 이마이즈미 히로아키가 개발한 목표 달성 기법입니다.
                9x9 칸의 표를 사용하여 중심 목표에서 시작해 세부 목표와 실행 계획을 체계적으로 정리합니다.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                작성 방법
            </h3>
            <div className="space-y-3">
                {[
                    { step: 1, title: "중심 목표 설정", desc: "가장 이루고 싶은 최종 목표를 중앙에 작성하세요." },
                    { step: 2, title: "8개 세부 목표", desc: "중심 목표를 달성하기 위한 8가지 중요한 영역을 주변에 작성하세요." },
                    { step: 3, title: "실행 계획 세우기", desc: "각 세부 목표를 클릭하여 구체적인 실행 계획 8가지를 작성하세요." }
                ].map((item) => (
                    <div key={item.step} className="flex gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                            {item.step}
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-300">{item.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                💡 작성 팁
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>구체적이고 측정 가능한 목표를 작성하세요</span>
                </li>
                <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>현실적으로 달성 가능한 목표를 설정하세요</span>
                </li>
                <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>동사로 시작하는 실행 가능한 문장으로 작성하세요</span>
                </li>
            </ul>
        </section>
    </motion.div>
);

const ExamplesContent = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-4"
    >
        {[
            {
                icon: '💪',
                title: '건강한 삶',
                subGoals: ['규칙적인 운동', '건강한 식습관', '충분한 수면', '스트레스 관리']
            },
            {
                icon: '📚',
                title: 'TOEIC 900점',
                subGoals: ['매일 듣기 30분', '영단어 암기', '문법 공부', '모의고사 풀이']
            },
            {
                icon: '💼',
                title: '개발자 성장',
                subGoals: ['알고리즘 공부', '사이드 프로젝트', '기술 블로그', '코드 리뷰']
            }
        ].map((example, i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{example.icon}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white">{example.title}</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {example.subGoals.map((goal, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {goal}
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </motion.div>
);

const FAQContent = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-4"
    >
        {[
            {
                q: "만다라트를 작성하는 데 얼마나 걸리나요?",
                a: "처음에는 30분~1시간 정도 소요됩니다. 템플릿을 활용하면 10분 안에도 가능합니다."
            },
            {
                q: "모든 칸을 다 채워야 하나요?",
                a: "처음부터 완벽하게 채울 필요는 없습니다. 핵심 목표부터 시작해서 점진적으로 확장해가세요."
            },
            {
                q: "작성한 내용을 수정할 수 있나요?",
                a: "네! 언제든지 수정 가능합니다. 목표는 유동적이어야 하니 자유롭게 업데이트하세요."
            },
            {
                q: "여러 개의 만다라트를 만들 수 있나요?",
                a: "현재는 하나의 만다라트만 지원합니다. 가장 중요한 목표에 집중하는 것이 효과적입니다."
            },
            {
                q: "할 일 목록과 어떻게 연결되나요?",
                a: "각 세부 목표를 클릭하면 구체적인 할 일을 추가할 수 있고, 플래너와 자동으로 연동됩니다."
            }
        ].map((faq, i) => (
            <div key={i} className="border-b border-gray-200 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-start gap-2">
                    <span className="text-primary flex-shrink-0">Q.</span>
                    {faq.q}
                </h4>
                <p className="text-gray-600 dark:text-slate-300 text-sm pl-6">
                    {faq.a}
                </p>
            </div>
        ))}

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                법적 고지 및 정책
            </h4>
            <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
            >
                개인정보처리방침 및 서비스 이용약관 확인하기 →
            </a>
        </div>
    </motion.div>
);
