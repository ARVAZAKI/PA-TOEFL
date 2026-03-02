# Database Structure Documentation - TOEFL System

## 📊 Overview

Sistem TOEFL ini memiliki database yang lengkap untuk mengelola:
- ✅ Manajemen User (Admin & Student)
- ✅ CRUD Soal TOEFL (Reading, Listening, Speaking, Writing)
- ✅ Test Sessions & Progress Tracking
- ✅ User Answers & Scoring System
- ✅ Admin Monitoring Dashboard

---

## 🗃️ Database Tables Structure

### **1. USERS & AUTHENTICATION**

#### `users`
```
id                  - Primary key
name                - Nama lengkap user
email               - Email (unique)
password            - Hashed password
role                - enum: 'admin' | 'student'
email_verified_at   - Timestamp verifikasi email
remember_token
timestamps
```

**Roles:**
- **Admin**: Dapat CRUD soal, monitor hasil test semua user
- **Student**: Dapat mengerjakan test dan melihat hasil sendiri

---

### **2. TOEFL TEST STRUCTURE**

#### `toefls`
```
id          - Primary key
name        - Nama test (e.g., "TOEFL Practice Test 1")
status      - enum: 'active' | 'inactive' | 'draft'
timestamps
```

#### `subtests`
```
id          - Primary key
name        - Nama section (Reading/Listening/Speaking/Writing)
timestamps
```

#### `toefl_subtests` (Pivot Table)
```
id          - Primary key
toefl_id    - Foreign key to toefls
subtest_id  - Foreign key to subtests
timestamps
```

**Relationship:** Many-to-Many (1 TOEFL test bisa punya banyak subtests)

---

### **3. QUESTION CONTENT**

#### `passages`
```
id          - Primary key
subtest_id  - Foreign key to subtests
title       - Judul passage
content     - Isi passage (text) atau URL (audio/video)
type        - enum: 'reading' | 'listening' | 'speaking' | 'writing'
order       - Urutan passage
timestamps
```

**Purpose:** 
- Reading: Text passage yang panjang
- Listening: URL audio file
- Speaking/Writing: Context atau reading material untuk integrated tasks

#### `questions`
```
id                  - Primary key
passage_id          - Foreign key to passages (nullable)
subtest_id          - Foreign key to subtests
question_text       - Teks pertanyaan
question_type       - enum: 'multiple_choice' | 'essay' | 'speaking'
preparation_time    - Waktu persiapan (detik) - untuk speaking
response_time       - Waktu menjawab (detik) - untuk speaking/writing
order               - Urutan soal
points              - Bobot nilai (default: 1)
timestamps
```

#### `question_choices`
```
id              - Primary key
question_id     - Foreign key to questions
choice_text     - Teks pilihan jawaban
choice_label    - Label (A/B/C/D)
is_correct      - Boolean (jawaban benar)
timestamps
```

**Note:** Hanya untuk question_type = 'multiple_choice'

---

### **4. USER TEST SESSIONS & TRACKING**

#### `user_test_sessions`
```
id              - Primary key
user_id         - Foreign key to users (nullable)
guest_name      - Nama guest (jika tidak login)
toefl_id        - Foreign key to toefls
started_at      - Timestamp mulai test
completed_at    - Timestamp selesai test (nullable)
status          - enum: 'in_progress' | 'completed' | 'abandoned'
total_score     - Total score (0-120)
timestamps
```

**Purpose:** Track setiap test session user

#### `user_subtest_progress`
```
id                      - Primary key
user_test_session_id    - Foreign key to user_test_sessions
subtest_id              - Foreign key to subtests
started_at              - Timestamp mulai section
completed_at            - Timestamp selesai section (nullable)
score                   - Score section (0-30)
status                  - enum: 'not_started' | 'in_progress' | 'completed'
timestamps
```

**Purpose:** Track progress per section (Reading, Listening, Speaking, Writing)

#### `user_answers`
```
id                          - Primary key
user_subtest_progress_id    - Foreign key to user_subtest_progress
question_id                 - Foreign key to questions
answer_text                 - Jawaban pilihan ganda (A/B/C/D)
answer_content              - Jawaban essay/speaking (text atau audio URL)
is_correct                  - Boolean (benar/salah) - nullable
is_flagged                  - Boolean (soal di-flag user)
time_spent_seconds          - Waktu mengerjakan soal (detik)
timestamps
```

**Note:** 
- Multiple choice: `answer_text` berisi A/B/C/D, `is_correct` auto-calculated
- Essay/Speaking: `answer_content` berisi text/URL, `is_correct` null (perlu review manual)

---

## 🔗 Model Relationships

### User Model
```php
- hasMany: testSessions
- methods: isAdmin(), isStudent()
```

### Toefl Model
```php
- belongsToMany: subtests (through toefl_subtests)
- hasMany: userTestSessions
- methods: isActive()
```

### Subtest Model
```php
- belongsToMany: toefls (through toefl_subtests)
- hasMany: passages, questions, userSubtestProgress
```

### Passage Model
```php
- belongsTo: subtest
- hasMany: questions
```

### Question Model
```php
- belongsTo: passage (nullable), subtest
- hasMany: choices, userAnswers
- computed: correctAnswer
```

### QuestionChoice Model
```php
- belongsTo: question
```

### UserTestSession Model
```php
- belongsTo: user, toefl
- hasMany: subtestProgress
- methods: isCompleted(), calculateTotalScore()
```

### UserSubtestProgress Model
```php
- belongsTo: userTestSession, subtest
- hasMany: userAnswers
- methods: isCompleted(), calculateScore()
```

### UserAnswer Model
```php
- belongsTo: userSubtestProgress, question
- methods: checkAnswer()
```

---

## 🚀 Usage Examples

### **Admin: Create TOEFL Test with Questions**

```php
// 1. Create TOEFL Test
$toefl = Toefl::create([
    'name' => 'TOEFL Practice Test 2',
    'status' => 'active'
]);

// 2. Attach subtests
$readingSubtest = Subtest::where('name', 'Reading')->first();
$toefl->subtests()->attach($readingSubtest->id);

// 3. Create passage
$passage = Passage::create([
    'subtest_id' => $readingSubtest->id,
    'title' => 'The Impact of Technology',
    'content' => 'Long text passage here...',
    'type' => 'reading',
    'order' => 1
]);

// 4. Create question
$question = Question::create([
    'passage_id' => $passage->id,
    'subtest_id' => $readingSubtest->id,
    'question_text' => 'According to the passage, what is...',
    'question_type' => 'multiple_choice',
    'order' => 1,
    'points' => 1
]);

// 5. Create choices
QuestionChoice::create([
    'question_id' => $question->id,
    'choice_text' => 'Option A text',
    'choice_label' => 'A',
    'is_correct' => false
]);
QuestionChoice::create([
    'question_id' => $question->id,
    'choice_text' => 'Option B text',
    'choice_label' => 'B',
    'is_correct' => true  // Correct answer
]);
```

### **Student: Take Test & Submit Answers**

```php
// 1. Start test session
$session = UserTestSession::create([
    'user_id' => auth()->id(),
    'toefl_id' => $toefl->id,
    'started_at' => now(),
    'status' => 'in_progress'
]);

// 2. Start reading section
$progress = UserSubtestProgress::create([
    'user_test_session_id' => $session->id,
    'subtest_id' => $readingSubtest->id,
    'started_at' => now(),
    'status' => 'in_progress'
]);

// 3. Submit answer
$answer = UserAnswer::create([
    'user_subtest_progress_id' => $progress->id,
    'question_id' => $question->id,
    'answer_text' => 'B',  // User memilih B
    'time_spent_seconds' => 45
]);

// 4. Check answer automatically
$answer->checkAnswer(); // Will set is_correct = true

// 5. Complete section
$progress->update([
    'completed_at' => now(),
    'status' => 'completed'
]);
$progress->calculateScore(); // Calculate score (0-30)

// 6. Complete test
$session->update([
    'completed_at' => now(),
    'status' => 'completed'
]);
$session->calculateTotalScore(); // Sum all section scores (0-120)
```

### **Admin: Monitor Results**

```php
// Get all test sessions
$sessions = UserTestSession::with(['user', 'toefl', 'subtestProgress.subtest'])
    ->where('status', 'completed')
    ->latest()
    ->get();

// Get specific user's results
$userResults = UserTestSession::where('user_id', $userId)
    ->with(['subtestProgress' => function($q) {
        $q->with('userAnswers.question');
    }])
    ->get();

// Get statistics
$averageScore = UserTestSession::where('status', 'completed')->avg('total_score');
$totalTests = UserTestSession::count();
```

---

## 📝 Scoring System

### **Score Range:**
- **Per Section**: 0 - 30 points
- **Total Score**: 0 - 120 points (4 sections × 30)

### **Calculation:**
```php
// Per section (e.g., Reading)
$correctAnswers = $progress->userAnswers()->where('is_correct', true)->count();
$totalQuestions = $progress->userAnswers()->count();
$score = round(($correctAnswers / $totalQuestions) * 30);

// Total score
$totalScore = $session->subtestProgress()->sum('score');
```

### **Score Level:**
- **0-30**: Elementary
- **31-60**: Intermediate
- **61-90**: Advanced
- **91-120**: Expert

---

## 🔐 Seeded Data

Default accounts after running `php artisan db:seed`:

| Email | Password | Role |
|-------|----------|------|
| admin@toefl.com | password | admin |
| student@toefl.com | password | student |

Default subtests:
- Reading
- Listening
- Speaking
- Writing

Default TOEFL test:
- TOEFL Practice Test 1 (active)

---

## 🛠️ Next Steps

1. **Admin Dashboard**: Create pages for CRUD questions
2. **Question Bank**: Populate with real TOEFL questions
3. **API Endpoints**: Create controllers for frontend integration
4. **File Upload**: Add support for audio files (listening/speaking)
5. **Scoring**: Implement automated scoring for essay/speaking (AI integration)
6. **Reports**: Create detailed reports and analytics

---

## 📞 Model Methods Reference

### UserTestSession
- `isCompleted()`: Check if test completed
- `calculateTotalScore()`: Sum all section scores

### UserSubtestProgress
- `isCompleted()`: Check if section completed
- `calculateScore()`: Calculate score for this section

### UserAnswer
- `checkAnswer()`: Auto-check multiple choice answers

### User
- `isAdmin()`: Check if user is admin
- `isStudent()`: Check if user is student

### Toefl
- `isActive()`: Check if test is active

---

**Last Updated:** March 2, 2026
**Database Version:** 1.0.0
