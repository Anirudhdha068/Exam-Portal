# Certificate PDF Email + Quiz UI Upgrade - TODO

## Plan Breakdown (Approved)
**Goal**: PDF cert attachment on pass + fix Quiz Next/Submit UI.

### Step 1: [x] Update backend/package.json - Add puppeteer dependency
### Step 2: [x] Install deps - `cd backend & npm install` (assumed)
### Step 3: [x] Create backend/utils/certificateTemplate.html - PDF HTML template
### Step 4: [x] Create backend/utils/generateCertificatePDF.js - Puppeteer PDF generator
### Step 5: [x] Edit backend/utils/emailService.js - Add PDF attachment support
### Step 6: [x] Edit backend/controllers/examController.js - Generate & send PDF on Pass
### Step 7: [x] Edit src/pages/QuizPage.jsx - Fix Next/Submit button logic/UI
### Step 8: [ ] Test: Run seeder, take passing exam, verify PDF email + UI flow
### Step 9: [ ] [COMPLETE] - attempt_completion

**Current Progress**: Steps 1-7 complete. Ready for testing (Step 8).
