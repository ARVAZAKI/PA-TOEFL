<?php

namespace Database\Seeders;

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
        User::create([
            'name' => 'Admin',
            'email' => 'admin@toefl.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create Student User untuk testing
        User::create([
            'name' => 'Student Demo',
            'email' => 'student@toefl.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'email_verified_at' => now(),
        ]);

        // Create Subtests (4 sections TOEFL)
        $subtests = [
            ['name' => 'Reading', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Listening', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Speaking', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Writing', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('subtests')->insert($subtests);

        // Create Sample TOEFL Test
        DB::table('toefls')->insert([
            'name' => 'TOEFL Practice Test 1',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Link all subtests to TOEFL test
        $toeflId = DB::table('toefls')->first()->id;
        $allSubtests = DB::table('subtests')->get();
        
        foreach ($allSubtests as $subtest) {
            DB::table('toefl_subtests')->insert([
                'toefl_id' => $toeflId,
                'subtest_id' => $subtest->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info('📧 Admin login: admin@toefl.com / password');
        $this->command->info('📧 Student login: student@toefl.com / password');
    }
}

