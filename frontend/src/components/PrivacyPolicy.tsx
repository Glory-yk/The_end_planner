

export const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold mb-6">MandalaPlan 개인정보처리방침</h1>
            <p className="mb-4 text-sm text-gray-500">시행일: 2026년 1월 20일</p>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. 개인정보의 수집 및 이용 목적</h2>
                    <p>MandalaPlan(이하 '서비스')은 다음의 목적을 위해 개인정보를 수집 및 이용합니다.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>회원 가입 및 관리 (Google 로그인 연동)</li>
                        <li>서비스 이용 및 콘텐츠(목표, 일정 등) 저장</li>
                        <li>서비스 개선 및 오류 수정</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">2. 수집하는 개인정보의 항목</h2>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>필수항목:</strong> Google UID (사용자 식별자), 이메일 주소</li>
                        <li><strong>선택항목:</strong> 사용자가 입력하는 목표(Mandalart) 및 일정 데이터</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">3. 개인정보의 보유 및 이용 기간</h2>
                    <p>사용자의 개인정보는 원칙적으로 회원 탈퇴 시까지 보유 및 이용됩니다. 단, 관계 법령에 의거하여 보존할 필요가 있는 경우 해당 기간 동안 보관됩니다.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>회원 탈퇴 시: 즉시 파기</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">4. 개인정보의 제3자 제공</h2>
                    <p>본 서비스는 사용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 단, 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">5. 이용자의 권리와 행사 방법</h2>
                    <p>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보 이용 동의를 철회할 수 있습니다. 앱 내 '회원 탈퇴' 기능을 이용하거나 관리자에게 문의하여 요청할 수 있습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">6. 문의처</h2>
                    <p>개인정보 관련 문의는 다음 연락처로 해 주시기 바랍니다.</p>
                    <p className="mt-1">이메일: support@mandalaplan.app (가상의 예시 이메일)</p>
                </section>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                <a href="/" className="text-primary hover:underline">홈으로 돌아가기</a>
            </div>
        </div>
    );
};
