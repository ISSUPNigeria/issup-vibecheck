# USER STORY: ISSUP Mental Health Screening & Support Platform

**Document Version:** 1.0
**Date:** January 15, 2026
**Status:** Prototype Complete - Ready for Production Planning
**Target Audience:** Project Managers, Product Owners, Stakeholders

---

## 📖 EXECUTIVE SUMMARY

The ISSUP Mental Health Screening & Support Platform is a comprehensive web application that provides:
1. **Evidence-based mental health screening** using validated WHO instruments (ASSIST, PHQ-9, Triggers)
2. **AI-powered supportive chatbot** for personalized guidance
3. **Nigerian professional resource matching** based on location and needs
4. **Crisis detection and immediate support** with Nigerian hotlines

**Current Status:** Fully functional prototype with session-based (anonymous) screening. Ready for production enhancement with user authentication and persistent data storage.

---

## 🎯 PROJECT VISION

### **Problem Statement**
- Mental health and substance use issues are growing in Nigeria
- Many people don't know where to start or feel stigmatized seeking help
- Existing resources are fragmented and hard to find
- No accessible, confidential, evidence-based self-screening tools available in Nigerian context

### **Solution**
A user-friendly web platform that:
- Provides confidential, evidence-based mental health screening
- Offers empathetic AI support without judgment
- Connects users with appropriate Nigerian mental health professionals
- Prioritizes crisis detection and immediate intervention

### **Target Users**
1. **Primary:** Individuals (18+) in Nigeria seeking help for mental health, substance use, or trauma concerns
2. **Secondary:** Healthcare workers looking for screening tools to recommend to patients
3. **Tertiary:** Researchers and organizations tracking mental health trends (future phase)

---

## 👤 USER PERSONAS

### **Persona 1: Chioma - The Concerned Young Professional**
- **Age:** 28, Lagos
- **Situation:** Experiencing stress, occasional drinking to cope, doesn't know if she needs help
- **Goals:** Understand if her drinking is problematic, find support without stigma
- **Pain Points:** Fear of judgment, doesn't know where to start, worried about privacy

### **Persona 2: Emeka - The Worried Parent**
- **Age:** 45, Abuja
- **Situation:** Noticed mood changes in himself, family history of depression
- **Goals:** Check his mental health status, find professional help near him
- **Pain Points:** Doesn't want family to know yet, needs affordable options

### **Persona 3: Ngozi - Crisis Situation**
- **Age:** 32, Port Harcourt
- **Situation:** Experiencing suicidal thoughts, doesn't know who to call
- **Goals:** Immediate help, crisis support, safe space to talk
- **Pain Points:** Feels hopeless, doesn't know Nigerian crisis hotlines, needs immediate response

---

## 📱 COMPLETE USER JOURNEY

### **PHASE 1: DISCOVERY & LANDING**

#### User Story 1.1: Landing Page Discovery
**As a** visitor to the website
**I want to** quickly understand what the platform offers
**So that** I can decide if this is the right resource for me

**Acceptance Criteria:**
- ✅ Clear headline explaining the service ("Your Journey to Wellness Starts Here")
- ✅ Key benefits visible: 100% Confidential, No Registration, 5-10 Minutes
- ✅ Visual representation (African imagery) for cultural relevance
- ✅ Prominent "Start Free Screening" call-to-action button
- ✅ Features section explaining: Privacy, AI Support, Professional Resources
- ✅ Crisis support banner always visible with Nigerian hotline numbers
- ✅ Responsive design for mobile, tablet, desktop

**Current Implementation:** ✅ Complete
**Production Enhancement:** Add user testimonials (anonymous), track conversion metrics

---

#### User Story 1.2: Header Navigation & Crisis Access
**As a** user on any page
**I want to** access crisis support immediately
**So that** I can get help if I'm in an emergency

**Acceptance Criteria:**
- ✅ Persistent header with crisis hotline (🚨 📞 +234 704 652 6917)
- ✅ Header visible on all pages (sticky navigation)
- ✅ One-click calling from mobile devices
- ✅ Links to Home and Screening pages
- 🚧 Mobile hamburger menu (pending)

**Current Implementation:** ✅ Complete (mobile menu pending)
**Production Enhancement:** Add "My Account" link when user is logged in

---

### **PHASE 2: SCREENING PROCESS**

#### User Story 2.1: Demographics Collection
**As a** new user starting screening
**I want to** provide basic demographic information
**So that** I can receive location-specific and personalized support

**Acceptance Criteria:**
- ✅ Collect: Age, Gender, State, City, Language, Occupation, Education
- ✅ Uses 37 Nigerian states (dropdown selection)
- ✅ Supports Nigerian languages: English, Yoruba, Hausa, Igbo, Pidgin
- ✅ Clear privacy disclaimer ("Your information is confidential")
- ✅ Progress indicator showing Step 1 of screening process
- ✅ Can navigate back if needed

**Current Implementation:** ✅ Complete (session-based, temporary storage)
**Production Enhancement:**
- Store in user profile database (persistent)
- Allow users to update demographics later
- Add email/phone for notifications (optional)

---

#### User Story 2.2: ASSIST Substance Use Screening
**As a** user completing screening
**I want to** answer questions about my substance use
**So that** I can understand if my use is problematic

**Screening Flow:**
1. **Lifetime Use Question (Q1):**
   - 10 substance categories shown
   - User selects substances ever used
   - Can specify "Other" substances

2. **Substance-Specific Questions (Q2-Q8):**
   - Only asks about substances user indicated they've used
   - Questions for each substance:
     - Q2: Frequency of use (past 3 months)
     - Q3: Strong desire/urge to use
     - Q4: Health, social, legal, financial problems
     - Q5: Failure to do what was expected (NOT asked for tobacco)
     - Q6: Concern from family/friends
     - Q7: Tried and failed to control use
   - Scale: 0 (Never) to 4 (Daily/Almost Daily)

3. **Injection Use Question (Q8):**
   - Only if selected "Yes" to any injectable substance
   - Asks about injection drug use

**Acceptance Criteria:**
- ✅ Adaptive flow (only asks about substances used)
- ✅ Q5 automatically skipped for tobacco
- ✅ Clear instructions for each question
- ✅ Visual scale indicators (0-4 with labels)
- ✅ Progress bar updates dynamically
- ✅ Can go back to previous questions
- ✅ Scoring follows WHO ASSIST V3.0 guidelines
  - Low risk: 0-3 (tobacco 0-10)
  - Moderate risk: 4-26
  - High risk: 27+

**Current Implementation:** ✅ Complete
**Production Enhancement:**
- Save incomplete screening (resume later feature)
- Show "X minutes remaining" estimate
- Add tooltips for clarification

---

#### User Story 2.3: PHQ-9 Depression Screening
**As a** user completing screening
**I want to** answer questions about my mood and mental health
**So that** I can understand my depression risk level

**Screening Content:**
- 9 questions about past 2 weeks:
  - Q1: Little interest or pleasure
  - Q2: Feeling down, depressed, hopeless
  - Q3: Sleep problems
  - Q4: Feeling tired, little energy
  - Q5: Appetite problems
  - Q6: Feeling bad about self, failure
  - Q7: Trouble concentrating
  - Q8: Moving/speaking slowly or very restless
  - Q9: ⚠️ **Crisis Question:** Thoughts of self-harm
- Scale: 0 (Not at all) to 3 (Nearly every day)
- **Functional Impairment Question:**
  - Only shows if any symptoms reported
  - Asks how symptoms affect daily life

**Acceptance Criteria:**
- ✅ All 9 questions displayed clearly
- ✅ Q9 highlighted as important safety question
- ✅ Running total NOT shown during screening (only after)
- ✅ Functional impairment question conditional
- ✅ Crisis banner appears if Q9 > 0 (suicidal ideation)
- ✅ Clear labels for each scale point
- ✅ Cannot proceed without answering all questions
- ✅ Scoring follows official PHQ-9 guidelines:
  - Minimal: 0-4
  - Mild: 5-9
  - Moderate: 10-14
  - Moderately Severe: 15-19
  - Severe: 20-27

**Current Implementation:** ✅ Complete
**Production Enhancement:**
- Track Q9 responses separately for crisis analytics
- Send immediate alert to crisis team if Q9 > 0 (future phase)

---

#### User Story 2.4: Triggers Assessment (Conditional)
**As a** user who scored moderate/high on ASSIST or PHQ-9
**I want to** identify what triggers my substance use or negative mental health patterns
**So that** I can develop coping strategies

**Eligibility:**
- Shown ONLY if:
  - Any ASSIST substance score ≥ 4 (moderate/high risk) **OR**
  - PHQ-9 total score ≥ 10 (moderate depression or higher)

**Triggers Categories:**
1. **External Triggers (Situational):**
   - Bars/clubs
   - Parties
   - Friends who use
   - Certain places
   - Certain activities
   - Custom text input for additional triggers

2. **Internal Triggers (Emotional):**
   - Feeling depressed
   - Feeling anxious or tense
   - Feeling lonely
   - Feeling bored
   - Feeling stressed
   - Feeling angry or frustrated
   - Feeling happy or excited
   - Celebrating something
   - Custom text input for additional triggers

**Acceptance Criteria:**
- ✅ Only displays if eligibility criteria met
- ✅ Multiple selection (checkboxes)
- ✅ Can add custom triggers
- ✅ Shows count of selected triggers
- ✅ Can skip if user prefers not to answer
- ✅ No "high-risk" labels (all triggers treated equally per WHO ASSIST)
- ✅ Pattern analysis:
  - Low: 0-3 total triggers
  - Moderate: 4-7 total triggers
  - High: 8+ total triggers
- ✅ Info box explaining why triggers matter

**Current Implementation:** ✅ Complete
**Production Enhancement:**
- Save trigger patterns for longitudinal analysis
- Suggest coping strategies based on trigger types

---

### **PHASE 3: RESULTS & FEEDBACK**

#### User Story 3.1: Comprehensive Results Display
**As a** user who completed screening
**I want to** see clear, supportive results
**So that** I can understand my situation and next steps

**Results Components:**
1. **ASSIST Results Card:**
   - Substance-by-substance breakdown
   - Risk level for each (Low/Moderate/High)
   - Color-coded: Green (low), Orange (moderate), Red (high)
   - Brief intervention recommendations for moderate/high

2. **PHQ-9 Results Card:**
   - Total score (0-27)
   - Severity interpretation (Minimal to Severe)
   - Clinical threshold indicator (≥10 = clinical attention recommended)
   - Q9 response flagged if > 0

3. **Triggers Visualization:**
   - Count of external vs internal triggers
   - Pattern level (Low/Moderate/High)
   - Description of primary trigger type (situational vs emotional)

4. **AI-Generated Personalized Feedback:**
   - Empathetic summary of screening results
   - Recognizes strengths and concerns
   - Culturally sensitive language
   - No medical diagnosis (disclaimer present)

5. **Crisis Banner (Conditional):**
   - Displays if PHQ-9 Q9 > 0 OR any ASSIST high risk
   - Prominent red banner with pulse animation
   - Nigerian crisis hotlines:
     - WhatsApp: +234 812 937 8557
     - Call/WhatsApp: +234 704 652 6917
     - Emergency: 112
   - Encouraging message about help being available

6. **Next Steps Section:**
   - "Chat with AI Support" button
   - "Find Professional Resources" button
   - "Download PDF Report" option (future)

**Acceptance Criteria:**
- ✅ All results clearly displayed
- ✅ No stigmatizing language
- ✅ Supportive, non-judgmental tone
- ✅ Crisis resources always visible if applicable
- ✅ Results persist for session duration
- ✅ Responsive layout for all devices
- ✅ Can navigate to chat or resources

**Current Implementation:** ✅ Complete
**Production Enhancement:**
- Save results to user's account
- Allow downloading PDF report
- Track result views and user actions
- Enable sharing with selected professionals (with consent)
- Show historical results comparison (longitudinal tracking)

---

### **PHASE 4: AI CHAT SUPPORT**

#### User Story 4.1: AI Chatbot Interaction
**As a** user who received screening results
**I want to** discuss my results and concerns with an AI chatbot
**So that** I can get guidance and feel supported

**Chat Features:**
1. **Context-Aware Responses:**
   - Agent has access to full screening responses
   - References specific answers in conversation
   - Understands ASSIST scores, PHQ-9 severity, triggers

2. **WHO Brief Intervention Framework:**
   - 9-step guidance for substance use discussions:
     1. Provide feedback on screening results
     2. Explain risk levels
     3. Assess readiness to change
     4. Explore pros/cons
     5. Set realistic goals
     6. Develop action plan
     7. Identify barriers
     8. Provide resources
     9. Follow-up planning

3. **Triggers-Aware Conversations:**
   - Discusses identified triggers empathetically
   - Suggests coping strategies
   - Explores patterns and connections

4. **Available Tools:**
   - `analyze_crisis_risk`: Detects crisis language in real-time
   - `get_screening_results`: Retrieves full screening context
   - `search_mental_health_resources`: Finds Nigerian professionals

5. **Nigerian Resource Matching:**
   - Filters by user's state/city
   - Matches specializations to screening concerns
   - Returns 3 focused recommendations
   - Prioritizes free/sliding scale options (💚)
   - Always includes crisis hotlines first

**Acceptance Criteria:**
- ✅ Chat interface clean and accessible
- ✅ Streaming responses (types out gradually)
- ✅ Markdown support for formatting
- ✅ Copy button for each message
- ✅ Auto-scrolls to latest message
- ✅ Clear disclaimer: "I'm an AI assistant, not a therapist"
- ✅ 3-5 sentence minimum responses (empathy requirement)
- ✅ Never provides medical diagnosis or advice
- ✅ Crisis detection triggers immediate hotline display
- ✅ Resource recommendations relevant to location and needs

**Current Implementation:** ✅ Complete
**Production Enhancement:**
- Save chat history to user account
- Allow resuming previous conversations
- Add voice input/output option
- Track common questions for content improvement
- Human handoff option for complex cases (future)

---

### **PHASE 5: PROFESSIONAL RESOURCES**

#### User Story 5.1: Finding Nigerian Mental Health Professionals
**As a** user needing professional help
**I want to** find qualified mental health professionals near me
**So that** I can get appropriate treatment and support

**Resource Matching Algorithm:**
- **Location Scoring:**
  - Same city as user: 10 points
  - Same state as user: 5 points

- **Specialization Matching:**
  - ASSIST concerns → addiction, substance_abuse specialists (3 pts each)
  - PHQ-9 concerns → depression, anxiety specialists (3 pts each)
  - Triggers concerns → PTSD, trauma specialists (3 pts each)

- **Affordability Bonus:**
  - Free/sliding scale: +2 points (highlighted with 💚)

- **Professional Types:**
  - Therapist, Counselor, Psychiatrist, Psychologist
  - Support Groups, NGOs, Religious Counselors
  - Rehab Centers

**Resource Information Displayed:**
- Name, Type, Specializations
- Phone (Nigerian format: +234-XXX-XXX-XXXX)
- Email, Website (if available)
- Address, City, State
- Languages spoken
- Free/sliding scale indicator
- Accepting new patients status

**Acceptance Criteria:**
- ✅ Top 3 best-matched professionals shown
- ✅ Nigerian crisis hotlines always displayed first
- ✅ Free/sliding scale options highlighted
- ✅ One-click calling from mobile
- ✅ Multiple language support indicated
- ✅ Resources from user's state prioritized
- ✅ Fallback to nationwide resources if no local matches

**Current Implementation:** ✅ Complete (50 professionals seeded)
**Production Enhancement:**
- Add more professionals (target: 500+)
- Allow users to rate/review professionals
- Show availability calendar (booking integration)
- Add verified badge for ISSUP partners
- Allow professionals to update their own profiles
- Add search/filter functionality
- Show distance from user's location (maps integration)

---

## 🔄 COMPLETE USER FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE                            │
│  • Value proposition • Features • Crisis banner                 │
│  • CTA: "Start Free Screening"                                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STEP 1: DEMOGRAPHICS                          │
│  • Age, Gender, State, City, Language, etc.                     │
│  • Privacy disclaimer • Progress: Step 1/4+                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: ASSIST (Substance Use)                     │
│  Q1: Lifetime use → Select substances                           │
│  Q2-Q7: Questions for each substance selected                   │
│  Q8: Injection use (conditional)                                │
│  • Adaptive flow • WHO ASSIST V3.0 scoring                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STEP 3: PHQ-9 (Depression)                      │
│  9 questions + functional impairment                            │
│  • Q9 crisis detection • Official PHQ-9 scoring                 │
│  • Crisis banner if Q9 > 0                                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
                ┌─┴─┐
         Eligible?│ │ ASSIST ≥4 OR PHQ-9 ≥10?
                └─┬─┘
        ┌─────────┴─────────┐
       YES                  NO
        │                    │
        ▼                    │
┌─────────────────┐          │
│  STEP 4:        │          │
│  TRIGGERS       │          │
│  (Conditional)  │          │
└───────┬─────────┘          │
        │                    │
        └────────┬───────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       RESULTS PAGE                              │
│  • ASSIST breakdown • PHQ-9 score • Triggers analysis           │
│  • AI-generated feedback • Crisis banner (if applicable)        │
│  • Next steps: Chat | Find Resources | Download PDF            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌─────────────┐    ┌──────────────────┐
│   AI CHAT   │    │    RESOURCES     │
│   SUPPORT   │    │    MATCHING      │
│             │    │                  │
│ • Context-  │    │ • 3 pros near    │
│   aware     │    │   user           │
│ • Empathetic│    │ • Crisis hotlines│
│ • WHO Brief │    │ • Free/sliding   │
│   Intervention│  │   scale priority │
│ • Resource  │    │                  │
│   matching  │    │                  │
└─────────────┘    └──────────────────┘
```

---

## 🏗️ PRODUCTION ENHANCEMENTS REQUIRED

### **AUTHENTICATION & USER MANAGEMENT**

#### Story 6.1: User Registration
**As a** new user
**I want to** create an account
**So that** I can save my screening results and track progress over time

**Requirements:**
- Email/phone registration
- Password with strength requirements
- Email/SMS verification
- OAuth options (Google, Facebook - optional)
- Accept Terms of Service and Privacy Policy
- Optional profile completion

**Database Schema:**
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    account_status ENUM('active', 'suspended', 'deleted') DEFAULT 'active'
);
```

---

#### Story 6.2: User Login
**As a** returning user
**I want to** log into my account
**So that** I can access my previous results and continue where I left off

**Requirements:**
- Email/phone + password login
- "Remember me" option
- "Forgot password" flow
- Session management (JWT tokens)
- Multi-device support
- Security: Rate limiting, CAPTCHA after failed attempts

---

#### Story 6.3: User Profile Management
**As a** logged-in user
**I want to** update my profile information
**So that** I can keep my demographics and contact information current

**Features:**
- Update demographics
- Change password
- Update notification preferences
- Add/update profile photo (optional)
- Delete account option (with confirmation)

---

### **DATA PERSISTENCE & HISTORY**

#### Story 7.1: Save Screening Results
**As a** logged-in user
**I want to** my screening results automatically saved
**So that** I can review them later and track changes over time

**Database Schema:**
```sql
CREATE TABLE user_screenings (
    screening_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    screening_type ENUM('complete', 'partial') DEFAULT 'complete',
    demographics JSON,
    assist_responses JSON,
    assist_results JSON,
    phq9_responses JSON,
    phq9_results JSON,
    triggers_responses JSON,
    triggers_results JSON,
    ai_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

#### Story 7.2: View Screening History
**As a** logged-in user
**I want to** view my past screening results
**So that** I can see my progress and share with my therapist

**Features:**
- List of all past screenings (date, brief summary)
- Click to view full details
- Compare two screenings side-by-side
- Download PDF report
- Share with professional (generate secure link)
- Filter by date range

---

#### Story 7.3: Resume Incomplete Screening
**As a** logged-in user who started but didn't finish screening
**I want to** resume where I left off
**So that** I don't have to start over

**Requirements:**
- Auto-save progress every question
- Show "Resume Screening" option on dashboard
- Timestamp of last save
- Option to "Start New Screening" instead

---

### **CHAT HISTORY & CONTINUITY**

#### Story 8.1: Save Chat Conversations
**As a** logged-in user
**I want to** my chat conversations saved
**So that** I can continue discussions later and reference past advice

**Database Schema:**
```sql
CREATE TABLE chat_conversations (
    conversation_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    screening_id UUID,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (screening_id) REFERENCES user_screenings(screening_id)
);

CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender ENUM('user', 'ai', 'system'),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON, -- tool calls, citations, etc.
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(conversation_id) ON DELETE CASCADE
);
```

---

#### Story 8.2: View Past Conversations
**As a** logged-in user
**I want to** access my previous AI chat conversations
**So that** I can review advice and coping strategies discussed

**Features:**
- List of past conversations
- Search within conversations
- Star/favorite important messages
- Download conversation transcript
- New conversation vs continue existing

---

### **NOTIFICATIONS & REMINDERS**

#### Story 9.1: Screening Reminders
**As a** user who completed screening
**I want to** receive reminders to re-screen periodically
**So that** I can track my progress over time

**Requirements:**
- Configurable frequency (1 month, 3 months, 6 months)
- Email and/or SMS notifications
- Opt-in/opt-out in settings
- Smart timing (not during crisis periods)

---

#### Story 9.2: Appointment Reminders
**As a** user who scheduled an appointment with a professional
**I want to** receive appointment reminders
**So that** I don't forget my therapy session

**Requirements:**
- Integration with professional booking system (future)
- Reminders 24 hours and 1 hour before
- Option to reschedule from reminder

---

### **ANALYTICS & INSIGHTS**

#### Story 10.1: Personal Insights Dashboard
**As a** logged-in user with multiple screenings
**I want to** see trends and insights about my mental health journey
**So that** I can understand my progress and patterns

**Features:**
- ASSIST scores over time (line chart)
- PHQ-9 severity trends
- Trigger pattern changes
- Positive progress indicators
- Areas of improvement suggestions
- Mood journal (optional addition)

---

#### Story 10.2: Admin Analytics Dashboard
**As an** ISSUP administrator
**I want to** view aggregated, anonymized analytics
**So that** I can understand platform usage and mental health trends in Nigeria

**Metrics:**
- Total screenings completed
- Average scores by region
- Most common substances reported
- Depression severity distribution
- Crisis detection frequency
- Resource utilization rates
- User retention metrics
- Chat engagement statistics

**Privacy Requirement:** All analytics must be fully anonymized and aggregated.

---

## 🔒 SECURITY & PRIVACY REQUIREMENTS

### **Data Protection**
1. **Encryption:**
   - HTTPS/TLS for all communications
   - At-rest encryption for database (especially screening responses)
   - Encrypted backups

2. **Access Control:**
   - Role-based access (User, Professional, Admin)
   - Audit logs for all data access
   - Two-factor authentication for sensitive operations

3. **Data Retention:**
   - User controls data retention period
   - Automatic deletion of inactive accounts (configurable, e.g., 2 years)
   - Right to be forgotten (GDPR-style deletion)

4. **Compliance:**
   - HIPAA-equivalent compliance for health data
   - Nigerian data protection regulations
   - Terms of Service and Privacy Policy
   - Cookie consent management

---

### **Crisis Protocol**
1. **Automatic Detection:**
   - PHQ-9 Q9 > 0 flagged immediately
   - ASSIST high risk flagged
   - Crisis language in chat detected by AI

2. **Response Workflow:**
   - Immediate crisis banner display
   - Nigerian hotlines prominently shown
   - Optional: Alert to crisis team (with user consent)
   - Follow-up check-in after 24 hours (automated message)

3. **Professional Escalation:**
   - Option to connect with human crisis counselor
   - Integration with Nigerian crisis centers (future phase)

---

## 📊 PRODUCTION ROADMAP

### **Phase 1: Foundation (Months 1-2)**
- User authentication system
- Database migration (session → persistent storage)
- User profile management
- Save screening results
- Basic dashboard

**Deliverables:**
- Users can register/login
- Screenings automatically saved
- View past screening results
- Update profile

---

### **Phase 2: Enhanced Features (Months 3-4)**
- Chat history persistence
- Resume incomplete screenings
- Screening history comparison
- PDF report generation
- Email notifications

**Deliverables:**
- Complete chat conversations saved
- Historical trend analysis
- Downloadable reports
- Screening reminders

---

### **Phase 3: Professional Integration (Months 5-6)**
- Professional account types
- Appointment booking system
- Secure result sharing
- Professional directory expansion (500+ resources)
- Professional verification system

**Deliverables:**
- Professionals can manage profiles
- Users can book appointments
- Secure result sharing with consent
- Verified professional badges

---

### **Phase 4: Advanced Analytics (Months 7-8)**
- Personal insights dashboard
- Admin analytics dashboard
- Longitudinal tracking
- Predictive insights (optional)
- Research data export (anonymized, with consent)

**Deliverables:**
- User progress visualization
- Platform-wide analytics
- Research-ready datasets

---

### **Phase 5: Mobile App (Months 9-12)**
- React Native mobile application
- Offline screening capability
- Push notifications
- Biometric authentication
- Same features as web platform

**Deliverables:**
- iOS and Android apps
- App store listings
- Mobile-specific features

---

## 🎯 SUCCESS METRICS (KPIs)

### **User Engagement**
- Number of screenings completed per month
- Completion rate (started vs finished)
- Return user rate (30-day, 90-day)
- Average time to complete screening
- Chat engagement rate (% of users who chat after screening)

### **Clinical Impact**
- Crisis detection rate
- Crisis hotline click-through rate
- Professional resource booking rate
- User-reported outcomes (follow-up surveys)
- Reduction in screening scores over time (for returning users)

### **System Performance**
- Page load times (< 2 seconds)
- Screening completion time (5-10 minutes target)
- Chat response time (< 3 seconds)
- System uptime (99.9% target)
- Error rates (< 0.1%)

### **Business Metrics**
- User acquisition cost
- User retention rate
- Professional partnership growth
- Platform sustainability metrics

---

## 🚀 DEPLOYMENT CHECKLIST

### **Pre-Launch**
- [ ] All user stories tested
- [ ] Security audit completed
- [ ] Privacy policy finalized
- [ ] Terms of service drafted
- [ ] Crisis protocol tested
- [ ] Professional resources verified
- [ ] Load testing completed
- [ ] Backup systems in place
- [ ] Monitoring and alerting configured
- [ ] User documentation written

### **Launch**
- [ ] Soft launch with beta users
- [ ] Collect and address feedback
- [ ] Monitor error logs
- [ ] Track user behavior
- [ ] Fix critical bugs
- [ ] Full public launch

### **Post-Launch**
- [ ] User onboarding optimization
- [ ] Content updates based on feedback
- [ ] Professional outreach
- [ ] Marketing campaigns
- [ ] Continuous improvement

---

## 📝 TECHNICAL SPECIFICATIONS SUMMARY

### **Current Architecture (Prototype)**
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** FastAPI (Python 3.9+) + MySQL 8.0
- **AI Engine:** FastAPI + OpenAI GPT-4o-mini + LangGraph
- **Hosting:** Local development (production TBD)

### **Production Architecture Recommendations**
- **Frontend:** Same (React + Vite) → Deploy on Vercel/Netlify
- **Backend:** Same (FastAPI) → Deploy on AWS/GCP/Azure (containerized)
- **AI Engine:** Same (FastAPI + OpenAI) → Separate service (scalable)
- **Database:** MySQL 8.0 → AWS RDS or Azure Database for MySQL (managed)
- **File Storage:** AWS S3 or Azure Blob (for PDFs, attachments)
- **CDN:** CloudFlare or AWS CloudFront
- **Monitoring:** Sentry, DataDog, or New Relic
- **CI/CD:** GitHub Actions or GitLab CI

### **Estimated Costs (Monthly)**
- **Hosting:** $200-500 (depending on traffic)
- **Database:** $50-200 (managed service)
- **OpenAI API:** $100-500 (depends on chat volume)
- **Monitoring/Tools:** $50-100
- **Total:** ~$400-1,300/month (scales with users)

---

## 👥 TEAM REQUIREMENTS

### **Development Team**
- **Full-Stack Developer (2):** Frontend + Backend development
- **AI/ML Engineer (1):** AI agent optimization, prompt engineering
- **DevOps Engineer (1):** Infrastructure, deployment, monitoring
- **QA Engineer (1):** Testing, quality assurance

### **Product Team**
- **Product Manager (1):** Roadmap, priorities, stakeholder management
- **UX/UI Designer (1):** User experience, interface design
- **Content Writer (1):** Educational content, help documentation

### **Clinical Team (Consultants)**
- **Clinical Psychologist:** Validate screening instruments
- **Substance Use Counselor:** Review ASSIST implementation
- **Crisis Specialist:** Crisis protocol design

### **Operations**
- **Customer Support (2):** User inquiries, technical support
- **Community Manager (1):** User engagement, feedback collection

---

## 📞 STAKEHOLDER CONTACT

**For Questions or Clarifications:**
- **Technical Lead:** [Developer Name]
- **Project Manager:** [PM Name]
- **ISSUP Lead:** [Organization Contact]

---

## 📄 APPENDICES

### **Appendix A: Validated Instruments Used**
1. **WHO ASSIST V3.0** - Substance use screening
2. **PHQ-9** - Depression screening
3. **External and Internal Triggers** - Relapse risk assessment

### **Appendix B: Nigerian States Supported**
All 37 Nigerian states included (Abia, Adamawa, Akwa Ibom, Anambra, Bauchi, Bayelsa, Benue, Borno, Cross River, Delta, Ebonyi, Edo, Ekiti, Enugu, Gombe, Imo, Jigawa, Kaduna, Kano, Katsina, Kebbi, Kogi, Kwara, Lagos, Nasarawa, Niger, Ogun, Ondo, Osun, Oyo, Plateau, Rivers, Sokoto, Taraba, Yobe, Zamfara, FCT Abuja)

### **Appendix C: Crisis Resources**
- Mental Health Foundation Nigeria: +234-809-210-6493 (24/7)
- SURPIN: +234-810-461-5470
- Primary Crisis Line: +234 704 652 6917 (Call/WhatsApp)
- WhatsApp Support: +234 812 937 8557
- National Emergency: 112

---

**Document Control:**
- **Version:** 1.0
- **Last Updated:** January 15, 2026
- **Next Review:** After prototype demonstration
- **Status:** Ready for production planning