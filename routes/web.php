<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Front\HomeController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\GoogleCalendarController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('home', [HomeController::class, 'home'])->name('home');

// Route to redirect to Google's OAuth page
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');

// Route to handle the callback from Google
Route::get('/login/google/callback', [GoogleAuthController::class, 'handleCallback'])->name('auth.google.callback');

Route::get('/auth/calendar/redirect', [GoogleCalendarController::class, 'redirectToGoogle'])->name('auth.calendar.redirect');
// Route::get('/login/google/calendar/callback', [GoogleCalendarController::class, 'handleGoogleCalendarCallback'])->name('auth.calendar.callback');

Route::post('events', [GoogleCalendarController::class, 'storeEvent'])->name('events.store');
Route::get('/events', [GoogleCalendarController::class, 'showEvents'])->name('events.show');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware('auth')->name('dashboard');

Route::get('/recommendations', [HomeController::class, 'recommendation'])->middleware('auth')->name('recommendations');
Route::get('/chatLogs/{id}', [HomeController::class, 'akiChatLogs'])->name('akiChatLogs');

