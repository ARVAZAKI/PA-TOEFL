<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TestUnitController;
use App\Http\Controllers\Admin\AdminController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Test routes - require authentication
Route::middleware(['auth'])->group(function () {
    Route::get('/test/{section?}', [TestUnitController::class, 'subtestShow'])->name('test.show');
    Route::post('/submit-test', [TestUnitController::class, 'submitTest'])->name('submit-test');
    Route::post('/reset-test', [TestUnitController::class, 'resetTest'])->name('reset-test');
    Route::get('/scoreboard', [TestUnitController::class, 'scoreboard'])->name('scoreboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/toefls', [AdminController::class, 'toefls'])->name('toefls');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::get('/results', [AdminController::class, 'results'])->name('results');
    
    // Question Management Routes
    Route::get('/questions/{section}', [\App\Http\Controllers\Admin\QuestionController::class, 'index'])
        ->where('section', 'reading|listening|speaking|writing')
        ->name('questions');
    
    // Passage CRUD
    Route::post('/passages', [\App\Http\Controllers\Admin\QuestionController::class, 'storePassage'])->name('passages.store');
    Route::put('/passages/{id}', [\App\Http\Controllers\Admin\QuestionController::class, 'updatePassage'])->name('passages.update');
    Route::delete('/passages/{id}', [\App\Http\Controllers\Admin\QuestionController::class, 'deletePassage'])->name('passages.delete');
    
    // Question CRUD
    Route::post('/questions', [\App\Http\Controllers\Admin\QuestionController::class, 'storeQuestion'])->name('questions.store');
    Route::put('/questions/{id}', [\App\Http\Controllers\Admin\QuestionController::class, 'updateQuestion'])->name('questions.update');
    Route::delete('/questions/{id}', [\App\Http\Controllers\Admin\QuestionController::class, 'deleteQuestion'])->name('questions.delete');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
