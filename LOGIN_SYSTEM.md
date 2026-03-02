# Login & Authentication System - TOEFL

## 🔐 Authentication Flow

### **1. Login Process**
```
User enters email & password
    ↓
AuthenticatedSessionController@store
    ↓
Check credentials
    ↓
Check user role
    ↓
Redirect based on role:
├── Admin → /admin/dashboard
└── Student → /dashboard
```

### **2. Registration Process**
```
User fills registration form
    ↓
RegisteredUserController@store
    ↓
Create user with role='student' (default)
    ↓
Auto login
    ↓
Redirect to /dashboard
```

### **3. Logout Process**
```
User clicks logout
    ↓
AuthenticatedSessionController@destroy
    ↓
Clear session
    ↓
Redirect to home (/)
```

---

## 👤 Demo Accounts

### Admin Account
```
Email: admin@toefl.com
Password: password
Role: admin
Redirect: /admin/dashboard
```

### Student Account
```
Email: student@toefl.com
Password: password
Role: student
Redirect: /dashboard
```

---

## 🛡️ Middleware Protection

### **1. IsAdmin Middleware**
```php
// Protect admin routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    // Only admin can access
});
```

**Location:** `app/Http/Middleware/IsAdmin.php`

**Logic:**
- Check if user is authenticated
- Check if user has admin role
- If not, return 403 Forbidden

### **2. RedirectIfAuthenticated Middleware**
```php
// Redirect logged-in users from login page
Route::middleware('guest')->group(function () {
    // Login, Register pages
});
```

**Location:** `app/Http/Middleware/RedirectIfAuthenticated.php`

**Logic:**
- Check if user is already authenticated
- If admin → redirect to `/admin/dashboard`
- If student → redirect to `/dashboard`

---

## 📁 Files Modified

### Backend
1. **AuthenticatedSessionController.php**
   - Added role-based redirect after login
   - Admin → `/admin/dashboard`
   - Student → `/dashboard`

2. **RegisteredUserController.php**
   - Set default role = 'student' on registration

3. **IsAdmin.php** (New)
   - Middleware to protect admin routes

4. **RedirectIfAuthenticated.php** (New)
   - Redirect authenticated users to correct dashboard

### Frontend
1. **login.tsx**
   - Enhanced UI with demo accounts display
   - Better error handling
   - Status message styling

2. **welcome.tsx**
   - Added Login/Register buttons in top-right
   - Shows "Go to Dashboard" if already logged in
   - Role-aware navigation

---

## 🚀 Usage Examples

### **Check User Role in Controller**
```php
use Illuminate\Support\Facades\Auth;

if (Auth::user()->isAdmin()) {
    // Admin only code
}

if (Auth::user()->isStudent()) {
    // Student only code
}
```

### **Check User Role in Blade/React**
```php
// In controller
return Inertia::render('page', [
    'isAdmin' => Auth::user()->isAdmin(),
]);
```

```tsx
// In React component
const { auth } = usePage<SharedData>().props;

if (auth.user?.role === 'admin') {
    // Show admin features
}
```

### **Protect Routes**
```php
// Admin only routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
});

// Authenticated users only
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

// Guests only (not logged in)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin']);
});
```

---

## 🎯 Login Page Features

✅ **Email & Password Fields**
- Auto-focus on email field
- Show/hide password
- Remember me checkbox

✅ **Forgot Password Link**
- Links to password reset flow

✅ **Demo Accounts Display**
- Shows admin & student credentials
- Easy copy-paste for testing

✅ **Status Messages**
- Success messages (e.g., "Verification email sent")
- Error messages for invalid credentials

✅ **Loading States**
- Spinner animation during login
- Disabled button to prevent double-submit

✅ **Responsive Design**
- Mobile-friendly layout
- Touch-friendly buttons

---

## 🔄 Redirect Flow

### After Login:
```
Login → Check Role
    ├── Admin → /admin/dashboard
    │   ├── Full admin panel access
    │   ├── CRUD questions
    │   ├── Manage users
    │   └── View all results
    │
    └── Student → /dashboard
        ├── Take tests
        ├── View own results
        └── Update profile
```

### After Registration:
```
Register → Auto-create as Student → Auto-login → /dashboard
```

### Access Admin Routes as Student:
```
Student tries to access /admin/* → 403 Forbidden
```

### Access Login When Already Logged In:
```
User visits /login
    ↓
Check if authenticated
    ↓
Yes → Redirect to dashboard (based on role)
No → Show login page
```

---

## 🛠️ Testing Login

### **1. Test Admin Login**
```bash
# Visit login page
http://localhost/login

# Enter credentials:
Email: admin@toefl.com
Password: password

# Should redirect to:
http://localhost/admin/dashboard
```

### **2. Test Student Login**
```bash
# Visit login page
http://localhost/login

# Enter credentials:
Email: student@toefl.com
Password: password

# Should redirect to:
http://localhost/dashboard
```

### **3. Test Registration**
```bash
# Visit register page
http://localhost/register

# Fill form with new user data
# Should auto-login and redirect to:
http://localhost/dashboard

# New user will have role='student'
```

### **4. Test Remember Me**
```bash
# Login with "Remember me" checked
# Close browser
# Open browser again
# Should still be logged in
```

---

## 🔒 Security Features

✅ **CSRF Protection**
- All forms protected with CSRF tokens

✅ **Password Hashing**
- Bcrypt hashing for passwords

✅ **Session Management**
- Session regeneration after login
- Session invalidation on logout

✅ **Email Verification**
- Optional email verification flow

✅ **Rate Limiting**
- Throttle login attempts

✅ **Remember Me Token**
- Secure persistent login

---

## 📊 User Roles

| Role | Access | Features |
|------|--------|----------|
| **Admin** | Full system access | CRUD questions, manage users, view all results, analytics |
| **Student** | Limited access | Take tests, view own results, update profile |

---

## 🎨 UI Components Used

- **Input** - Email & password fields
- **Button** - Submit button with loading state
- **Checkbox** - Remember me
- **Label** - Form labels
- **Alert** - Status messages
- **Card** - Demo accounts display

---

## 🚧 Future Enhancements

- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Password strength meter
- [ ] Account lockout after failed attempts
- [ ] Login history tracking
- [ ] IP-based restrictions
- [ ] OAuth2 API authentication

---

**Last Updated:** March 2, 2026  
**Version:** 1.0.0
