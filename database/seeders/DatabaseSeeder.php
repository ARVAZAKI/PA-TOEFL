<?php

namespace Database\Seeders;

use Database\Seeders\DummyQuestionsSeeder;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@toefl.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Create Student User untuk testing
        User::updateOrCreate(
            ['email' => 'student@toefl.com'],
            [
                'name' => 'Student Demo',
                'password' => Hash::make('password'),
                'role' => 'student',
                'email_verified_at' => now(),
            ]
        );

        // Create Subtests (4 sections TOEFL)
        $subtests = [
            ['name' => 'Reading', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Listening', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Speaking', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Writing', 'created_at' => now(), 'updated_at' => now()],
        ];
        foreach ($subtests as $subtest) {
            DB::table('subtests')->updateOrInsert(
                ['name' => $subtest['name']],
                $subtest,
            );
        }

        // Create Sample TOEFL Test
        DB::table('toefls')->updateOrInsert(
            ['name' => 'TOEFL Practice Test 1'],
            [
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Link all subtests to TOEFL test
        $toeflId = DB::table('toefls')->where('name', 'TOEFL Practice Test 1')->value('id');
        $allSubtests = DB::table('subtests')->get();
        
        foreach ($allSubtests as $subtest) {
            DB::table('toefl_subtests')->updateOrInsert(
                [
                    'toefl_id' => $toeflId,
                    'subtest_id' => $subtest->id,
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $this->call(DummyQuestionsSeeder::class);
    }
}

