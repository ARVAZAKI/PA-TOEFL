# Admin Panel Template - TOEFL System

Template admin panel yang reusable dengan sidebar dan navbar untuk semua halaman admin.

## 📁 Struktur File

```
resources/js/
├── layouts/
│   ├── admin-layout.tsx              # Main admin layout wrapper
│   └── admin/
│       └── admin-sidebar-layout.tsx  # Layout dengan sidebar
│
├── components/
│   └── admin/
│       ├── admin-sidebar.tsx         # Sidebar dengan menu admin
│       └── admin-header.tsx          # Header/navbar admin
│
└── pages/
    └── admin/
        ├── dashboard.tsx             # Admin dashboard
        ├── toefls.tsx               # Manage TOEFL tests
        ├── users.tsx                # Manage users
        └── results.tsx              # View test results
```

## 🎨 Fitur Template

### 1. **Admin Sidebar**
- Collapsible sidebar (bisa dikecilkan jadi icon)
- Menu terorganisir dengan groups:
  - **Main Menu**: Dashboard, TOEFL Tests
  - **Question Management**: Reading, Listening, Speaking, Writing
  - **Management**: Users, Test Results
- Footer dengan Settings, Help & User Profile

### 2. **Admin Header/Navbar**
- Breadcrumbs navigation
- Notification bell dengan badge
- Theme switcher (dark/light mode)
- User dropdown menu dengan avatar

### 3. **Responsive Design**
- Mobile-friendly
- Sidebar auto-collapse di mobile
- Grid layout yang responsif

## 🚀 Cara Menggunakan

### Membuat Halaman Admin Baru

```tsx
// resources/js/pages/admin/your-page.tsx

import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function YourAdminPage() {
    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'Your Page', href: '/admin/your-page' },
            ]}
        >
            <Head title="Your Page Title" />

            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold">Your Page</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Your content here */}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
```

### Menambah Menu Sidebar

Edit file: `resources/js/components/admin/admin-sidebar.tsx`

```tsx
const mainNavGroups: NavGroup[] = [
    {
        title: 'Your Group',
        items: [
            {
                title: 'Your Menu',
                url: '/admin/your-route',
                icon: YourIcon, // Import dari lucide-react
            },
        ],
    },
];
```

### Membuat Route Backend

Edit file: `routes/web.php`

```php
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/your-route', [YourController::class, 'index'])->name('your-route');
});
```

### Membuat Controller

```php
// app/Http/Controllers/Admin/YourController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class YourController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/your-page', [
            'data' => YourModel::all(),
        ]);
    }
}
```

## 🎯 Menu Admin Tersedia

### **Dashboard** (`/admin/dashboard`)
- Statistics cards
- Question bank overview
- Recent test submissions
- Quick actions

### **TOEFL Tests** (`/admin/toefls`)
- List semua TOEFL tests
- Create, Edit, Delete tests
- Activate/Deactivate tests
- View test details

### **Question Management**
- **Reading** (`/admin/questions/reading`)
- **Listening** (`/admin/questions/listening`)
- **Speaking** (`/admin/questions/speaking`)
- **Writing** (`/admin/questions/writing`)

### **Users** (`/admin/users`)
- Manage admin & student accounts
- View user statistics

### **Test Results** (`/admin/results`)
- View all test submissions
- Export reports
- Analytics

## 🔐 Authentication & Authorization

### Default Admin Account
```
Email: admin@toefl.com
Password: password
```

### Middleware Protection
Semua route admin dilindungi dengan middleware:
- `auth` - User harus login
- `verified` - Email harus verified
- `admin` - User harus role admin

### Check Role di Blade/Controller
```php
// Check if user is admin
if (auth()->user()->isAdmin()) {
    // Admin only code
}

// Check if user is student
if (auth()->user()->isStudent()) {
    // Student only code
}
```

## 🎨 Komponen UI Tersedia

Template menggunakan shadcn/ui components:

- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Button` (variants: default, outline, ghost, secondary)
- `Badge` (variants: default, secondary, outline)
- `DropdownMenu`
- `Sidebar`, `SidebarContent`, `SidebarHeader`, `SidebarFooter`
- `Dialog`, `AlertDialog`
- `Table`, `DataTable`
- Dan banyak lagi...

## 📊 Data Flow

```
Backend (Controller)
    ↓
Inertia::render('admin/page', ['data' => $data])
    ↓
Frontend (React Component)
    ↓
AdminLayout (wrapper)
    ↓
Your Page Content
```

## 🎨 Styling

Template menggunakan:
- **Tailwind CSS** - Utility classes
- **shadcn/ui** - Pre-built components
- **Lucide Icons** - Icon library

### Custom Colors
```tsx
// Gradient backgrounds
className="bg-gradient-to-br from-blue-500 to-indigo-600"

// Status colors
text-blue-600   // Info
text-green-600  // Success
text-orange-600 // Warning
text-red-600    // Error
```

## 📱 Responsive Breakpoints

```tsx
// Mobile first approach
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

// Hide on mobile
className="hidden md:block"

// Different spacing
className="p-4 md:p-6 lg:p-8"
```

## 🔄 Update Sidebar Active State

Sidebar akan otomatis highlight menu yang aktif berdasarkan URL.

Edit di `resources/js/components/nav-main.tsx` jika perlu custom logic.

## 📝 Best Practices

1. **Gunakan breadcrumbs** untuk navigasi yang jelas
2. **Consistent spacing** - gunakan `p-6` untuk page padding
3. **Card layout** - wrap content dalam Card component
4. **Responsive grid** - gunakan grid untuk layout
5. **Loading states** - tambahkan skeleton/spinner saat loading
6. **Error handling** - tampilkan pesan error yang user-friendly
7. **Confirmation dialogs** - untuk aksi delete/critical

## 🚧 Next Steps

1. **Question CRUD Pages** - Halaman untuk create/edit soal
2. **User Management** - Complete user management interface
3. **Analytics Dashboard** - Charts dan statistics
4. **File Upload** - Upload audio files untuk listening
5. **Reports Export** - Export hasil test ke PDF/Excel

---

**Created:** March 2, 2026  
**Version:** 1.0.0
