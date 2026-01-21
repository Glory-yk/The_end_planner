# Plan & Action 아키텍처 구현 완료 보고서

## 1. 구현 내용
요청하신 대로 **Plan(계획)**과 **Action(실행)** 데이터를 분리하는 아키텍처를 구현했습니다.

### 🏗️ Backend (서버)
*   **새로운 엔티티 `FocusSession` 생성**:
    *   실제 실행된 시간(`startTime`, `endTime`, `duration`)을 기록합니다.
    *   `Task`와 1:N 관계를 맺어 하나의 할 일에 여러 번의 실행 기록을 남길 수 있습니다.
    *   `Unplanned Action`을 위해 `taskId`가 없어도 저장이 가능합니다.
*   **API 엔드포인트 구현**:
    *   `POST /focus-sessions`: 실행 기록 저장.
    *   `GET /focus-sessions`: 기간별 조회.
    *   `PUT /focus-sessions/:id/link`: 나중에 특정 할 일에 연결하기 위함.

### 📱 Frontend (앱)
*   **데이터 관리 (`useAppStore`)**:
    *   `focusSessions` 상태를 관리하고 서버와 통신하는 로직을 추가했습니다.
*   **타이머 연동 (`App.tsx`, `usePomodoro`)**:
    *   워치에서 타이머가 종료되거나 앱 내 모달에서 저장할 때, 이제 단순 파일 덮어쓰기가 아닌 **새로운 `FocusSession`을 생성**합니다.
    *   **계획된 일**: 기존 Task에 연결된 Session 생성.
    *   **계획되지 않은 일 (Quick Focus)**: `taskId` 없이 Session 생성 (추후 연결 가능).
    *   _Backward Compatibility_: 기존 차트 호환성을 위해 당분간은 Task의 `actualDuration`도 함께 업데이트합니다.

---

## 2. 사용자 가이드 (이후 활용법)
1.  **계획된 실행**: 기존처럼 할 일을 선택하고 타이머를 돌리면, 해당 할 일 아래에 실행 기록이 쌓입니다.
2.  **계획 없는 실행 (Quick Focus)**:
    *   그냥 타이머를 시작하고 종료하세요.
    *   기록은 남지만 "할 일"에는 할당되지 않은 상태로 저장됩니다.
    *   앱에서 종료 시 뜨는 팝업을 통해 즉시 할 일로 만들거나 기존 할 일에 연결할 수 있습니다.

---

## 3. 적용 방법 (필수)
**서버와 앱 모두 업데이트가 필요합니다.**

1.  **Backend**: 서버가 재시작되어야 새로운 DB 테이블(`focus_sessions`)이 생성됩니다.
2.  **Frontend**: 코드가 변경되었으므로 **APK를 다시 설치**해야 합니다. (지금 막 빌드 중입니다.)
