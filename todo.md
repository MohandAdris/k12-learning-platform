# K-12 Learning Platform - Project TODO

## Bug Fixes (Priority)
- [ ] Fix language switcher dropdown not appearing (needs alternative approach)
- [x] Fix unit accordion not expanding to show lectures
- [x] Update courses.get procedure to include lectures with units
- [ ] Test enrollment flow functionality

## Phase 1: Database Schema & Backend Setup
- [x] Update Drizzle schema with multilingual support (English, Arabic, Hebrew)
- [x] Add User, School, Course, Unit, Lecture, Attachment tables
- [x] Add InteractiveGame, UnitGame, GameSession tables
- [x] Add Enrollment, Progress, AuditLog, AnalyticsEvent tables
- [x] Add TranslationCache table for i18n optimization
- [x] Push database schema with `pnpm db:push`

## Phase 2: Backend API Implementation
- [x] Create authentication procedures (login, refresh, logout)
- [x] Create user management procedures (CRUD, profile)
- [x] Create course management procedures (CRUD, publish, preview)
- [x] Create unit and lecture management procedures
- [x] Create attachment management procedures
- [x] Create game management procedures
- [x] Create enrollment and progress tracking procedures
- [x] Create analytics and reporting procedures
- [ ] Create export procedures (CSV, Excel, JSON)
- [x] Add role-based access control (RBAC) middleware
- [ ] Add rate limiting and security measures

### Phase 3: i18n Infrastructure
- [x] Install and configure next-i18next or similar i18n library
- [x] Create translation files for English, Arabic, Hebrew
- [x] Add RTL support for Arabic and Hebrew
- [x] Configure font loading for Arabic and Hebrew scripts
- [ ] Test language switching functionality- [ ] Add direction detection and CSS adjustments

## Phase 4: Student Portal Frontend
- [x] Create student login page
- [x] Create course catalog with grid layout
- [ ] Implement hover preview tooltip for courses
- [x] Create course overview page
- [ ] Create unit detail page with video player
- [ ] Implement lecture timeline sidebar
- [ ] Add video player with HLS support and captions
- [ ] Display lecture summary, attachments, and references
- [ ] Implement interactive game section
- [ ] Add progress tracking and resume functionality
- [ ] Create student dashboard with enrolled courses
- [ ] Implement language switcher in student portal

## Phase 5: Teacher Dashboard Frontend
- [ ] Create teacher login page
- [ ] Create teacher dashboard home with KPIs
- [ ] Implement course management (list, create, edit, delete)
- [ ] Create course editor with drag-drop timeline
- [ ] Implement unit management (CRUD, reorder)
- [ ] Implement lecture management (CRUD, video upload)
- [ ] Add attachment management interface
- [ ] Implement game management and linking
- [ ] Create student management interface
- [ ] Create school management interface
- [ ] Implement analytics dashboard with charts
- [ ] Add export functionality (CSV, Excel, JSON)
- [ ] Implement language switcher in teacher dashboard

## Phase 6: Video & Media Infrastructure
- [ ] Integrate S3 storage for video uploads
- [ ] Implement signed URL generation for uploads
- [ ] Add video transcoding support (HLS)
- [ ] Implement caption/subtitle upload
- [ ] Add thumbnail generation
- [ ] Implement video player with resume functionality
- [ ] Add playback speed controls
- [ ] Implement progress tracking during playback

## Phase 7: Interactive Games Integration
- [ ] Implement LTI 1.3 integration
- [ ] Add SCORM package support
- [ ] Implement xAPI tracking
- [ ] Add HTML5 game iframe embedding
- [ ] Implement postMessage API for game communication
- [ ] Add game session tracking
- [ ] Implement scoring and completion rules

## Phase 8: Analytics & Reporting
- [ ] Implement analytics event tracking
- [ ] Create engagement metrics dashboard
- [ ] Add time-series charts for user activity
- [ ] Implement course-specific analytics
- [ ] Add game analytics (attempts, scores, completion)
- [ ] Create student profile analytics
- [ ] Implement CSV export for all reports
- [ ] Add Excel export functionality
- [ ] Implement JSON export for API integration

## Phase 9: Security & Performance
- [ ] Implement JWT authentication with refresh tokens
- [ ] Add password hashing with Argon2
- [ ] Implement rate limiting per role
- [ ] Add CSRF protection
- [ ] Implement input validation with Zod
- [ ] Add audit logging for admin actions
- [ ] Optimize database queries with indexes
- [ ] Implement caching strategy
- [ ] Add image optimization
- [ ] Implement lazy loading for media

## Phase 10: Testing
- [ ] Write E2E tests for student login flow
- [ ] Write E2E tests for course enrollment
- [ ] Write E2E tests for video playback
- [ ] Write E2E tests for game completion
- [ ] Write E2E tests for teacher course creation
- [ ] Write E2E tests for student management
- [ ] Write E2E tests for analytics export
- [ ] Test RTL layout for Arabic and Hebrew
- [ ] Test language switching functionality
- [ ] Test accessibility (WCAG 2.1 AA)

## Phase 11: Seed Data
- [ ] Create 3 schools with multilingual names
- [ ] Create 50 students per school (150 total)
- [ ] Create 5 teachers
- [ ] Create 6 courses with multilingual content
- [ ] Create 3 units per course (18 total)
- [ ] Create 4 lectures per unit (72 total)
- [ ] Add 2 games per course (12 total)
- [ ] Create sample video URLs and captions
- [ ] Add sample attachments and references
- [ ] Generate demo credentials

## Phase 12: Documentation
- [ ] Write README with setup instructions
- [ ] Create architecture documentation
- [ ] Write API documentation
- [ ] Create teacher user manual
- [ ] Create student user manual
- [ ] Write deployment guide
- [ ] Create troubleshooting guide
- [ ] Document i18n translation process
- [ ] Add code comments and JSDoc

## Phase 13: CI/CD & Deployment
- [ ] Create GitHub Actions workflow
- [ ] Add automated testing in CI
- [ ] Configure environment variables
- [ ] Set up staging environment
- [ ] Set up production environment
- [ ] Configure CDN for video delivery
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Add health check endpoints
- [ ] Create deployment checklist



## Critical Bugs
- [x] Fix RBAC to allow ADMIN role to access student and teacher features




## Next Priority Features
- [x] Create simple language switcher with buttons (no dropdown)
- [x] Build lecture page with video player
- [x] Implement progress tracking UI
- [ ] Create teacher dashboard home page
- [ ] Add course creation form for teachers




## Enrollment Implementation
- [x] Fix enrollment button functionality on course cards
- [x] Update StudentHome to show enrolled courses in "My Courses" section
- [ ] Add unenroll functionality
- [x] Show enrollment status on course detail page
- [x] Test enrollment flow end-to-end

