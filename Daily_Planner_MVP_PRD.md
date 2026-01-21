# Ellie-like Daily Planner MVP
## Product Requirements Document (PRD)
### One-Day MVP Version

---

## Document Information

| Item | Detail |
|------|--------|
| **Author** | GM |
| **Date** | 2026-01-18 |
| **Version** | 1.2 (MVP + Week View + Drag & Drop) |
| **Target** | 1-Day Development (Working Prototype) |

---

## 1. Executive Summary

A minimalist daily planning web application inspired by Ellie Planner. This MVP focuses on core task management features that can be completed in one day, providing immediate value for daily planning and task organization.

---

## 2. Goals & Objectives

### Primary Goal
Build a working daily planner prototype within one day that demonstrates core task management functionality.

### Success Criteria
- Users can create, read, update, and delete tasks
- Tasks can be organized in a Brain Dump (inbox) and Daily Planner
- Clean, minimalist UI that works on desktop browsers
- Data persists in PostgreSQL database

---

## 3. Target Users

- Individuals who need simple daily task management
- People who get overwhelmed by complex productivity tools
- Users familiar with time-blocking and daily planning concepts
- Users who want a unified view of tasks and schedule

---

## 4. MVP Scope (One-Day Development)

### 4.1 In-Scope Features

#### Core Task Management
- Create tasks with title and description
- Edit task details
- Delete tasks
- Mark tasks as complete/incomplete

#### Brain Dump (Inbox)
- Quick task entry area
- View all unscheduled tasks
- Move tasks to Daily Planner

#### Daily Planner View
- View today's tasks
- Simple date navigation (Previous/Today/Next)
- Tasks organized by scheduled date

#### Week View (v1.1)
- View 7 days of tasks at a glance
- Week navigation (Previous Week/This Week/Next Week)
- Grid layout showing all days in selected week
- Click on day to add task to that date
- Toggle between Daily View and Week View

#### Drag & Drop (v1.2)
- Drag tasks to reorder within Brain Dump
- Drag tasks to reorder within Daily Planner
- Drag tasks from Brain Dump to Daily Planner (schedules to selected date)
- Drag tasks from Daily Planner to Brain Dump (unschedules task)
- Visual feedback during drag operations

#### Schedule & Views
- Toggle between List View (Tasks) and Schedule View (Time Slots)
- Weekly Calendar navigation
- Progress tracking with indicators
- Animated transitions between views
- **List → Schedule Integration**: Assign time slots to List tasks
  - Clock button on List tasks opens time picker
  - Tasks with assigned time appear in Schedule view
  - Unscheduled tasks shown at top of Schedule view
  - **Drag & Drop**: Drag unscheduled tasks to any time slot
  - **Task Picker Modal**: Click empty slot → shows unscheduled task list → click task to assign
- **Weekly View (Enhanced)**: 7-day time-based schedule grid
  - **Time Grid Layout**: Hours on Y-axis, Days on X-axis
  - Show all tasks with startTime in their correct time slots
  - Horizontal scrollable 7-day columns
  - Click empty slot to add task at that day+time
  - Tasks displayed as blocks in their time slots
  - Visual distinction for today's column
  - Week navigation (prev/next week)
  - Unscheduled tasks shown in collapsible section at top
- **Drag-to-Schedule (NEW)**: Select time range by dragging
  - Drag across time slots to select a range (start time → end time)
  - Visual highlight during drag selection
  - Release to open task creation with pre-filled duration
  - Works in both Daily Schedule and Weekly Schedule views
  - Calculated duration shown in modal (e.g., "1시간 30분")

#### Mandalart Goal Planner
- 9x9 Grid System for Goal Visualization
- Center Grid (Main Goal) <-> Surrounding Grids (Sub Goals) Sync
- Expandable Sub-grids for Actions/Key Results

#### Pomodoro Focus Timer
- Adjustable Work/Break intervals (e.g., 25/5 min)
- Floating Timer widget visible across apps
- Task integration: Start timer directly from a task
- Audio feedback (Start/End sounds)

#### Enhanced Pomodoro Timer (v1.5) - 태스크 연동 타이머
- **Inbox 태스크 타이머 시작**:
  - 시간이 지정되지 않은 태스크(Inbox)에서 "시작" 버튼 클릭
  - 타이머가 시작되고 현재 시간이 startTime으로 자동 기록
  - "종료" 버튼 클릭 시 실제 소요 시간(actualDuration) 계산 및 저장
  - 해당 태스크가 스케줄 뷰에 표시됨
- **계획된 일정 알림 팝업**:
  - 예정된 시간(startTime)이 되면 알림 팝업 표시
  - 팝업에서 "타이머 시작" 버튼으로 즉시 포모도로 시작
  - 팝업에서 "나중에" 버튼으로 5분 후 다시 알림
  - 브라우저 Notification API 활용 (권한 요청)
- **타이머 종료 시 기록**:
  - 타이머 완료 시 actualDuration 필드에 실제 소요 시간 저장
  - 계획 시간(duration) vs 실제 시간(actualDuration) 비교 표시
  - TimeSlots에서 실제 소요 시간 시각적으로 표시

#### Mandalart-Planner Integration
- **Goal → Task Conversion**: Click Mandalart Action to add as a Task
  - Default: Add to **Inbox** (미지정/unscheduled)
  - Optional: Choose specific date via date picker modal
- **Progress Tracking**: Completing linked Tasks updates Mandalart progress
- **Visual Indicators**: Mandalart cells show completion percentage
- **Category/Color Sync**: Sub-goals share colors with linked Tasks
- **Bidirectional Reference**: Tasks know their source, Mandalart knows its Tasks



#### UI/UX
- Clean, minimalist interface with animations (Framer Motion)
- Responsive design (mobile-friendly max-w-lg layout)
- View toggle for easy switching

#### Settings & Personalization
- **Theme Color Selection**: User can choose a primary theme color.
- **Color Presets**: Pre-defined color palettes (e.g., Ocean Blue, Coral Red, Forest Green, Lavender).
- **Persistence**: Theme preference saved in local storage.

### 4.2 Out-of-Scope (Future Versions)
- User authentication and accounts
- Time blocking / calendar view
- Labels, tags, or categories
- Subtasks
- Recurring tasks
- Calendar integrations (Google, Apple)
- Mobile apps (iOS/Android)
- Task time estimates
- Kanban board view
- Month view

---

## 5. Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS (Node.js, TypeScript) |
| **Database** | PostgreSQL with TypeORM |
| **Frontend** | React (Vite) with TypeScript, Framer Motion |
| **Styling** | Tailwind CSS, Lucide React (Icons) |

### Database Schema (MVP)

#### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR | Task title (required) |
| description | TEXT | Optional task details |
| isCompleted | BOOLEAN | Task completion status |
| scheduledDate | DATE | NULL = Brain Dump, Date = Daily Planner |
| startTime | VARCHAR | 'HH:mm' - 예정 시작 시간 |
| duration | INTEGER | 예정 소요 시간 (분) |
| actualDuration | INTEGER | 실제 소요 시간 (분) - 타이머 측정값 |
| timerStartedAt | TIMESTAMP | 타이머 시작 시점 (타이머 진행 중일 때만) |
| createdAt | TIMESTAMP | Auto-generated |
| updatedAt | TIMESTAMP | Auto-updated |

---

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks (optional query: ?date=YYYY-MM-DD) |
| GET | /tasks/brain-dump | Get unscheduled tasks (scheduledDate is NULL) |
| GET | /tasks/week | Get tasks for a week (query: ?startDate=YYYY-MM-DD) |
| GET | /tasks/:id | Get single task by ID |
| POST | /tasks | Create new task |
| PATCH | /tasks/:id | Update task (title, description, isCompleted, scheduledDate) |
| DELETE | /tasks/:id | Delete task |

---

## 7. UI Components & Layout

### Main Layout
Two-column layout (50/50 split on desktop)
- Left Panel: Brain Dump (Inbox)
- Right Panel: Daily Planner

### Component List

1. **Header & Navigation**
   - DateHeader (Date display and navigation)
   - WeekCalendar (Weekly view selection)
   - ViewToggle (Switch between List and Schedule)

2. **Task Management**
   - TaskList (List view of tasks)
   - AddTaskInput (Input for new tasks)
   - QuickAddModal (Modal for scheduling time)
   - ProgressIndicator (Visual progress bar)

3. **Schedule View**
   - TimeSlots (Hourly/Time-block view)

4. **Mandalart System**
   - MandalartBoard (Main container)
   - MandalartGrid (Individual 3x3 grids)
   - GoalInput (Cell input component)

5. **Focus Tools**
   - PomodoroTimer (Main settings & display)
   - FloatingTimer (Always-visible compact timer)
   - FocusQuote (Motivational quotes for empty states)

6. **Feedback**
   - ProgressIndicator (Visual progress bar)


5. **Task Item Component**
   - Checkbox (toggle completion)
   - Task title (clickable to edit)
   - Delete button

6. **Task Edit Modal/Form**
   - Title input
   - Description textarea
   - Date picker (optional)
   - Save/Cancel buttons

---

## 8. Development Timeline (8 Hours)

| Time | Phase | Tasks |
|------|-------|-------|
| 1 hour | Setup | Initialize NestJS, React (Vite), PostgreSQL, basic project structure |
| 2 hours | Backend | Task entity, service, controller, all CRUD endpoints, database migrations |
| 3 hours | Frontend | UI components, API integration, state management, basic styling |
| 1.5 hours | Integration | Connect frontend to backend, test all features end-to-end |
| 0.5 hours | Polish | Bug fixes, UI improvements, responsiveness |

---

## 9. Future Enhancements (v2.0+)

### Phase 2 - Enhanced Planning (Week 2)
- Task time estimates
- Task priority levels

### Phase 3 - Advanced Features (Week 3-4)
- Time blocking calendar view
- Labels and categories
- Subtasks
- Recurring tasks

### Phase 4 - Integration & Mobile (Month 2+)
- Google Calendar integration
- Apple Calendar integration
- React Native mobile app
- User authentication

---

## 10. Success Metrics for MVP

- All CRUD operations working correctly
- Tasks can move between Brain Dump and Daily Planner
- Date navigation works properly
- UI is clean and usable on desktop browsers
- No critical bugs in core functionality
- Application loads in under 2 seconds

---

## 11. Future Roadmap - "갓생메이트" 고도화 방안

> **출처**: `/docs/` 폴더 문서 분석 (핵심 컨셉, UI/UX 가이드, 스케줄링 알고리즘, 리텐션 전략, 페르소나)

### 11.1 앰비언트 AI 시스템 (Ambient AI)

#### 시간대별 UI 변형
| 시간대 | 우선 모듈 | 컬러 톤 | 알림 강도 |
|--------|----------|---------|-----------|
| 아침 (5-9시) | 오늘의 할일 | 따뜻한 옐로우 | 부드러운 |
| 오전 (9-12시) | 집중 타이머 | 집중 블루 | 적극적 |
| 오후 (12-18시) | 진행률 추적 | 활력 오렌지 | 중간 |
| 저녁 (18-22시) | 내일 계획 | 차분한 퍼플 | 최소 |
| 밤 (22-5시) | 회고 일기 | 다크 모드 | 무음 |

#### 구현 가능 항목
- [ ] **동적 배경 그라데이션**: 시간대별 자동 변경
- [ ] **히어로 모듈 전환**: 시간대별 메인 컴포넌트 크기 조절
- [ ] **AI 추천 할일**: 과거 완료 패턴 기반 시작 작업 추천
- [ ] **에너지 매칭**: 현재 에너지 수준에 맞는 작업 제안

---

### 11.2 Context-Aware Priority 알고리즘

#### 우선순위 공식
```
P_final = 0.30×U + 0.25×D + 0.20×E + 0.15×V + 0.10×C
```

| 변수 | 설명 | 적용 방법 |
|------|------|----------|
| U (Urgency) | 긴급도 | 마감일, 사용자 표시 기반 |
| D (Deadline) | 마감 근접도 | 마감까지 남은 시간 계산 |
| E (Energy) | 에너지 매칭 | 시간대별 생체리듬 곡선 활용 |
| V (Velocity) | 작업 속도 | actualDuration/duration 비율 분석 |
| C (Context) | 맥락 적합도 | 위치, 시간 선호도 |

#### 구현 가능 항목
- [ ] **Task.priority 필드 추가**: 'urgent' | 'high' | 'medium' | 'low'
- [ ] **자동 정렬**: priorityScore 기반 할일 목록 자동 정렬
- [ ] **시각적 구분**: 긴급 태스크 하이라이트 (펄스 애니메이션)
- [ ] **deadline 필드 추가**: 마감일 기반 근접도 계산

---

### 11.3 방어적 스케줄링 (Defensive Scheduling)

#### 핵심 규칙
| 규칙 | 설명 | 구현 난이도 |
|------|------|------------|
| **80% 규칙** | 하루의 80%만 스케줄, 20%는 버퍼 | 중 |
| **딥워크 보호** | 9-11시 자동 집중 시간 블록 | 하 |
| **점심 보호** | 12-13시 자동 휴식 시간 | 하 |
| **저녁 경계** | 19시 이후 가벼운 작업만 추천 | 중 |
| **연속 제한** | 90분 이상 연속 작업 시 휴식 알림 | 중 |

#### 구현 가능 항목
- [ ] **보호 시간대 설정**: 사용자 설정 가능한 딥워크/휴식 시간
- [ ] **일정 과부하 경고**: 80% 초과 시 경고 메시지
- [ ] **자동 버퍼 삽입**: 90분 연속 작업 후 15분 휴식 제안
- [ ] **저녁 제한 모드**: 19시 이후 새 작업 추가 시 확인 팝업

---

### 11.4 자연어 입력 (NLP) 태스크 생성

#### 파싱 로직
```
입력: "내일 오후 3시에 팀 미팅"
출력: { title: "팀 미팅", date: 내일, time: 15:00, category: "업무" }
```

#### 지원할 패턴
| 패턴 | 예시 |
|------|------|
| 시간 | "오전 9시", "오후 3시", "저녁", "밤" |
| 날짜 | "오늘", "내일", "모레", "다음주 금요일", "이번 주말" |
| 기간 | "30분", "1시간", "2시간" |
| 우선순위 | "급한", "중요한", "꼭", "가능하면" |
| 반복 | "매일", "매주 월요일" |

#### 구현 가능 항목
- [ ] **QuickAdd 자연어 파싱**: 한국어 시간/날짜 표현 인식
- [ ] **자동 카테고리 분류**: 키워드 기반 category 추정
- [ ] **소요 시간 자동 추정**: 과거 유사 작업 기반 duration 설정
- [ ] **반복 작업 지원**: recurrence 필드 추가

---

### 11.5 게임화 & 리텐션 (Gamification)

#### 성장 나무 시스템 (Growth Tree)
```
🌱 씨앗 (Lv.1-5) → 🌿 새싹 (Lv.6-15) → 🪴 묘목 (Lv.16-30) → 🌳 나무 (Lv.31-50) → 🌸 꽃나무 (Lv.51+)
```

| 단계 | 레벨 | 설명 | 시각적 표현 |
|------|------|------|------------|
| 🌱 씨앗 | 1-5 | "작은 시작, 큰 가능성" | 흙에서 막 싹트는 씨앗 |
| 🌿 새싹 | 6-15 | "조금씩 자라나는 중" | 두 잎 새싹, 연두색 |
| 🪴 묘목 | 16-30 | "꾸준히 성장하고 있어요" | 작은 화분의 어린 나무 |
| 🌳 나무 | 31-50 | "튼튼하게 뿌리내렸어요" | 잎이 무성한 나무 |
| 🌸 꽃나무 | 51+ | "아름다운 결실을 맺었어요" | 꽃이 핀 나무 + 열매 |

#### 계절 테마 (선택)
- 🌸 **봄**: 벚꽃 나무로 변신
- 🌳 **여름**: 푸른 잎 무성한 나무
- 🍂 **가을**: 단풍 나무 + 열매
- ❄️ **겨울**: 눈 덮인 소나무

#### 보상 체계
| 행동 | EXP | 시각적 피드백 |
|------|-----|--------------|
| 할일 1개 완료 | +10 | 잎사귀 애니메이션 🍃 |
| 작은 목표 달성 | +25 | 물방울 효과 💧 |
| 큰 목표 달성 | +50 | 햇살 효과 ☀️ + 나무 성장 |
| 3일 연속 | +50 | "새싹이 튼튼해지고 있어요!" |
| 7일 연속 | +150 | 새 잎 해금 🌿 |
| 30일 연속 | +700 | 꽃 피우기 🌸 |
| 100일 연속 | +2000 | 황금 열매 🍎 |

#### 성장 메시지
| 상황 | 메시지 |
|------|--------|
| 첫 할일 완료 | "씨앗에 첫 물을 줬어요! 🌱" |
| 레벨업 | "나무가 조금 더 자랐어요! 🌿" |
| 연속 달성 | "꾸준한 햇빛으로 무럭무럭! ☀️" |
| 스트릭 끊김 | "괜찮아요, 비 온 뒤에 더 자라요 🌧️" |
| 복귀 | "다시 돌아왔군요! 나무가 반가워해요 🌳" |

#### 구현 가능 항목
- [ ] **EXP 시스템**: 할일 완료 시 경험치 획득 (물주기 개념)
- [ ] **레벨 시스템**: EXP 누적으로 나무 성장
- [ ] **성장 시각화**: 레벨별 나무 이미지/애니메이션 변화
- [ ] **스트릭 추적**: 연속 달성일 기록 및 보상
- [ ] **컨페티 효과**: 일일 100% 달성 시 잎사귀/꽃잎 애니메이션
- [ ] **계절 테마**: 현재 계절에 맞는 나무 스타일 자동 적용
- [ ] **실패 회복**: 연속 끊김 시 격려 메시지 + 회복 보너스 (비/무지개)

---

### 11.6 Calm UX 철학

#### 핵심 원칙
| 원칙 | DO ✅ | DON'T ❌ |
|------|-------|---------|
| 부드러움 | "오늘도 잘 하고 있어요!" | "아직 3개 안 했어요!" |
| 단순함 | "쉬어가도 괜찮아요" | "연속 기록이 끊겼습니다" |
| 자율성 | "가볍게 시작해볼까요?" | "할 일이 5개 밀렸습니다" |
| 따뜻함 | "다음에 또 만나요 :)" | "앱을 열지 않은 지 3일..." |

#### 구현 가능 항목
- [ ] **격려 메시지**: 상황별 따뜻한 메시지 시스템
- [ ] **유연한 목표**: 목표 미달성 시 부정적 표현 금지
- [ ] **빈 화면 처리**: FocusQuote 컴포넌트 활용 (이미 구현됨)
- [ ] **소프트 알림**: 강압적이지 않은 리마인더 톤

---

### 11.7 챌린지 인증 사진 시스템

#### 개요
주제별 챌린지를 생성하고, 인증 사진을 촬영하면 사진 위에 "Day N / 주제명" 오버레이가 자동으로 합성되는 기능.

#### 핵심 기능
| 기능 | 설명 |
|------|------|
| **챌린지 생성** | 주제, 시작일, 목표 일수 설정 |
| **인증 촬영** | 카메라로 사진 촬영 또는 갤러리 선택 |
| **오버레이 합성** | 사진 위에 Day N / 주제명 자동 표시 |
| **갤러리 저장** | 합성된 사진을 기기에 저장 |
| **SNS 공유** | 인스타그램/트위터 등 바로 공유 |

#### 챌린지 예시
| 주제 | 해시태그 제안 | 아이콘 |
|------|--------------|--------|
| 미라클모닝 | #미라클모닝챌린지 | 🌅 |
| 영어공부 | #영어스터디 | 📚 |
| 운동 | #오운완 | 💪 |
| 독서 | #북스타그램 | 📖 |
| 1일1커밋 | #개발자일상 | 💻 |
| 다이어트 | #식단일기 | 🥗 |

#### 사진 오버레이 디자인
```
┌──────────────────────────────────┐
│                                  │
│        [ 인증 사진 영역 ]          │
│                                  │
│                                  │
│    ┌─────────────────────────┐   │
│    │  🌅 미라클모닝           │   │
│    │  Day 7 / 30             │   │
│    │  2026.01.19             │   │
│    └─────────────────────────┘   │
│                                  │
└──────────────────────────────────┘
```

#### 오버레이 스타일 옵션
| 스타일 | 설명 |
|--------|------|
| **미니멀** | 반투명 흰색 배경 + 심플 텍스트 |
| **그라데이션** | 하단 그라데이션 오버레이 |
| **스티커형** | 귀퉁이에 스티커처럼 표시 |
| **전체** | 상단 바 형태로 전체 너비 |

#### 데이터 구조
```typescript
interface Challenge {
  id: string;
  title: string;             // "미라클모닝"
  emoji: string;             // "🌅"
  hashtags: string[];        // ["#미라클모닝챌린지", "#갓생"]
  startDate: string;         // ISO date
  targetDays: number;        // 30
  currentDay: number;        // 7
  verifications: Verification[];
}

interface Verification {
  id: string;
  challengeId: string;
  day: number;               // 7
  date: string;              // ISO date
  originalPhotoUri: string;  // 원본 사진 경로
  overlayPhotoUri: string;   // 합성된 사진 경로
  overlayStyle: 'minimal' | 'gradient' | 'sticker' | 'full';
  createdAt: string;
}
```

#### 기술 구현 방안
| 기술 | 설명 |
|------|------|
| **Canvas API** | 웹에서 이미지 합성 |
| **html2canvas** | DOM을 캔버스로 변환 |
| **React Native** (모바일) | react-native-view-shot 활용 |
| **File API** | 이미지 다운로드/저장 |

#### 구현 가능 항목
- [ ] **Challenge 모델 추가**: 챌린지 데이터 구조
- [ ] **챌린지 생성 UI**: 주제, 날짜, 목표일 입력 폼
- [ ] **인증 촬영 UI**: 카메라/갤러리 선택 모달
- [ ] **오버레이 합성**: Canvas API로 이미지 + 텍스트 합성
- [ ] **스타일 선택**: 4가지 오버레이 스타일 프리셋
- [ ] **저장/공유**: 다운로드 버튼 및 SNS 공유 링크
- [ ] **진행률 표시**: 챌린지별 Day N / 목표일 시각화
- [ ] **챌린지 갤러리**: 인증 사진 모아보기

---

### 11.8 소셜 기능 (Future)

#### 칭찬 스티커 시스템
| 카테고리 | 스티커 | 획득 조건 |
|----------|--------|-----------|
| 기본 | 👏 대박! | 무료 제공 |
| 시즌 | 🌸 봄날 화이팅 | 시즌 이벤트 |
| 희귀 | ✨ 레전드 | 연속 7일 목표 달성 |

#### 구현 가능 항목 (장기)
- [ ] **친구 연결**: 친구 추가 및 목록
- [ ] **스티커 전송**: 친구에게 격려 스티커 보내기
- [ ] **그룹 챌린지**: 함께하는 목표 달성
- [ ] **주간 리포트 공유**: SNS 공유 기능

---

### 11.8 UI/UX 고도화

#### 리퀴드 글래스 스타일 (이미 부분 적용)
```css
.liquid-glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

#### 마이크로 인터랙션 강화
| 효과 | 설명 | 적용 위치 |
|------|------|----------|
| 리퀴드 체크 | 체크박스가 물방울처럼 퍼지며 완료 | TaskList 체크박스 |
| 컨페티 버스트 | 100% 달성 시 화면 축하 효과 | 일일 목표 달성 |
| 웨이브 리플 | 알림 도착 시 물결 효과 | 스티커 수신 시 |
| 중요도 글로우 | 긴급 태스크 펄스 애니메이션 | 고우선순위 태스크 |

#### 구현 가능 항목
- [ ] **체크 애니메이션 강화**: 현재 단순 → 리퀴드 체크로 업그레이드
- [ ] **달성 축하 효과**: 일일 100% 시 컨페티 (react-confetti)
- [ ] **시간대별 배경**: 동적 그라데이션 자동 적용
- [ ] **중요 태스크 하이라이트**: box-shadow pulse 애니메이션

---

### 11.9 데이터 구조 확장 (Task 스키마)

```typescript
interface Task {
  // 기존 필드
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  scheduledDate: string | null;
  startTime?: string;
  duration?: number;
  actualDuration?: number;
  timerStartedAt?: string;
  mandalartRef?: { gridIndex: number; cellIndex: number; };

  // 신규 확장 필드 (제안)
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  deadline?: string;  // ISO date string
  category?: 'work' | 'study' | 'exercise' | 'social' | 'personal';
  energyRequired?: number;  // 0-1 (저에너지~고에너지)
  estimatedFocusLevel?: 'deep' | 'medium' | 'shallow';
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: string;
  };

  // 게임화 필드 (제안)
  expEarned?: number;
  streakDay?: number;
}
```

---

### 11.10 구현 우선순위 제안

#### Phase 1 - 즉시 적용 가능 (1-2일)
1. ✅ **시간대별 배경색 변경** (이미 다크모드 있음 → 확장)
2. ✅ **체크 애니메이션 강화** (Framer Motion 활용)
3. ✅ **격려 메시지 시스템** (FocusQuote 확장)
4. ✅ **달성 축하 컨페티** (react-confetti 라이브러리)

#### Phase 2 - 중기 개발 (1주)
1. **Task.priority 필드 및 자동 정렬**
2. **방어적 스케줄링 경고**
3. **EXP/레벨 시스템 기초**
4. **스트릭 추적**

#### Phase 3 - 장기 개발 (2-4주)
1. **Context-Aware Priority 알고리즘**
2. **자연어 입력 파싱**
3. **오롤이 펫 시스템**
4. **소셜 기능 (친구/스티커)**

---

## 7. UX/UI Design Guidelines (2026 Trend)

### 7.1 Visual Language: Liquid Glass & Bento Grid 2.0
- **Liquid Glass**: Glassmorphism with enhanced depth, blur, and saturation.
  - Background: `rgba(255, 255, 255, 0.15)`
  - Blur: `backdrop-filter: blur(20px) saturate(180%)`
  - Border: Subtle white glow `1px solid rgba(255, 255, 255, 0.3)`
  - Shadow: Deep, colored shadows to simulate light refraction.

- **Dynamic Backgrounds**: Real-time gradients based on time of day.
  - *Morning*: Golden warm (Peach/Orange)
  - *Afternoon*: Energetic cool (Blue/Purple)
  - *Evening*: Calming deep (Teal/Slate)
  - *Night*: Dark mode with starlight particles

### 7.2 Micro-interactions: Tactile Maximalism
- **Liquid Check**: Checkbox bursts like a liquid droplet upon completion.
- **Confetti Burst**: Full-screen celebration when all daily tasks are done.
- **Card Slide**: Smooth 3D slide-out animation for deleting/completing tasks.
- **Haptic Feedback**: Visual haptics (shakes, pulses) for important actions.

### 7.3 Typography & Color System
- **Fonts**:
  - Headings: `Outfit` (Modern, geometric)
  - Body: `Noto Sans KR` (Legible, clean)
- **Palette (Dynamic)**:
  - Users can select the **Primary Color** which updates the entire app's accent color.
  - Default: Ocean Blue (reverted to standard look).
  - Supported Presets: Blue, Red, Green, Purple, Orange.
  - **Dark Mode**:
    - Binary toggle (Light/Dark).
    - Persists in `localStorage`.
    - Affects global backgrounds, text colors, and component cards.
    - Uses `slate-900` for background and `slate-800` for cards in dark mode.
  - Implementation: Logic maps user selection to CSS Variables (Tailwind v4) and toggles `.dark` class.

### 7.4 Mandalart Design System (v3.0 - Unified)
- **Concept**: Consistent "Planner" Look & Feel.
- **Visuals**:
  - **Unified Theme**: All grids use the global **Primary Color**. No multi-color rainbow.
  - **Styles**: Matches `TimeSlots.tsx` and `TaskList.tsx` (Clean white, gray borders, minimal shadows).
  - **Typography**: Same hierarchy as the Daily View.
- **Cells**:
  - **Core (Main Goal)**: Solid Primary Color background (like the "Add Task" button).
  - **Sub-Goals**: Light Primary tint (`bg-primary/10`, `text-primary`) (like selected time slots).
  - **Leaf (Tasks)**: White background, gray border. Hover shows primary border.

---
