<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
Route::get('/test', function () {
    return Inertia::render('test-unit');
})->name('test');
Route::get('/question', function () {
    return Inertia::render('test-question');
})->name('question');
Route::get('/scoreboard', function () {
    return Inertia::render('scoreboard');
})->name('scoreboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
