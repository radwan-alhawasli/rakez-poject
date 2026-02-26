# منح السيلز صلاحية عرض متتبع المشروع (Backend)

الواجهة الأمامية تستدعي هذه الـ APIs عند دخول **مستخدم المبيعات** أو **قائد المبيعات** لصفحة متتبع المشروع (`/project-tracker/:id`). إذا كان الباكند يرد **403 Forbidden**، يجب منح دور `sales` و `sales_leader` صلاحية **عرض فقط** (GET) لهذه المسارات.

---

## الـ endpoints المطلوب السماح بها للسيلز (قراءة فقط)

| Method | المسار | الغرض |
|--------|--------|--------|
| GET | `/api/contracts/show/{id}` | تفاصيل العقد + الوحدات + تقدم المشروع |
| GET | `/api/second-party-data/show/{id}` | بيانات الطرف الثاني (روابط وتواريخ المراحل) |
| GET | `/api/photography-department/show/{id}` | بيانات التصوير (عرض فقط) |

---

## تنفيذ في Laravel

### 1) إذا كنت تستخدم Middleware بالصلاحيات (مثلاً `PermissionMiddleware` أو `role:admin,project_management`)

عدّل الـ middleware أو الـ route بحيث يسمح لأدوار **sales** و **sales_leader** بطلب **GET** فقط لهذه المسارات.

**مثال في `routes/api.php`:**

```php
// قبل: قد يكون المسار محصوراً بأدوار معينة
Route::middleware(['auth:sanctum', 'role:admin,project_management,editor'])->group(function () {
    Route::get('/contracts/show/{id}', [ContractController::class, 'show']);
});
Route::get('/second-party-data/show/{id}', ...);
Route::get('/photography-department/show/{id}', ...);

// بعد: إضافة sales و sales_leader للعرض فقط
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/contracts/show/{id}', [ContractController::class, 'show'])
        ->middleware('role_or_permission:admin|project_management|editor|sales|sales_leader');
    Route::get('/second-party-data/show/{id}', [SecondPartyDataController::class, 'show'])
        ->middleware('role_or_permission:admin|project_management|editor|sales|sales_leader');
    Route::get('/photography-department/show/{id}', [PhotographyDepartmentController::class, 'show'])
        ->middleware('role_or_permission:admin|project_management|editor|sales|sales_leader');
});
```

(استبدل `role_or_permission` باسم الـ middleware الفعلي في مشروعك إن كان مختلفاً.)

### 2) إذا كان الفحص داخل الـ Controller

في الـ Controller المسؤول عن كل endpoint، أضف السماح لـ sales و sales_leader عند طلب GET (عرض فقط)، مع منعهم من POST/PUT/DELETE إن لزم:

```php
// مثال في ContractController::show
public function show($id)
{
    $user = auth()->user();
    $allowedRoles = ['admin', 'project_management', 'editor', 'sales', 'sales_leader'];
    if (!in_array($user->role, $allowedRoles)) {
        abort(403, 'Unauthorized');
    }
    // ... باقي المنطق
}
```

كرر نفس الفكرة في:
- الـ Controller الذي يخدم `GET second-party-data/show/{id}`
- الـ Controller الذي يخدم `GET photography-department/show/{id}`

### 3) إذا كنت تستخدم Spatie Permission

تأكد أن الأدوار `sales` و `sales_leader` لديها صلاحية تسمح بالوصول لهذه المسارات (مثلاً صلاحية مثل `contracts.view` أو `second_party.view` أو `departments.photography.view`)، ثم في الـ middleware أو الـ Policy اربط الـ GET لهذه المسارات بتلك الصلاحيات للأدوار المذكورة.

---

## ملخص

- **المشكلة:** 403 على `contracts/show`, `second-party-data/show`, `photography-department/show` عند دخول السيلز لمتتبع المشروع.
- **الحل:** في الباكند (Laravel)، منح دور **sales** ودور **sales_leader** صلاحية **عرض (GET)** لهذه الـ endpoints دون منحهم تعديل أو حذف إن كان مفصولاً عندك.

بعد تطبيق التعديلات على الباكند، إعادة تحميل صفحة متتبع المشروع بمستخدم سيلز يجب أن تعمل بدون 403.
