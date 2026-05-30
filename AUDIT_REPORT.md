# Lao Lottery Pro — Full Production Audit Report
**Date:** 2026-05-30  
**Auditor Role:** Senior Full Stack Architect / Security Engineer / DBA  
**Stack:** React 19 + Vite 8 + PHP 8 + MySQL 8 + Tailwind CSS 4  

---

## Executive Summary

ລະບົບ Lao Lottery Pro ມີໂຄງສ້າງທີ່ດີ (Lazy Loading, Prepared Statements, JWT Auth, OTP Registration) ແຕ່ຍັງມີ **ບັນຫາ Critical ດ້ານ Security 4 ຂໍ້** ທີ່ຕ້ອງແກ້ທັນທີກ່ອນ Deploy Production. ລາຍລະອຽດດ້ານລຸ່ມ.

---

## Issue Registry

| ID | Severity | Category | Title |
|----|----------|----------|-------|
| S-01 | 🔴 CRITICAL | Security | Hardcoded credentials in config.php |
| S-02 | 🔴 CRITICAL | Security | OTP stored as plaintext in database |
| S-03 | 🔴 CRITICAL | Security | Reset/Verify tokens stored as plaintext |
| S-04 | 🔴 CRITICAL | Security | File upload MIME not validated, dir 0777 |
| S-05 | 🟠 HIGH | Security | JWT stored in localStorage (XSS exposure) |
| S-06 | 🟠 HIGH | Security | No Refresh Token — 24h expiry, no revocation |
| S-07 | 🟠 HIGH | Security | Exception message exposed in production responses |
| S-08 | 🟠 HIGH | Security | SMTP SSL peer verification disabled |
| S-09 | 🟠 HIGH | Security | Missing security HTTP headers (CSP, HSTS, etc.) |
| S-10 | 🟠 HIGH | Security | No CSRF protection on state-changing endpoints |
| D-01 | 🟠 HIGH | Database | Missing UNIQUE constraint on email & phone |
| D-02 | 🟠 HIGH | Database | No soft-delete — users permanently removable |
| D-03 | 🟡 MEDIUM | Database | visitor_stats / user_logs — no archiving strategy |
| D-04 | 🟡 MEDIUM | Database | draw_date column has no CHECK constraint |
| D-05 | 🟡 MEDIUM | Database | youtube_url — no URL format validation at DB level |
| D-06 | 🟡 MEDIUM | Database | Missing composite index for rate-limit query |
| B-01 | 🟠 HIGH | Backend | full_result only checks length (not digits-only) |
| B-02 | 🟠 HIGH | Backend | draw_date not validated as valid Y-m-d |
| B-03 | 🟠 HIGH | Backend | youtube_url not URL-validated before DB insert |
| B-04 | 🟡 MEDIUM | Backend | real_escape_string used alongside prepared statements |
| B-05 | 🟡 MEDIUM | Backend | Rate limiting reads from user_logs — slow under load |
| B-06 | 🟡 MEDIUM | Backend | check_availability allows user enumeration |
| B-07 | 🟡 MEDIUM | Backend | No Refresh Token / Token rotation endpoint |
| B-08 | 🟡 MEDIUM | Backend | Password min-length in create_user is 6 (inconsistent) |
| B-09 | 🔵 LOW | Backend | DB connection not closed explicitly |
| F-01 | 🟠 HIGH | Frontend | JWT in localStorage exposes to XSS |
| F-02 | 🟡 MEDIUM | Frontend | No React Error Boundary |
| F-03 | 🟡 MEDIUM | Frontend | DataContext loads 600 draws upfront — no virtual scroll |
| F-04 | 🟡 MEDIUM | Frontend | No PWA support (no manifest, no service worker) |
| F-05 | 🟡 MEDIUM | Frontend | No skeleton/placeholder for animal images |
| F-06 | 🟡 MEDIUM | Frontend | useStatistics runs heavy useMemo on every render |
| F-07 | 🔵 LOW | Frontend | Missing aria-label on icon-only buttons |
| F-08 | 🔵 LOW | Frontend | No 404/fallback for broken animal images |

---

## Detailed Findings & Fixed Code

---

### S-01 🔴 CRITICAL — Hardcoded Credentials in config.php

**File:** `api/config.php`

**Problem:**
```php
// ❌ Production DB password, SMTP password, JWT secret — all in source code
define('DB_PASS',    '@DKvon0328117');
define('SMTP_PASS',  '@DKvon0328117');
define('JWT_SECRET', '4f075fc0dc9480ff4d6f70a8facb5b586f9deb0f6f95a89dfdfef64a81274ae7');
```
ຖ້າ git repository ຖືກ push ຂຶ້ນ GitHub/GitLab ຫຼື ຖ້າ config.php ຖືກ serve as text, credentials ຈະຮົ່ວທັນທີ.

**Fix:** ໃຊ້ environment variables ຜ່ານ `api/.env` file ທີ່ຢູ່ນອກ web root ຫຼື protected ດ້ວຍ `.htaccess`.

**Fixed Code:** ເບິ່ງ `api/config.php` ທີ່ໄດ້ແກ້ໄຂແລ້ວ (ສ້າງ `api/env.php` ໃໝ່).

---

### S-02 🔴 CRITICAL — OTP Stored as Plaintext

**File:** `api/auth.php`

**Problem:**
```php
// ❌ OTP ເກັບ plaintext ໃນ DB
$stmt->bind_param("isss", $userId, $otp, $purpose, $otpExpiry);
// Column: otp_code VARCHAR(10) — ເຫັນໄດ້ດ້ວຍ SELECT ທຳມະດາ

// ❌ ກວດສອບ OTP ແບບ plaintext comparison
if ($row['otp_code'] !== $otpCode) { ... }
```

**Risk:** ຖ້າ DB ຖືກ breach, attacker ສາມາດ hijack accounts ທັງໝົດທີ່ pending verification ໄດ້.

**Fix:** Hash OTP ດ້ວຍ SHA-256 ກ່ອນເກັບ, compare hash ເວລາ verify.
```php
// ✅ Store hash
$otpHash = hash('sha256', $otp);
$stmt->bind_param("isss", $userId, $otpHash, $purpose, $otpExpiry);

// ✅ Verify hash
$inputHash = hash('sha256', $otpCode);
if (!hash_equals($row['otp_code_hash'], $inputHash)) { ... }
```

**Schema Change Required:**
```sql
ALTER TABLE otp_codes CHANGE otp_code otp_code_hash VARCHAR(64) NOT NULL;
```

---

### S-03 🔴 CRITICAL — Reset & Verification Tokens Stored as Plaintext

**File:** `api/auth.php`

**Problem:**
```php
// ❌ Token plaintext ໃນ DB + ໃນ Email URL
$resetToken = generateSecureToken(); // bin2hex(random_bytes(32)) = 64-char hex
$stmt->bind_param("iss", $userRes['user_id'], $resetToken, $expiry);
// ❌ token = plaintext 64-char hex ໃນ password_resets table

// ❌ Lookup by plaintext token
$stmt->bind_param("s", $token);
```

**Risk:** ຖ້າ DB ຖືກ READ-only breach (e.g., SQL injection elsewhere), attacker ສາມາດ reset password ຂອງ users ທຸກຄົນ.

**Fix:** ເກັບ `hash('sha256', $token)` ໃນ DB, ສົ່ງ raw token ໃນ email, hash ໃນເວລາ lookup.
```php
// ✅ Generate, hash for storage
$resetToken     = generateSecureToken();         // raw — sent in email
$resetTokenHash = hash('sha256', $resetToken);   // stored in DB
$stmt->bind_param("iss", $userId, $resetTokenHash, $expiry);

// ✅ Lookup by hash
$inputHash = hash('sha256', $token);
$stmt->bind_param("s", $inputHash);
```

**Schema Change Required:**
```sql
ALTER TABLE password_resets    CHANGE token token_hash VARCHAR(64) NOT NULL;
ALTER TABLE email_verifications CHANGE token token_hash VARCHAR(64) NOT NULL;
```

---

### S-04 🔴 CRITICAL — File Upload Security

**File:** `api/index.php`, `upload_animal_image` case

**Problem:**
```php
// ❌ Extension check only — can be bypassed with double extension (shell.php.jpg)
$ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($ext, $allowed)) { ... } // ✅ checks ext but NOT MIME

// ❌ Directory created with world-writable permissions
mkdir($uploadDir, 0777, true);

// ❌ No file size limit
// ❌ No check that finfo MIME matches extension
```

**Fix:**
```php
// ✅ Check actual MIME type
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($_FILES['image']['tmp_name']);
$allowedMimes = ['image/jpeg','image/png','image/gif','image/webp'];
if (!in_array($mimeType, $allowedMimes, true)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid file type (MIME check failed)"]);
    break;
}

// ✅ File size limit (2MB)
if ($_FILES['image']['size'] > 2 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["error" => "File too large (max 2MB)"]);
    break;
}

// ✅ Use mime2ext mapping instead of trusting original extension
$mimeToExt = ['image/jpeg'=>'jpg','image/png'=>'png','image/gif'=>'gif','image/webp'=>'webp'];
$ext       = $mimeToExt[$mimeType];

// ✅ Safe directory permissions
mkdir($uploadDir, 0755, true);

// ✅ Create .htaccess in uploads dir to block PHP execution
file_put_contents($uploadDir . '.htaccess', "php_flag engine off\nOptions -ExecCGI\n");
```

---

### S-05 🟠 HIGH — JWT in localStorage (XSS Exposure)

**File:** `src/context/AuthContext.jsx`

**Problem:**
```js
// ❌ JWT accessible to any JavaScript on the page
localStorage.setItem('lao_lottery_token', data.token);
```

ຖ້າມີ XSS vulnerability ໃດໜຶ່ງ (e.g., ຈາກ third-party library), token ຖືກ stolen ທັນທີ.

**Recommended Fix (Long-term):**
- ຍ້າຍ JWT ໄປ `HttpOnly` cookie (ຕ້ອງ backend changes)
- API ສ້າງ `Set-Cookie: jwt=...; HttpOnly; Secure; SameSite=Strict`
- Frontend ບໍ່ຕ້ອງ set/read token ຈາກ JS

**Interim Fix (ຊົ່ວຄາວ):**
- ໃຊ້ `sessionStorage` ແທນ `localStorage` (ຍັງ XSS-vulnerable ແຕ່ session-scoped)
- ເພີ່ມ CSP header ທີ່ strict ເພື່ອຈຳກັດ XSS risk

---

### S-06 🟠 HIGH — No Refresh Token / Token Revocation

**Problem:**
- JWT expires in `86400` (24 hours) — ຍາວເກີນໄປ
- No refresh token endpoint
- No token blacklist — logout ບໍ່ invalidate token ຢ່າງແທ້ຈິງ

**Fix:** ເບິ່ງ `migration_v2_security.sql` ສຳລັບ `refresh_tokens` table ແລະ `api/auth.php` ສຳລັບ endpoint ໃໝ່.

```php
// Token lifetime: 15 minutes access + 7 days refresh
'exp' => time() + 900,   // 15 minutes
```

---

### S-07 🟠 HIGH — Exception Messages in Production Responses

**File:** `api/index.php`

**Problem:**
```php
// ❌ Reveals internal DB structure, table names, query syntax to attacker
echo json_encode(["error" => "Database error: " . $e->getMessage()]);
```

**Fix:**
```php
// ✅ Log internally, return generic message
error_log('[draw_error] ' . $e->getMessage());
echo json_encode(["error" => PRODUCTION ? "ເກີດຂໍ້ຜິດພາດ ກະລຸນາລໍຖ້າ" : $e->getMessage()]);
```

---

### S-08 🟠 HIGH — SMTP SSL Peer Verification Disabled

**File:** `api/auth.php`

**Problem:**
```php
// ❌ Susceptible to Man-in-the-Middle attack on email delivery
'ssl' => [
    'verify_peer'       => false,
    'verify_peer_name'  => false,
    'allow_self_signed' => true,
],
```

**Fix:** ຖ້າ cPanel ໃຊ້ self-signed cert, upgrade to proper SSL cert ຫຼື ໃຊ້ Let's Encrypt. ຖ້ຈຳເປັນຕ້ອງ keep for now:
```php
// ✅ Only disable in non-production
'ssl' => PRODUCTION ? [] : [
    'verify_peer'       => false,
    'verify_peer_name'  => false,
    'allow_self_signed' => true,
],
```

---

### S-09 🟠 HIGH — Missing Security HTTP Headers

**File:** `api/.htaccess` (ບໍ່ຄົບ) + Frontend needs headers

**Required Headers:**
```apache
# api/.htaccess additions
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

# CSP — adjust as needed
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://laolots.com;"

# HSTS (only on HTTPS production)
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

---

### D-01 🟠 HIGH — Missing UNIQUE Constraints

**Problem:**
```sql
-- ❌ ບໍ່ມີ UNIQUE constraint — application checks only, DB allows duplicates
email        VARCHAR(100),   -- no UNIQUE
phone_number VARCHAR(20),    -- no UNIQUE
```

ຖ້າ application ມີ race condition ຫຼື bug, duplicate emails ສາມາດ insert ໄດ້.

**Fix:** ເບິ່ງ `migration_v2_security.sql`

---

### B-01 🟠 HIGH — full_result Validation (Digits Only)

**File:** `api/index.php`, `create_draw` + `update_draw`

**Problem:**
```php
// ❌ ກວດສະເພາະ length, ບໍ່ຮຽກຮ້ອງ digits only
if (!$draw_number || !$draw_date || strlen($full_result) !== 6) { ... }
// "AAAAAA" ຜ່ານ validation ໄດ້
```

**Fix:**
```php
// ✅ Regex: exactly 6 digits
if (!preg_match('/^\d{6}$/', $full_result)) {
    http_response_code(400);
    echo json_encode(["error" => "full_result ຕ້ອງເປັນຕົວເລກ 6 ໂຕເທົ່ານັ້ນ"]);
    break;
}
```

---

### B-02 🟠 HIGH — draw_date Not Validated

**Problem:**
```php
// ❌ ຮັບ string ໃດກໍໄດ້ — ບໍ່ validate Y-m-d format
$draw_date = isset($input['draw_date']) ? $conn->real_escape_string($input['draw_date']) : '';
```

**Fix:**
```php
// ✅ Validate date format
$dt = DateTime::createFromFormat('Y-m-d', $draw_date);
if (!$dt || $dt->format('Y-m-d') !== $draw_date) {
    http_response_code(400);
    echo json_encode(["error" => "draw_date ຮູບແບບຕ້ອງເປັນ YYYY-MM-DD"]);
    break;
}
```

---

### B-03 🟠 HIGH — youtube_url Not Validated

**Problem:**
```php
// ❌ ຮັບ URL ໃດກໍໄດ້ — ເກັບ javascript:alert(1) ໄດ້
$youtube_url = isset($input['youtube_url']) ? $conn->real_escape_string($input['youtube_url']) : null;
```

**Fix:**
```php
// ✅ Allow only http/https URLs
if ($youtube_url !== null) {
    if (!filter_var($youtube_url, FILTER_VALIDATE_URL) ||
        !preg_match('/^https?:\/\//i', $youtube_url)) {
        http_response_code(400);
        echo json_encode(["error" => "youtube_url ຕ້ອງເປັນ URL ທີ່ຖືກຕ້ອງ"]);
        break;
    }
}
```

---

### B-04 🟡 MEDIUM — real_escape_string with Prepared Statements

**Problem:**
```php
// ❌ Redundant and misleading — prepared stmt handles escaping already
$draw_date   = $conn->real_escape_string($input['draw_date']);
$full_result = $conn->real_escape_string($input['full_result']);
// Then: $stmt->bind_param("iissis", ..., $draw_date, $full_result, ...)
```

**Fix:** Remove `real_escape_string` — let prepared statement parameterization do its job.

---

### F-02 🟡 MEDIUM — No React Error Boundary

**Problem:** ຖ້າ component crash, ໜ້າທັງໝົດ blank (white screen).

**Fix:** ເບິ່ງ `src/components/ErrorBoundary.jsx` ທີ່ສ້າງໃໝ່.

---

### F-04 🟡 MEDIUM — No PWA Support

**Problem:** ບໍ່ມີ `manifest.json` ແລະ `service-worker.js` — ບໍ່ສາມາດ install ເປັນ app ໄດ້, ບໍ່ມີ offline support.

**Fix:** ເບິ່ງ `public/manifest.json` ແລະ Vite PWA config.

---

## Deliverables Checklist

| # | File | Status | Description |
|---|------|--------|-------------|
| 1 | `AUDIT_REPORT.md` | ✅ Done | This file |
| 2 | `migration_v2_security.sql` | ✅ Done | UNIQUE constraints, token hash columns, refresh_tokens |
| 3 | `migration_v3_features.sql` | ✅ Done | favorites, notifications, search_history, user_preferences |
| 4 | `api/env.php` | ✅ Done | Environment variable loader |
| 5 | `api/config.php` | ✅ Done | Uses env vars, no hardcoded credentials |
| 6 | `api/auth.php` | ✅ Done | OTP hashing, token hashing, refresh token |
| 7 | `api/index.php` | ✅ Done | Upload security, validation fixes, error masking |
| 8 | `uploads/animals/.htaccess` | ✅ Done | Block PHP execution in uploads |
| 9 | `src/components/ErrorBoundary.jsx` | ✅ Done | React error boundary |
| 10 | `src/features/favorites/` | ✅ Done | Favorite numbers feature |
| 11 | `src/features/notifications/` | ✅ Done | Notification system |
| 12 | `public/manifest.json` | ✅ Done | PWA manifest |
| 13 | `vite.config.js` | ✅ Done | PWA plugin config |

---

## 30/60/90 Day Roadmap

### Week 1–2 (Before ANY production push) — CRITICAL FIXES
- [ ] **S-01**: Move credentials to env file
- [ ] **S-02**: Hash OTP in DB (run migration + update auth.php)
- [ ] **S-03**: Hash tokens in DB (run migration + update auth.php)
- [ ] **S-04**: Fix file upload MIME validation + permissions
- [ ] **S-09**: Add security headers in .htaccess
- [ ] **D-01**: Add UNIQUE constraints via migration
- [ ] **B-01**: Validate full_result as digits
- [ ] **B-02**: Validate draw_date format
- [ ] **B-03**: Validate youtube_url

### Day 30 — High Priority
- [ ] **S-06**: Implement Refresh Token (new endpoint + table)
- [ ] **S-07**: Mask exception messages in production
- [ ] **S-08**: Fix SMTP SSL cert
- [ ] **S-10**: Add CSRF tokens for state-changing auth endpoints
- [ ] **F-02**: Add React Error Boundary
- [ ] **F-04**: Implement PWA (manifest + service worker)
- [ ] **B-08**: Standardize password policy across all create/update endpoints
- [ ] New Feature: Favorite Numbers (DB + API + UI)
- [ ] New Feature: Search History (DB + API + UI)

### Day 60 — Medium Priority
- [ ] **S-05**: Migrate JWT to HttpOnly cookies
- [ ] **F-03**: Implement virtual scrolling for large draw lists
- [ ] **D-03**: Add cron job to archive old visitor_stats / user_logs
- [ ] New Feature: Notification System (DB + API + UI)
- [ ] New Feature: User Preferences (dark mode persist, language)
- [ ] Analytics Dashboard enhancement (recharts trends)
- [ ] Real-Time polling (SSE or WebSocket for new draws)

### Day 90 — Production Hardening
- [ ] Load testing with k6 (target: 500 concurrent users)
- [ ] MySQL query profiling (`EXPLAIN ANALYZE` on slow queries)
- [ ] Implement Redis/APCu for rate limiting (replace user_logs scan)
- [ ] Add 2FA option (TOTP authenticator app)
- [ ] Full SEO audit (Core Web Vitals, sitemap, structured data)
- [ ] Implement PWA push notifications
- [ ] Public API v1 with API keys
- [ ] Automated backup strategy (mysqldump cron + S3)

---

## Developer TODO List (Prioritized)

### 🔴 Do This NOW (Before Production)
```
[ ] 1. Run migration_v2_security.sql on ALL environments
[ ] 2. Replace api/config.php with env-based version
[ ] 3. Create api/.env with real credentials (never commit this file)
[ ] 4. Add api/.env to .gitignore
[ ] 5. Update auth.php: hash OTP before storing (otp_code_hash)
[ ] 6. Update auth.php: hash reset/verify tokens before storing
[ ] 7. Update index.php: add MIME check to upload_animal_image
[ ] 8. Update index.php: fix directory mkdir to 0755
[ ] 9. Create uploads/animals/.htaccess to block PHP execution
[10] 10. Rotate JWT_SECRET (current one is committed in config.php)
[11] 11. Change DB password (current one is in config.php)
[12] 12. Change SMTP password (current one is in config.php)
```

### 🟠 Do This Week 1
```
[ ] 13. Add B-01: preg_match('/^\d{6}$/', $full_result) validation
[ ] 14. Add B-02: DateTime::createFromFormat() for draw_date
[ ] 15. Add B-03: filter_var URL validation for youtube_url
[ ] 16. Add S-07: mask $e->getMessage() in production
[ ] 17. Add security headers to api/.htaccess
[ ] 18. Add UNIQUE indexes (migration_v2_security.sql section 2)
[ ] 19. Deploy ErrorBoundary component in App.jsx
```

### 🟡 Do This Month 1
```
[ ] 20. Implement Refresh Token endpoint (api/auth.php)
[ ] 21. Implement Favorite Numbers feature (migration + API + React)
[ ] 22. Implement Search History feature
[ ] 23. Implement User Preferences (locale, notifications)
[ ] 24. Add PWA manifest.json and service worker
[ ] 25. Add virtual scrolling to HistoryPage (react-window or similar)
[ ] 26. Archive strategy for visitor_stats (DELETE WHERE visited_at < 90 days ago)
```

### 🔵 Do This Quarter
```
[ ] 27. Migrate JWT to HttpOnly cookie
[ ] 28. Implement Redis rate limiting
[ ] 29. Add 2FA (TOTP)
[ ] 30. Public API with API key management
[ ] 31. Automated DB backups
[ ] 32. PWA push notifications for new draw results
[ ] 33. Real-time result updates (SSE)
```
