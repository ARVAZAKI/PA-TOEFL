<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE user_subtest_progress ALTER COLUMN score TYPE NUMERIC(5,2) USING score::numeric');
            DB::statement('ALTER TABLE user_test_sessions ALTER COLUMN total_score TYPE NUMERIC(6,2) USING total_score::numeric');
            return;
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE user_subtest_progress MODIFY score DECIMAL(5,2) NOT NULL DEFAULT 0');
            DB::statement('ALTER TABLE user_test_sessions MODIFY total_score DECIMAL(6,2) NOT NULL DEFAULT 0');
            return;
        }

        if ($driver === 'sqlite') {
            DB::statement('ALTER TABLE user_subtest_progress RENAME TO user_subtest_progress_old');
            DB::statement('CREATE TABLE user_subtest_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_test_session_id INTEGER NOT NULL,
                subtest_id INTEGER NOT NULL,
                started_at DATETIME NULL,
                completed_at DATETIME NULL,
                score NUMERIC NOT NULL DEFAULT 0,
                status VARCHAR NOT NULL DEFAULT "in_progress",
                created_at DATETIME NULL,
                updated_at DATETIME NULL,
                FOREIGN KEY(user_test_session_id) REFERENCES user_test_sessions(id) ON DELETE CASCADE,
                FOREIGN KEY(subtest_id) REFERENCES subtests(id) ON DELETE CASCADE
            )');
            DB::statement('INSERT INTO user_subtest_progress (id, user_test_session_id, subtest_id, started_at, completed_at, score, status, created_at, updated_at)
                SELECT id, user_test_session_id, subtest_id, started_at, completed_at, score, status, created_at, updated_at
                FROM user_subtest_progress_old');
            DB::statement('DROP TABLE user_subtest_progress_old');

            DB::statement('ALTER TABLE user_test_sessions RENAME TO user_test_sessions_old');
            DB::statement('CREATE TABLE user_test_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NULL,
                guest_name VARCHAR NULL,
                toefl_id INTEGER NOT NULL,
                started_at DATETIME NULL,
                completed_at DATETIME NULL,
                status VARCHAR NOT NULL DEFAULT "in_progress",
                total_score NUMERIC NOT NULL DEFAULT 0,
                created_at DATETIME NULL,
                updated_at DATETIME NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(toefl_id) REFERENCES toefls(id) ON DELETE CASCADE
            )');
            DB::statement('INSERT INTO user_test_sessions (id, user_id, guest_name, toefl_id, started_at, completed_at, status, total_score, created_at, updated_at)
                SELECT id, user_id, guest_name, toefl_id, started_at, completed_at, status, total_score, created_at, updated_at
                FROM user_test_sessions_old');
            DB::statement('DROP TABLE user_test_sessions_old');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE user_subtest_progress ALTER COLUMN score TYPE INTEGER USING ROUND(score)');
            DB::statement('ALTER TABLE user_test_sessions ALTER COLUMN total_score TYPE INTEGER USING ROUND(total_score)');
            return;
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE user_subtest_progress MODIFY score INTEGER NOT NULL DEFAULT 0');
            DB::statement('ALTER TABLE user_test_sessions MODIFY total_score INTEGER NOT NULL DEFAULT 0');
        }
    }
};
