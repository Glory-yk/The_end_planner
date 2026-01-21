# Daily Planner MVP - Development Tasks
## One-Day Implementation Checklist
**Target: 8 hours total**

---

## Quick Reference

| Item | Value |
|------|-------|
| **Project Name** | daily-planner-mvp |
| **Backend Directory** | ./backend |
| **Frontend Directory** | ./frontend |
| **Database** | PostgreSQL (localhost:5432) |
| **Backend Port** | 3000 |
| **Frontend Port** | 5173 |

---

## Phase 1: Project Setup (1 hour)

### Task 1.1: Initialize Project Structure
**Estimated Time: 15 minutes**

1. Create project root directory: `mkdir daily-planner-mvp && cd daily-planner-mvp`
2. Initialize git: `git init`
3. Create .gitignore (node_modules, .env, dist, build)
4. Create README.md with basic project info

### Task 1.2: Setup Backend (NestJS)
**Estimated Time: 20 minutes**

1. Install NestJS CLI: `npm i -g @nestjs/cli`
2. Generate NestJS project: `nest new backend`
3. `cd backend`
4. Install dependencies: `npm install @nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer`
5. Install CORS: `npm install @nestjs/platform-express`
6. Create .env file with DB credentials

### Task 1.3: Setup Frontend (React + Vite)
**Estimated Time: 15 minutes**

1. From project root: `npm create vite@latest frontend -- --template react-ts`
2. `cd frontend && npm install`
3. Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
4. `npx tailwindcss init -p`
5. Configure tailwind.config.js
6. Install axios: `npm install axios`
7. Install date-fns: `npm install date-fns`

### Task 1.4: Setup PostgreSQL Database
**Estimated Time: 10 minutes**

1. Start PostgreSQL service
2. Create database: `CREATE DATABASE daily_planner_db;`
3. Test connection with credentials

---

## Phase 2: Backend Development (2 hours)

### Task 2.1: Database Configuration
**Estimated Time: 15 minutes**

1. Configure TypeORM in app.module.ts
2. Add database config to .env file
3. Import ConfigModule for environment variables

### Task 2.2: Create Task Entity
**Estimated Time: 20 minutes**

1. Generate task module: `nest g module tasks`
2. Create task.entity.ts with fields:
   - id (UUID)
   - title
   - description
   - isCompleted
   - scheduledDate
   - createdAt
   - updatedAt
3. Add TypeORM decorators
4. Register entity in TypeORM config

### Task 2.3: Create DTOs
**Estimated Time: 15 minutes**

1. Create dto/create-task.dto.ts
2. Create dto/update-task.dto.ts (PartialType)
3. Add class-validator decorators (@IsString, @IsOptional, @IsBoolean, @IsDate)

### Task 2.4: Implement Task Service
**Estimated Time: 30 minutes**

1. Generate service: `nest g service tasks`
2. Inject TaskRepository
3. Implement create(createTaskDto)
4. Implement findAll(date?: string)
5. Implement findBrainDump() - tasks where scheduledDate IS NULL
6. Implement findOne(id: string)
7. Implement update(id: string, updateTaskDto)
8. Implement remove(id: string)

### Task 2.5: Create Task Controller
**Estimated Time: 25 minutes**

1. Generate controller: `nest g controller tasks`
2. Implement GET /tasks (@Query date)
3. Implement GET /tasks/brain-dump
4. Implement GET /tasks/:id
5. Implement POST /tasks
6. Implement PATCH /tasks/:id
7. Implement DELETE /tasks/:id
8. Add validation pipe globally

### Task 2.6: Enable CORS & Test
**Estimated Time: 15 minutes**

1. Enable CORS in main.ts
2. Run backend: `npm run start:dev`
3. Test all endpoints with Postman/Thunder Client
4. Verify database records

---

## Phase 2.5: Frontend Dependencies & Setup (15 minutes)

### Task 2.5.1: Install Additional Dependencies
1. `cd frontend`
2. `npm install framer-motion lucide-react clsx tailwind-merge`
3. Setup path aliases (@/*) in vite.config.ts if not present

---

## Phase 3: Frontend Development (3 hours)

### Task 3.1: Setup Stores & Hooks
**Estimated Time: 20 minutes**

1. Create `src/hooks/useTasks.ts` (Data fetching, Add, Update, Delete)
2. Define Task interfaces consistent with Backend

### Task 3.2: Create UI Components - Part 1 (Layout & Nav)
**Estimated Time: 45 minutes**

1. Create `components/planner/DateHeader.tsx`
2. Create `components/planner/WeekCalendar.tsx`
3. Create `components/planner/ViewToggle.tsx`
4. Create `components/planner/ProgressIndicator.tsx`

### Task 3.3: Create UI Components - Part 2 (Task List)
**Estimated Time: 45 minutes**

1. Create `components/planner/TaskList.tsx`
2. Create `components/planner/AddTaskInput.tsx` (Bottom fixed input)
3. Create `components/planner/FocusQuote.tsx`

### Task 3.4: Create UI Components - Part 3 (Schedule)
**Estimated Time: 45 minutes**

1. Create `components/planner/TimeSlots.tsx` (Schedule view)
2. Create `components/planner/QuickAddModal.tsx`

### Task 3.4.1: List-to-Schedule Integration
**Estimated Time: 30 minutes**

1. Add `updateTaskTime(taskId, startTime)` function to useAppStore
2. Add clock button to TaskList items to open time picker
3. Create `TimePickerModal` component for selecting time
4. Update TimeSlots to show unscheduled tasks section at top
5. Allow clicking unscheduled task to assign to current time slot

### Task 3.4.4: Unscheduled Task Assignment (Enhanced)
**Estimated Time: 45 minutes**

#### 3.4.4.1: Drag & Drop Support
1. Make unscheduled task items draggable
2. Add drop zone handlers to each time slot
3. On drop, call `updateTaskTime(taskId, time)` to assign
4. Visual feedback during drag (dragging indicator, drop zone highlight)

#### 3.4.4.2: Task Picker Modal
1. Create `TaskPickerModal` component
2. Shows list of unscheduled tasks for current date
3. Click task to assign to selected time slot
4. Opens when clicking empty time slot (alternative to new task)
5. Option to create new task or pick existing


### Task 3.4.3: Drag-to-Schedule Feature
**Estimated Time: 45 minutes**

#### 3.4.3.1: Drag Selection State
1. Add drag state tracking (isDragging, startHour, endHour)
2. Handle mousedown/touchstart to begin drag
3. Handle mousemove/touchmove to update selection
4. Handle mouseup/touchend to confirm selection

#### 3.4.3.2: Visual Feedback
1. Highlight selected time range during drag
2. Show duration preview (e.g., "1시간 30분")
3. Animate selection expansion

#### 3.4.3.3: Task Creation Modal
1. Update QuickAddModal to accept duration prop
2. Pre-fill start time and duration from drag selection
3. Add duration to new task when created

#### 3.4.3.4: Integration
1. Implement in TimeSlots (Daily Schedule)
2. Implement in WeeklyScheduleView (Weekly Schedule)


### Task 3.4.2: Weekly View Implementation
**Estimated Time: 60 minutes**

#### 3.4.2.1: Update ViewToggle
1. Add 'week' option to ViewMode type ('list' | 'schedule' | 'week')
2. Add Week icon and button to ViewToggle component
3. Handle 3-way toggle animation

#### 3.4.2.2: Create WeeklyScheduleView Component
1. Create `components/planner/WeeklyScheduleView.tsx`
2. **Time Grid Layout**:
   - Left column: Hour labels (6 AM - 10 PM)
   - 7 columns for each day of the week
   - Horizontally scrollable on mobile
3. **Task Display**:
   - Show tasks as blocks in their time slot
   - Truncate long titles with ellipsis
   - Color-code by category/source
4. **Interactions**:
   - Click empty slot → Open QuickAddModal with pre-filled date+time
   - Click task → Toggle completion
5. **Header Row**:
   - Show day name and date
   - Highlight today's column
6. **Unscheduled Section**:
   - Collapsible area at top showing tasks without startTime
   - Click to expand/collapse

#### 3.4.2.3: Week Navigation
1. Update DateHeader to show week range in weekly mode
2. Prev/Next buttons navigate by week instead of day
3. "Today" button jumps to current week

#### 3.4.2.4: Integration
1. Replace simple WeeklyView with WeeklyScheduleView in App.tsx
2. Pass all necessary callbacks and data
3. Ensure consistent data flow with useAppStore

### Phase 4: Design System Overhaul (2026 Trend)
**Estimated Time: 120 minutes**

### Task 4.0: Global Styles & Assets
**Estimated Time: 30 minutes**
1. **Fonts**: Install `Outfit` and `Noto Sans KR` via Google Fonts.
2. **Tailwind Config**: Add new color palette (Primary Coral, Secondary Purple, Mint Accent).
3. **Global CSS**: Define `:root` variables for Liquid Glass effects (`backdrop-filter`, `gradients`).
4. **Dynamic Background**: Create `BackgroundContainer` component that changes gradient based on time.

### Task 4.1: Component Restyling (Liquid Glass)
**Estimated Time: 45 minutes**
1. **Containers**: Update `App`, `TimeSlots`, `TaskList` to use glassmorphism cards.
2. **Inputs**: Style `AddTaskInput` and `QuickAddModal` with blur and glow effects.
3. **Buttons**: Apply neon/glow hover effects to all buttons.
4. **Mandalart**: Update grid cells to be transparent glass cards with vibrant borders.

### Task 4.2: Micro-interactions
**Estimated Time: 30 minutes**
1. **Liquid Check**: Implement custom checkbox animation (liquid burst).
2. **Transitions**: Add `framer-motion` layout animations for all view switches.
3. **Feedback**: Add confetti effect on completing all daily tasks.

### Phase 5: Polish & Final Review (Formerly Phase 4)


### Task 3.5: Implement Mandalart System
**Estimated Time: 60 minutes**

1. Create `types/mandalart.ts` (Data structures for 9x9 grid)
2. Create `hooks/useMandalart.ts` (State management & Sync logic)
3. Create `components/mandalart/MandalartCell.tsx`
4. Create `components/mandalart/MandalartGrid.tsx`
5. Create `components/mandalart/MandalartView.tsx`

### Task 3.6: Implement Pomodoro Timer
**Estimated Time: 45 minutes**

1. Create `hooks/usePomodoro.ts` (Timer logic, sound, session tracking)
2. Create `components/pomodoro/TimerDisplay.tsx`
3. Create `components/pomodoro/FloatingTimer.tsx`
4. Create `components/pomodoro/TimerControls.tsx`

### Task 3.7: Integrate Features & Main Index
**Estimated Time: 45 minutes**

1. Create `pages/Index.tsx` (or update App.tsx) to include new Views
2. Add Tab/Navigation to switch between Planner and Mandalart
3. Integrate FloatingTimer to be persistent
4. Implement animations with AnimatePresence

### Task 3.8: Cleanup
1. Remove unused components from previous MVP if replaced
2. Ensure Tailwind styles support the new layout (min-h-screen, etc.)

### Task 3.9: Mandalart-Planner Integration
**Estimated Time: 90 minutes**

#### 3.9.1: Update Data Types
1. Add `mandalartRef` field to Task type (gridIndex, cellIndex)
2. Add `linkedTaskIds` and `progress` fields to Mandalart cell type
3. Define `MandalartCategory` type with id, name, color

#### 3.9.2: Create Unified Data Store
1. Create `hooks/useAppStore.ts` (or context) for shared state
2. Implement `addTaskFromMandalart(gridIndex, cellIndex, title)` action
3. Implement `updateMandalartProgress(gridIndex, cellIndex)` action
4. Implement `getLinkedTasks(gridIndex, cellIndex)` selector

#### 3.9.3: Modify Mandalart Components
1. Add "Add to Inbox" button to MandalartCell (default action)
2. Add "Schedule to Date" button that opens DatePickerModal
3. Create `DatePickerModal` component for choosing task date
4. Add progress indicator (circular or bar) to cells with linked tasks
5. Add category color indicators to sub-goal cells

#### 3.9.4: Modify Planner Components
1. Show Mandalart source badge on linked Tasks
2. Update progress when Task is toggled complete/incomplete
3. Add filter option to show only tasks linked to a specific Mandalart goal

#### 3.9.5: Testing Integration
1. Test: Schedule action from Mandalart to Planner
2. Test: Complete task and verify Mandalart progress updates
3. Test: Delete task and verify Mandalart progress recalculates

---

---

## Phase 4: Integration & Testing (1.5 hours)

### Task 4.1: Connect Frontend to Backend
**Estimated Time: 20 minutes**

1. Verify backend is running on port 3000
2. Update API client baseURL
3. Test all API calls from frontend
4. Handle loading states
5. Handle error states

### Task 4.2: End-to-End Testing
**Estimated Time: 40 minutes**

1. Test: Create task in Brain Dump
2. Test: Schedule task to today
3. Test: Create task directly in Daily Planner
4. Test: Edit task details
5. Test: Toggle task completion
6. Test: Delete task
7. Test: Navigate between dates
8. Test: Date filtering works correctly
9. Test: Empty states display properly
10. Verify: Data persists after page reload

### Task 4.3: Bug Fixing
**Estimated Time: 30 minutes**

1. Fix any UI rendering issues
2. Fix state synchronization issues
3. Fix date handling edge cases
4. Fix API error handling
5. Test in different browsers

---

## Phase 5: Polish & Finalization (0.5 hours)

### Task 5.1: UI Polish
**Estimated Time: 15 minutes**

1. Refine colors and spacing
2. Add smooth transitions
3. Improve button states (hover, active, disabled)
4. Polish modal animations
5. Test responsive behavior

### Task 5.2: Performance Check
**Estimated Time: 10 minutes**

1. Check page load time
2. Optimize re-renders if needed
3. Verify no console errors

### Task 5.3: Documentation
**Estimated Time: 5 minutes**

1. Update README with setup instructions
2. Document environment variables
3. Add screenshot to README

---

## Quick Commands Reference

### Start Development Servers

**Backend:**
```bash
cd backend && npm run start:dev
```

**Frontend:**
```bash
cd frontend && npm run dev
```

### Database Commands

```bash
psql -U postgres
CREATE DATABASE daily_planner_db;
\c daily_planner_db
\dt  # list tables
```

---

## Final Checklist

- [ ] Backend setup with NestJS and PostgreSQL
- [ ] All API endpoints working (GET, POST, PATCH, DELETE)
- [ ] Frontend setup with React, Vite, and Tailwind CSS
- [ ] Brain Dump panel with quick add functionality
- [ ] Daily Planner panel with date navigation
- [ ] Tasks can be created, edited, and deleted
- [ ] Tasks can be marked as complete/incomplete
- [ ] Tasks can be moved between Brain Dump and Daily Planner
- [ ] Clean, minimalist UI with proper styling
- [ ] Data persists correctly in database
- [ ] All features tested and working end-to-end

---

## Notes

- Focus on getting the MVP working first
- Don't get stuck on perfect styling - functionality first!
- Test frequently as you build
- Keep it simple - no over-engineering
- You can always refactor later

**Good luck! 화이팅! 💪**

---

## Phase 6: Week View Feature (v1.1)

### Task 6.1: Backend - Week Tasks API
**Estimated Time: 20 minutes**
**Status: [x] Completed**

1. Add `findWeek(startDate: string)` method to TasksService
   - Query tasks where scheduledDate is between startDate and startDate + 6 days
   - Return tasks grouped by date
2. Add `GET /tasks/week` endpoint to TasksController
   - Accept `@Query('startDate')` parameter
   - Return array of tasks for the week
3. Test endpoint with curl/Postman

### Task 6.2: Frontend - Week API Integration
**Estimated Time: 15 minutes**
**Status: [x] Completed**

1. Add `getWeekTasks(startDate: string)` to `src/api/tasks.ts`
2. Define `WeekTasks` type interface
3. Test API call from browser console

### Task 6.3: Frontend - WeekViewPanel Component
**Estimated Time: 45 minutes**
**Status: [x] Completed**

1. Create `src/components/WeekViewPanel.tsx`
2. Implement week navigation header
   - Previous Week / This Week / Next Week buttons
   - Display week range (e.g., "Jan 13 - Jan 19, 2026")
3. Create 7-day grid layout
   - Each day column shows: weekday name, date, task count
   - Responsive grid (7 columns on desktop, stack on mobile)
4. Render tasks for each day
   - Use TaskItem component (compact version)
   - Show empty state if no tasks
5. Add click handler to add task to specific day
6. Style with Tailwind CSS

### Task 6.4: Frontend - View Toggle Feature
**Estimated Time: 25 minutes**
**Status: [x] Completed**

1. Add `viewMode` state to App.tsx (`'daily' | 'week'`)
2. Create ViewToggle component
   - Two buttons: Daily / Week
   - Highlight active view
3. Update Header component to include ViewToggle
4. Conditionally render DailyPlannerPanel or WeekViewPanel
5. Sync selected date between views
   - When switching to week view, show week containing selected date
   - When clicking a day in week view and switching to daily, show that day

### Task 6.5: Frontend - Week View Task Management
**Estimated Time: 30 minutes**
**Status: [x] Completed**

1. Implement task creation in week view
   - Quick add input for each day column
   - Or click "+ Add" button on day to open modal with pre-filled date
2. Implement task completion toggle in week view
3. Implement task deletion in week view
4. Implement task editing (click to open modal)
5. Sync state after any CRUD operation

### Task 6.6: Integration Testing - Week View
**Estimated Time: 20 minutes**
**Status: [ ] Pending**

1. Test: Navigate between weeks
2. Test: Create task in week view
3. Test: Complete/uncomplete task in week view
4. Test: Delete task in week view
5. Test: Edit task in week view
6. Test: Switch between daily and week view
7. Test: Date sync between views
8. Verify: Data persists correctly

### Task 6.7: UI Polish - Week View
**Estimated Time: 15 minutes**
**Status: [ ] Pending**

1. Ensure consistent styling with daily view
2. Add hover effects and transitions
3. Highlight today's column
4. Test responsive layout
5. Polish spacing and typography

---

## Week View Checklist

- [x] Backend: GET /tasks/week endpoint working
- [x] Frontend: WeekViewPanel component created
- [x] Frontend: View toggle (Daily/Week) working
- [x] Week navigation (Prev/This/Next week) working
- [x] Tasks displayed in 7-day grid
- [x] Task CRUD operations work in week view
- [x] Today's date highlighted in week view
- [x] View switching syncs selected date
- [ ] Responsive layout for week view
- [ ] All features tested end-to-end

---

## Phase 7: Drag & Drop Feature (v1.2)

### Task 7.1: Install Drag & Drop Library
**Estimated Time: 10 minutes**
**Status: [x] Completed**

1. Install @hello-pangea/dnd (maintained fork of react-beautiful-dnd)
   ```bash
   cd frontend && npm install @hello-pangea/dnd
   ```
2. Install TypeScript types if needed
3. Verify installation with `npm list @hello-pangea/dnd`

### Task 7.2: Create DraggableTaskItem Component
**Estimated Time: 20 minutes**
**Status: [x] Completed**

1. Create `src/components/DraggableTaskItem.tsx`
2. Wrap TaskItem with `Draggable` component from @hello-pangea/dnd
3. Add drag handle styling
4. Add visual feedback during drag (lifted state)
5. Maintain all existing TaskItem functionality

### Task 7.3: Update BrainDumpPanel for Drag & Drop
**Estimated Time: 25 minutes**
**Status: [x] Completed**

1. Import `Droppable` from @hello-pangea/dnd
2. Wrap task list with `Droppable` component (id: "brain-dump")
3. Replace TaskItem with DraggableTaskItem
4. Add placeholder for drop area
5. Style drop target when dragging over
6. Handle internal reordering within Brain Dump

### Task 7.4: Update DailyPlannerPanel for Drag & Drop
**Estimated Time: 25 minutes**
**Status: [x] Completed**

1. Import `Droppable` from @hello-pangea/dnd
2. Wrap task list with `Droppable` component (id: "daily-planner")
3. Replace TaskItem with DraggableTaskItem
4. Add placeholder for drop area
5. Style drop target when dragging over
6. Handle internal reordering within Daily Planner

### Task 7.5: Implement Cross-Panel Drag & Drop in App.tsx
**Estimated Time: 35 minutes**
**Status: [x] Completed**

1. Import `DragDropContext` from @hello-pangea/dnd
2. Wrap main content with `DragDropContext`
3. Implement `onDragEnd` handler:
   - Detect source and destination panels
   - Handle Brain Dump → Daily Planner (schedule task to selectedDate)
   - Handle Daily Planner → Brain Dump (unschedule task)
   - Handle reordering within same panel
   - Update backend via API call
   - Update local state optimistically
4. Handle edge cases (drop outside droppable, same position)

### Task 7.6: Backend - Task Order API (Optional)
**Estimated Time: 20 minutes**
**Status: [ ] Pending**

1. Add `order` field to Task entity (optional for MVP)
2. Update reorder endpoint: `PATCH /tasks/:id/reorder`
3. Or use batch update: `PATCH /tasks/reorder` with task IDs array
4. Note: For MVP, order can be maintained in frontend state only

### Task 7.7: Integration Testing - Drag & Drop
**Estimated Time: 25 minutes**
**Status: [ ] Pending**

1. Test: Drag task within Brain Dump (reorder)
2. Test: Drag task within Daily Planner (reorder)
3. Test: Drag task from Brain Dump to Daily Planner
4. Test: Drag task from Daily Planner to Brain Dump
5. Test: Visual feedback during drag
6. Test: Drop outside valid area (should cancel)
7. Test: State persists after refresh (if backend order implemented)
8. Verify: No console errors during drag operations

### Task 7.8: UI Polish - Drag & Drop
**Estimated Time: 15 minutes**
**Status: [ ] Pending**

1. Add smooth animations for drag transitions
2. Style drag handle (grip icon)
3. Add drop zone highlight color
4. Add shadow/elevation effect on dragged item
5. Ensure consistent styling with existing UI
6. Test performance with many tasks

---

## Drag & Drop Checklist

- [x] @hello-pangea/dnd library installed
- [x] DraggableTaskItem component created
- [x] BrainDumpPanel supports drag & drop
- [x] DailyPlannerPanel supports drag & drop
- [x] Cross-panel drag & drop working (Brain Dump ↔ Daily Planner)
- [x] Visual feedback during drag operations
- [x] Task scheduling/unscheduling via drag works
- [x] State updates correctly after drag operations
- [ ] All features tested end-to-end

---

## Phase 8: Theme Customization (v1.3)

### Task 8.1: Create ThemeContext & State
**Estimated Time: 20 minutes**
**Status: [ ] Pending**

1. Create `src/contexts/ThemeContext.tsx`
2. Define theme colors interface (primary, background, surface, etc.)
3. Implement `ThemeProvider` with `localStorage` persistence
4. Define pre-set themes (Ocean Blue, Coral Red, Forest Green, Lavender Purple)
5. Expose `currentTheme` and `setTheme` via hook `useTheme`

### Task 8.2: Configure Tailwind v4 CSS Variables
**Estimated Time: 15 minutes**
**Status: [ ] Pending**

1. Update `index.css` to use CSS variables for theme colors
   - `@theme { --color-primary: var(--primary); ... }`
2. Create mapping logic in `ThemeProvider` to update `document.documentElement.style`
   - Set `--primary` to user selected color

### Task 8.3: Create ThemeSelector Component
**Estimated Time: 30 minutes**
**Status: [ ] Pending**

1. Create `src/components/common/ThemeSelector.tsx`
2. Display color swatches for available themes
3. Add "Custom Color" picker (html native color input)
4. Highlight active theme
5. Add floating settings button or place in header

### Task 8.4: Integration & Testing - Theme
**Estimated Time: 15 minutes**
**Status: [ ] Pending**

1. Add `ThemeSelector` to `App.tsx` (e.g., inside a Settings modal or as a dropdown)
2. Wrap App with `ThemeProvider`
3. Test: Change theme updates colors instantly
4. Test: Reload page maintains selected theme
5. Test: Check all components (buttons, headers, highlights) reflect new primary color

---

## Theme Feature Checklist

- [ ] ThemeContext created with persistence
- [ ] CSS Variables configured in index.css (Tailwind v4)
- [ ] ThemeSelector UI component created
- [ ] Theme switching working in real-time
- [ ] Custom color picker implemented
- [ ] Settings persists across reloads

---

## Phase 9: Mandalart Design Refresh (v1.4)

### Task 9.1: Style Analysis & Theme Integration
**Estimated Time: 15 minutes**
**Status: [ ] Pending**

1. Analyze `mandart_antigravity/style.css` for color schemes and layout techniques.
2. Define Tailwind color utility map based on reference styles.
3. Integrate with existing `ThemeContext` (ensure primary color influences Mandalart).

### Task 9.2: Refactor Mandalart Components
**Estimated Time: 45 minutes**
**Status: [ ] Pending**

1. **MandalartView**: Update background and container spacing.
2. **MandalartCell**:
   - Remove "촌스러운" default styles (basic borders, plain white).
   - Apply "Soft Pastel" look:
     - Center Grid (Main Goal): Strongest accent color.
     - Surround 8 Grids (Sub Goals): Medium accent or distinct pastel colors.
     - Outer Cells: Lightest shade or white with colored border.
   - Improve typography (font weight, alignment).
3. **Animations**: Add subtle scale-up on hover and smooth transition on focus.

---

## Phase 10: Enhanced Pomodoro Timer (v1.5) - 태스크 연동 타이머

### Task 10.1: Update Task Type & Store
**Estimated Time: 20 minutes**
**Status: [ ] Pending**

1. **Update `types/task.ts`**:
   - Add `actualDuration?: number` - 실제 소요 시간 (분)
   - Add `timerStartedAt?: string` - 타이머 시작 시점 (ISO string)

2. **Update `useAppStore.tsx`**:
   - Add `startTaskTimer(taskId: string)` action
     - 현재 시간을 timerStartedAt으로 저장
     - startTime이 없으면 현재 시간으로 설정
   - Add `stopTaskTimer(taskId: string)` action
     - timerStartedAt과 현재 시간 차이로 actualDuration 계산
     - timerStartedAt 초기화 (null)
   - Add `activeTimerTaskId: string | null` state
   - Add `getActiveTimerTask()` selector

### Task 10.2: Refactor usePomodoro Hook
**Estimated Time: 30 minutes**
**Status: [ ] Pending**

1. **Update `hooks/usePomodoro.ts`**:
   - Add `currentTaskId: string | null` state
   - Add `startWithTask(taskId: string)` function
   - Add `stopAndRecordTime()` function
   - Modify timer logic to track actual elapsed time
   - Add `elapsedMinutes` computed value
   - Export task-related state and functions

### Task 10.3: Update FloatingTimer Component
**Estimated Time: 45 minutes**
**Status: [ ] Pending**

1. **Modify `FloatingTimer.tsx`**:
   - Show current task title when timer is linked to a task
   - Display elapsed time in real-time (stopwatch mode)
   - Add "종료" button that calls stopAndRecordTime
   - Show different UI for:
     - No task (기존 포모도로 모드)
     - Task timer running (태스크 시간 측정 모드)
   - After stop, show summary (실제 소요 시간)

### Task 10.4: Add Timer Start Button to TaskList
**Estimated Time: 30 minutes**
**Status: [ ] Pending**

1. **Update `TaskList.tsx`**:
   - Add "▶ 시작" button on unscheduled tasks (no startTime)
   - Button calls startWithTask(taskId)
   - Show "⏹ 진행중" indicator when task timer is active
   - Show actualDuration after task is stopped

2. **Update `TimeSlots.tsx`**:
   - Show actualDuration vs duration comparison
   - Visual indicator for tasks with recorded time

### Task 10.5: Schedule Notification System
**Estimated Time: 60 minutes**
**Status: [ ] Pending**

1. **Create `hooks/useScheduleNotification.ts`**:
   - Request browser notification permission on mount
   - Check scheduled tasks every minute
   - Trigger notification when startTime matches current time
   - Handle "나중에 알림" (snooze 5 minutes)

2. **Create `components/planner/ScheduleAlertModal.tsx`**:
   - Show modal when scheduled task time arrives
   - Display task title and scheduled time
   - Buttons: "타이머 시작", "5분 후 알림", "무시"
   - Auto-dismiss after 30 seconds if no action

3. **Integrate in `App.tsx`**:
   - Add notification hook
   - Render ScheduleAlertModal when alert is triggered

### Task 10.6: Testing & Polish
**Estimated Time: 30 minutes**
**Status: [ ] Pending**

1. Test: Start timer from unscheduled task
2. Test: Stop timer and verify actualDuration saved
3. Test: Schedule notification triggers at correct time
4. Test: Snooze functionality works
5. Test: Timer persists across view changes
6. Test: Multiple tasks don't conflict
7. Polish: Animations for timer state changes
8. Polish: Sound effects for start/stop

---

## Enhanced Pomodoro Checklist

- [ ] Task type updated with actualDuration, timerStartedAt
- [ ] useAppStore has timer-related actions
- [ ] usePomodoro supports task-linked timing
- [ ] FloatingTimer shows task info when active
- [ ] TaskList has timer start buttons
- [ ] TimeSlots shows actual vs planned duration
- [ ] Schedule notifications working
- [ ] Alert modal implemented
- [ ] Sound effects working
- [ ] All features tested end-to-end

