# Implementation Plan: Admin Academic Management + Quiz Instruction Flow

## Information Gathered
- MERN stack with Vite React frontend, Express/MongoDB backend
- Academic models (Program, Semester, Course) already exist with proper schemas and refs
- Academic routes are mounted at `/api` in server.js, so full paths are `/api/programs`, `/api/semesters/:programId`, `/api/courses/:semesterId`, `/api/courses`, `/api/course/:id`
- **Bug found**: `ManageAcademic.jsx` incorrectly uses `/api/academic/*` paths and has primitive prompt-based UI instead of proper forms
- `CreateExam.jsx` correctly uses `/api/programs`, `/api/semesters/:programId`, `/api/courses/:semesterId`
- `QuizPage.jsx` directly renders exam questions on mount with no instruction screen and no timer
- `App.jsx` has `/exam/:examId` → `QuizPage` directly (no instructions)
- `StudentDashboard` and `CourseDetail` navigate directly to `/exam/${examId}`

---

## Step-by-Step Plan

### 1. Backend: Add Duplicate Validation
**File**: `backend/controllers/academicController.js`
- `createProgram`: Check if program name already exists (case-insensitive) → return 409 if duplicate
- `createSemester`: Check if semester name already exists for the given program → return 409 if duplicate
- `createCourse`: Check if course code already exists (case-insensitive) → return 409 if duplicate
- Return proper error messages instead of generic 500

### 2. Backend: Ensure Exam Meta API is Complete
**File**: `backend/controllers/examController.js`
- `getExamDetails` already returns title, durationMinutes, totalMarks, questions array → ensure questions count is accessible on frontend (`exam.questions.length`)

### 3. Frontend: Update Routing
**File**: `src/App.jsx`
- Add `/admin/manage-academic` → `ManageAcademic`
- Change `/exam/:examId` → `ExamInstructions` (NEW component)
- Add `/exam/:examId/start` → `QuizPage`

### 4. Frontend: Add Admin Sidebar Link
**File**: `src/components/AdminSidebar.jsx`
- Add "Manage Academic" NavLink pointing to `/admin/manage-academic`

### 5. Frontend: Rewrite ManageAcademic.jsx
**File**: `src/pages/ManageAcademic.jsx`
- Fix API paths from `/api/academic/*` to `/api/*`
- Replace primitive `prompt()`-based UI with proper HTML forms
- **Program Form**: name input, description input, submit button
- **Semester Form**: Program dropdown (fetched from API), name input, submit button
- **Course Form**: Program dropdown → cascades to Semester dropdown, title input, code input, submit button
- Display all data in styled cards/tables with counts
- Handle loading, errors, and success states
- Auto-refresh lists after successful creation

### 6. Frontend: Create ExamInstructions.jsx
**File**: `src/pages/ExamInstructions.jsx` (NEW)
- Fetch exam data from `/api/exam/${examId}` (auth required)
- Display:
  - Exam title
  - Duration
  - Total marks
  - Number of questions (`exam.questions.length`)
  - Rules list (no refresh, no tab switching, timer starts on Start)
- "Start Quiz" button → navigates to `/exam/${examId}/start`

### 7. Frontend: Update QuizPage.jsx
**File**: `src/pages/QuizPage.jsx`
- Add countdown timer that auto-submits when time reaches 0
- Add `beforeunload` event listener to warn about accidental refresh
- Add `visibilitychange` event listener to detect tab switching (optional warning)
- Timer starts immediately since user now explicitly navigates here via "Start Quiz"
- Keep existing question navigation and submit logic

### 8. Frontend: Update Student Navigation
**Files**: `src/pages/StudentDashboard.jsx`, `src/pages/CourseDetail.jsx`
- Update exam navigation to go to `/exam/${examId}` (instructions page) instead of directly starting quiz

### 9. Frontend: Add Instruction Styles
**File**: `src/styles/examInstructions.css` (NEW)
- Clean, centered card layout for instruction page
- Styled rules list and prominent "Start Quiz" button

---

## Dependent Files to Edit
1. `backend/controllers/academicController.js`
2. `backend/controllers/examController.js` (minor)
3. `src/App.jsx`
4. `src/components/AdminSidebar.jsx`
5. `src/pages/ManageAcademic.jsx`
6. `src/pages/ExamInstructions.jsx` (NEW)
7. `src/pages/QuizPage.jsx`
8. `src/pages/StudentDashboard.jsx`
9. `src/pages/CourseDetail.jsx`
10. `src/styles/examInstructions.css` (NEW)

## Followup Steps After Editing
- Verify dropdown cascading (Program → Semester → Course)
- Test duplicate validation on backend
- Test instruction page → start quiz → timer flow
- Test refresh warning and auto-submit on timeout
- Ensure no hardcoded data anywhere

