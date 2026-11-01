// ============================================================
// AUTH.JS — User Login, Signup with OTP & Google Sign-In
// ============================================================

const USER_KEY = 'mh_roadguard_user';
const USERS_DB_KEY = 'mh_roadguard_users';

let currentOTP = null;
let otpTimerInterval = null;
let pendingSignupData = null;

// ---- Get/Set User Session ----
function getCurrentUser() {
    const data = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

function setCurrentUser(user, remember = false) {
    const data = JSON.stringify(user);
    sessionStorage.setItem(USER_KEY, data);
    if (remember) localStorage.setItem(USER_KEY, data);
    updateNavAuth();
    if (typeof requestUserLocationAndFocusMap === 'function') {
        setTimeout(() => requestUserLocationAndFocusMap(), 350);
    }
}

function clearCurrentUser() {
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_KEY);
    updateNavAuth();
    if (typeof resetMapToMaharashtraView === 'function') {
        resetMapToMaharashtraView();
    }
    if (typeof resetAllLoginForms === 'function') {
        resetAllLoginForms();
    }
}

// ---- Reset All Login & Auth Forms on Logout ----
function resetAllLoginForms() {
    // 1. Reset all form elements
    const formIds = [
        'loginForm',
        'signupForm',
        'adminPageLoginForm',
        'adminModalLoginForm',
        'modalLoginForm',
        'modalSignupForm',
        'modalAdminForm'
    ];
    formIds.forEach(id => {
        const form = document.getElementById(id);
        if (form && typeof form.reset === 'function') {
            try { form.reset(); } catch (e) {}
        }
    });

    // 2. Explicitly blank out all input fields
    const inputIds = [
        'loginEmail', 'loginPassword', 'rememberMe',
        'signupName', 'signupEmail', 'signupPhone', 'signupPassword', 'signupConfirm',
        'adminPageUser', 'adminPagePassword',
        'modalLoginEmail', 'modalLoginPassword', 'modalRememberMe',
        'modalSignupName', 'modalSignupEmail', 'modalSignupPhone', 'modalSignupPassword', 'modalSignupConfirm',
        'modalAdminUser', 'modalAdminPass'
    ];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = false;
            } else {
                el.value = '';
            }
            el.classList.remove('is-invalid', 'error');
        }
    });

    // 3. Clear all OTP digits
    document.querySelectorAll('.otp-digit').forEach(el => {
        el.value = '';
    });

    // 4. Clear all error feedback messages
    const errorIds = [
        'authError', 'signupError', 'otpError', 'adminPageError',
        'modalAuthError', 'modalSignupError', 'modalOtpError', 'modalAdminError'
    ];
    errorIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '';
            el.classList.remove('show');
            el.style.display = 'none';
        }
    });

    // 5. Hide OTP verification panels
    const otpPanel = document.getElementById('otpPanel');
    if (otpPanel) otpPanel.classList.add('hidden');
    const modalOtpPanel = document.getElementById('modalOtpPanel');
    if (modalOtpPanel) modalOtpPanel.classList.add('hidden');

    // 6. Reset password strength meter
    const strengthMeter = document.getElementById('passwordStrength');
    if (strengthMeter) strengthMeter.innerHTML = '';

    // 7. Reset password visibility toggles back to masked (type="password")
    const passInputIds = [
        'loginPassword', 'signupPassword', 'signupConfirm', 'adminPagePassword',
        'modalLoginPassword', 'modalSignupPassword', 'modalSignupConfirm', 'modalAdminPass'
    ];
    passInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.type = 'password';
    });

    // 8. Clear any in-memory OTP signup state
    pendingSignupData = null;

    // 9. Reset auth tab back to default 'login' tab for both page and modal
    if (typeof switchAuthTab === 'function') {
        switchAuthTab('login');
    }
    if (typeof switchModalAuthTab === 'function') {
        switchModalAuthTab('login');
    }
}
window.resetAllLoginForms = resetAllLoginForms;

// ---- Local Users DB (demo) ----
const DEFAULT_REGISTERED_USERS = [
    {
        name: 'Pravin Kumar',
        email: 'pravin.pwd@gmail.com',
        phone: '9820011223',
        role: 'Citizen Reporter',
        registeredAt: '2026-02-14T10:30:00Z',
        provider: 'google',
        verified: true,
        district: 'Mumbai'
    },
    {
        name: 'Maharashtra Citizen',
        email: 'citizen.mh@gmail.com',
        phone: '9876543210',
        role: 'Verified Citizen',
        registeredAt: '2026-02-28T09:15:00Z',
        provider: 'email',
        verified: true,
        district: 'Pune'
    },
    {
        name: 'Rajesh Patil',
        email: 'rajesh.patil@yahoo.com',
        phone: '9822014455',
        role: 'Citizen User',
        registeredAt: '2026-03-05T14:20:00Z',
        provider: 'phone-otp',
        verified: true,
        district: 'Nashik'
    },
    {
        name: 'Priya Deshmukh',
        email: 'priya.deshmukh@gmail.com',
        phone: '9890123456',
        role: 'Citizen User',
        registeredAt: '2026-03-18T11:45:00Z',
        provider: 'google',
        verified: true,
        district: 'Nagpur'
    },
    {
        name: 'Amit Shinde',
        email: 'amit.shinde@rediffmail.com',
        phone: '9823456789',
        role: 'Citizen Reporter',
        registeredAt: '2026-03-27T16:10:00Z',
        provider: 'email',
        verified: true,
        district: 'Chhatrapati Sambhajinagar'
    },
    {
        name: 'Sunita Joshi',
        email: 'sunita.joshi@gmail.com',
        phone: '9822987654',
        role: 'PWD Ward Volunteer',
        registeredAt: '2026-04-08T08:30:00Z',
        provider: 'phone-otp',
        verified: true,
        district: 'Thane'
    }
];

function getUsersDB() {
    const data = localStorage.getItem(USERS_DB_KEY);
    if (!data) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_REGISTERED_USERS));
        return DEFAULT_REGISTERED_USERS;
    }
    try {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_REGISTERED_USERS));
            return DEFAULT_REGISTERED_USERS;
        }
        return parsed;
    } catch (e) {
        return DEFAULT_REGISTERED_USERS;
    }
}

function saveUsersDB(users) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

function findUser(email) {
    return getUsersDB().find(u => u.email.toLowerCase() === email.toLowerCase());
}

function registerUser(user) {
    const users = getUsersDB();
    if (findUser(user.email)) return false;
    // Ensure all fields needed for admin users table
    if (!user.registeredAt) user.registeredAt = new Date().toISOString();
    if (!user.role) user.role = 'Citizen Reporter';
    if (!user.verified) user.verified = true;
    if (!user.district) user.district = 'Maharashtra';
    if (!user.provider) user.provider = 'email';
    users.push(user);
    saveUsersDB(users);
    return true;
}

// ---- Update Navbar Auth State (Role-Based) ----
function updateNavAuth() {
    const admin = (typeof isAdminLoggedIn === 'function') && isAdminLoggedIn();
    const user = getCurrentUser();
    const loginBtn = document.getElementById('navAuth');
    const profileBtn = document.getElementById('navUserProfile');
    const autofillBanner = document.getElementById('googleAutofillBanner');
    const mobileUserLabel = document.getElementById('mobileNavUserLabel');

    // Navigation links
    const homeLink = document.querySelector('.nav-links a[data-page="home"]');
    const reportLink = document.querySelector('.nav-links a[data-page="report"]');
    const trackLink = document.querySelector('.nav-links a[data-page="track"]');
    const aboutLink = document.querySelector('.nav-links a[data-page="about"]');
    const dashLink = document.querySelector('.nav-links a[data-page="dashboard"]');

    const mobileHome = document.querySelector('.mobile-nav-item[data-page="home"]');
    const mobileReport = document.querySelector('.mobile-nav-item[data-page="report"]');
    const mobileTrack = document.querySelector('.mobile-nav-item[data-page="track"]');
    const mobileAbout = document.querySelector('.mobile-nav-item[data-page="about"]');
    const mobileDash = document.querySelector('.mobile-nav-item[data-page="dashboard"]');

    if (admin) {
        // === OFFICIAL ADMIN IS LOGGED IN ===
        // "whenever admin get log in remove options like(home,report and track )"
        if (homeLink) homeLink.style.display = 'none';
        if (reportLink) reportLink.style.display = 'none';
        if (trackLink) trackLink.style.display = 'none';
        if (aboutLink) aboutLink.style.display = '';
        if (dashLink) {
            dashLink.style.display = '';
            dashLink.textContent = (typeof t === 'function' ? t('nav_admin_dash') : 'Admin Dashboard');
            dashLink.classList.add('active');
        }

        if (mobileHome) mobileHome.style.display = 'none';
        if (mobileReport) mobileReport.style.display = 'none';
        if (mobileTrack) mobileTrack.style.display = 'none';
        if (mobileAbout) mobileAbout.style.display = '';
        if (mobileDash) {
            mobileDash.style.display = '';
            mobileDash.classList.add('active');
        }

        // Show Admin profile chip
        if (loginBtn) loginBtn.classList.add('hidden');
        if (profileBtn) profileBtn.classList.remove('hidden');
        if (autofillBanner) autofillBanner.classList.add('hidden');

        const navAvatar = document.getElementById('navAvatar');
        const dropdownAvatar = document.getElementById('dropdownAvatar');
        if (navAvatar) navAvatar.innerHTML = '🛡️';
        if (dropdownAvatar) dropdownAvatar.innerHTML = '🛡️';

        const navUserName = document.getElementById('navUserName');
        if (navUserName) navUserName.textContent = 'Admin';
        const dropdownName = document.getElementById('dropdownName');
        if (dropdownName) dropdownName.textContent = 'PWD Official Admin';
        const dropdownEmail = document.getElementById('dropdownEmail');
        if (dropdownEmail) dropdownEmail.textContent = 'admin@pwd.maharashtra.gov.in';

        const dropdownBadge = document.getElementById('dropdownBadge');
        if (dropdownBadge) {
            dropdownBadge.innerHTML = `<span class="provider-pill" style="background:rgba(249,115,22,0.15);color:var(--saffron);padding:2px 8px;border-radius:12px;font-size:0.72rem;font-weight:700;">State Command Administrator</span>`;
        }

        const myComplaintsItem = document.getElementById('myComplaintsBtn');
        if (myComplaintsItem) myComplaintsItem.style.display = 'none';

        if (mobileUserLabel) mobileUserLabel.textContent = 'Admin';
    } else {
        // === CITIZEN USER OR GUEST ===
        if (homeLink) homeLink.style.display = '';
        if (reportLink) reportLink.style.display = '';
        if (trackLink) trackLink.style.display = '';
        if (aboutLink) aboutLink.style.display = '';
        if (dashLink) {
            dashLink.style.display = '';
            dashLink.textContent = (typeof t === 'function' ? t('nav_dash') : 'Dashboard');
        }

        if (mobileHome) mobileHome.style.display = '';
        if (mobileReport) mobileReport.style.display = '';
        if (mobileTrack) mobileTrack.style.display = '';
        if (mobileAbout) mobileAbout.style.display = '';
        if (mobileDash) mobileDash.style.display = '';
        const myComplaintsItem = document.getElementById('myComplaintsBtn');
        if (myComplaintsItem) myComplaintsItem.style.display = '';

        if (user) {
            // Citizen logged in
            if (loginBtn) loginBtn.classList.add('hidden');
            if (profileBtn) profileBtn.classList.remove('hidden');
            if (autofillBanner) autofillBanner.classList.add('hidden');

            const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
            const displayName = user.name || user.email.split('@')[0];

            const navAvatar = document.getElementById('navAvatar');
            const dropdownAvatar = document.getElementById('dropdownAvatar');
            if (user.picture) {
                if (navAvatar) navAvatar.innerHTML = `<img src="${user.picture}" alt="${displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                if (dropdownAvatar) dropdownAvatar.innerHTML = `<img src="${user.picture}" alt="${displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else {
                if (navAvatar) navAvatar.textContent = initial;
                if (dropdownAvatar) dropdownAvatar.textContent = initial;
            }

            const navUserName = document.getElementById('navUserName');
            if (navUserName) navUserName.textContent = displayName;
            const dropdownName = document.getElementById('dropdownName');
            if (dropdownName) dropdownName.textContent = displayName;
            const dropdownEmail = document.getElementById('dropdownEmail');
            if (dropdownEmail) dropdownEmail.textContent = user.email;

            const dropdownBadge = document.getElementById('dropdownBadge');
            if (dropdownBadge) {
                dropdownBadge.innerHTML = user.provider === 'google' 
                    ? `<span class="provider-pill google"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google Account</span>`
                    : `<span class="provider-pill email" style="background:rgba(22,163,74,0.12);color:#16A34A;padding:2px 8px;border-radius:12px;font-size:0.72rem;font-weight:700;">Verified Citizen</span>`;
            }

            if (mobileUserLabel) mobileUserLabel.textContent = displayName.split(' ')[0];

            // Autofill report fields
            const nameEl = document.getElementById('userName');
            const phoneEl = document.getElementById('userPhone');
            const emailEl = document.getElementById('userEmail');
            if (nameEl && !nameEl.value) nameEl.value = user.name || '';
            if (phoneEl && !phoneEl.value && user.phone) phoneEl.value = user.phone;
            if (emailEl && !emailEl.value) emailEl.value = user.email || '';
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (profileBtn) profileBtn.classList.add('hidden');
            if (autofillBanner) autofillBanner.classList.remove('hidden');
            if (mobileUserLabel) mobileUserLabel.textContent = (typeof t === 'function' ? t('mob_nav_login') : 'Login');
        }
    }

    if (window.renderAllIcons) window.renderAllIcons();
}

// ---- Toggle User Dropdown ----
const navUserBtnEl = document.getElementById('navUserBtn');
if (navUserBtnEl) {
    navUserBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('navUserDropdown')?.classList.toggle('show');
    });
}

document.addEventListener('click', () => {
    document.getElementById('navUserDropdown')?.classList.remove('show');
});

// ---- Logout ----
const userLogoutBtnEl = document.getElementById('userLogoutBtn');
if (userLogoutBtnEl) {
    userLogoutBtnEl.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof adminLogout === 'function') adminLogout();
        clearCurrentUser();
        resetAllLoginForms();
        updateNavAuth();
        showAuthToast('Signed out successfully');
        if (window.navigateTo) navigateTo('login');
    });
}

// ---- My Complaints ----
document.getElementById('myComplaintsBtn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('navUserDropdown').classList.remove('show');
    navigateTo('track');
});

// ---- Switch Auth Tab ----
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const otpPanel = document.getElementById('otpPanel');
    const adminPageLoginForm = document.getElementById('adminPageLoginForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const tabAdmin = document.getElementById('tabAdmin');
    const googleBtn = document.getElementById('googleSignInBtn');
    const authDivider = document.querySelector('.auth-card .auth-divider');
    const footerText = document.getElementById('authFooterText');
    const switchText = document.getElementById('authAdminSwitchText');
    const switchBtn = document.getElementById('authAdminSwitchBtn');

    // Clear errors
    document.querySelectorAll('.auth-error').forEach(el => { el.classList.remove('show'); el.textContent = ''; });

    // Hide OTP panel
    otpPanel?.classList.add('hidden');
    clearOtpTimer();

    if (tab === 'admin') {
        loginForm?.classList.add('hidden');
        signupForm?.classList.add('hidden');
        adminPageLoginForm?.classList.remove('hidden');
        if (googleBtn) googleBtn.style.display = 'none';
        if (authDivider) authDivider.style.display = 'none';

        tabLogin?.classList.remove('active');
        tabSignup?.classList.remove('active');
        tabAdmin?.classList.add('active');

        if (footerText) footerText.innerHTML = 'Authorized PWD Engineering & Administration Division';
        if (switchText) switchText.textContent = 'Citizen or Resident User?';
        if (switchBtn) {
            switchBtn.onclick = () => switchAuthTab('login');
            switchBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span>← Back to Citizen Login</span>';
        }
        setTimeout(() => document.getElementById('adminPageUser')?.focus(), 80);
    } else if (tab === 'signup') {
        loginForm?.classList.add('hidden');
        signupForm?.classList.remove('hidden');
        adminPageLoginForm?.classList.add('hidden');
        if (googleBtn) googleBtn.style.display = '';
        if (authDivider) authDivider.style.display = '';

        tabLogin?.classList.remove('active');
        tabSignup?.classList.add('active');
        tabAdmin?.classList.remove('active');

        if (footerText) footerText.innerHTML = 'Already have an account? <a href="#" onclick="switchAuthTab(\'login\'); return false;">Login</a>';
        if (switchText) switchText.textContent = 'PWD Officer / Municipal Administrator?';
        if (switchBtn) {
            switchBtn.onclick = () => switchAuthTab('admin');
            switchBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Official Admin Login →</span>';
        }
    } else {
        loginForm?.classList.remove('hidden');
        signupForm?.classList.add('hidden');
        adminPageLoginForm?.classList.add('hidden');
        if (googleBtn) googleBtn.style.display = '';
        if (authDivider) authDivider.style.display = '';

        tabLogin?.classList.add('active');
        tabSignup?.classList.remove('active');
        tabAdmin?.classList.remove('active');

        if (footerText) footerText.innerHTML = 'Don\'t have an account? <a href="#" onclick="switchAuthTab(\'signup\'); return false;">Sign up</a>';
        if (switchText) switchText.textContent = 'PWD Officer / Municipal Administrator?';
        if (switchBtn) {
            switchBtn.onclick = () => switchAuthTab('admin');
            switchBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Official Admin Login →</span>';
        }
    }
    if (window.renderAllIcons) window.renderAllIcons();
}

// ---- Toggle Password Visibility ----
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

// ---- Password Strength Indicator ----
const signupPasswordEl = document.getElementById('signupPassword');
if (signupPasswordEl) {
    signupPasswordEl.addEventListener('input', () => {
        const val = signupPasswordEl.value;
        const strengthEl = document.getElementById('passwordStrength');
        if (!val) { strengthEl.innerHTML = ''; return; }

        let score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = [
            { cls: 'strength-weak', label: 'Weak' },
            { cls: 'strength-weak', label: 'Weak' },
            { cls: 'strength-fair', label: 'Fair' },
            { cls: 'strength-good', label: 'Good' },
            { cls: 'strength-strong', label: 'Strong' },
            { cls: 'strength-strong', label: 'Strong' }
        ];
        const level = levels[score];
        strengthEl.innerHTML = `<div class="strength-bar ${level.cls}"></div>`;
    });
}

// ---- Show Auth Error ----
function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 5000);
}

// ---- Login Form Submit ----
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    if (!email || !password) {
        showAuthError('authError', 'Please fill in all fields.');
        return;
    }

    // Check if credentials match PWD Admin
    if (typeof adminLogin === 'function' && adminLogin(email, password)) {
        clearCurrentUser();
        updateNavAuth();
        showAuthToast('PWD Administrator Authenticated. Loading GIS Command Center...');
        if (typeof navigateTo === 'function') navigateTo('dashboard');
        if (typeof showAdminDashboard === 'function') showAdminDashboard();
        return;
    }

    const user = findUser(email);
    if (!user || user.password !== password) {
        showAuthError('authError', 'Invalid email or password. Try again.');
        return;
    }

    if (typeof adminLogout === 'function') adminLogout();
    setCurrentUser({ name: user.name, email: user.email, phone: user.phone, provider: 'email' }, remember);
    updateNavAuth();
    showLoginSuccess(user.name);

    // Request accurate location and center map
    if (typeof requestUserLocationAndFocusMap === 'function') {
        setTimeout(() => requestUserLocationAndFocusMap(), 400);
    }
});

// ============================================================
// OTP REGISTRATION FLOW
// ============================================================

// ---- Generate 6-digit OTP ----
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---- Mask phone for display ----
function maskPhone(phone) {
    if (!phone || phone.length < 4) return phone;
    return '+91 ' + '*'.repeat(phone.length - 4) + phone.slice(-4);
}

// ---- Signup Form Submit → Send OTP ----
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    // Validation
    if (!name || !email || !phone || !password || !confirm) {
        showAuthError('signupError', 'Please fill in all fields.');
        return;
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        showAuthError('signupError', 'Please enter a valid 10-digit phone number.');
        return;
    }
    if (password.length < 6) {
        showAuthError('signupError', 'Password must be at least 6 characters.');
        return;
    }
    if (password !== confirm) {
        showAuthError('signupError', 'Passwords do not match.');
        return;
    }
    if (findUser(email)) {
        showAuthError('signupError', 'An account with this email already exists.');
        return;
    }

    // Store pending signup data
    pendingSignupData = { name, email, phone, password };

    // Show loading on button
    const btn = document.getElementById('signupSubmitBtn');
    btn.classList.add('loading');
    btn.textContent = '';

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = '📱 Send OTP';
        showOTPPanel(phone);
    }, 1000);
});

// ---- Show OTP Panel ----
function showOTPPanel(phone) {
    // Hide signup form, show OTP panel
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('otpPanel').classList.remove('hidden');
    document.getElementById('authFooterText').parentElement.style.display = 'none';

    // Update tabs
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('tabSignup').classList.add('active');

    // Show masked phone
    document.getElementById('otpPhoneDisplay').textContent = maskPhone(phone);

    // Generate and "send" OTP
    sendOTP();

    // Clear OTP inputs
    clearOTPInputs();

    // Focus first input
    setTimeout(() => {
        document.querySelector('.otp-digit[data-index="0"]').focus();
    }, 300);
}

// ---- Send OTP (simulated) ----
function sendOTP() {
    currentOTP = generateOTP();
    console.log('🔐 OTP for demo:', currentOTP);

    // Update Simulated SMS Banner in #otpPanel
    const displayEl = document.getElementById('otpDisplayCode');
    if (displayEl) displayEl.textContent = currentOTP;

    // Show toast with OTP (simulates SMS)
    const codeEl = document.getElementById('otpToastCode');
    if (codeEl) codeEl.textContent = currentOTP;
    const toast = document.getElementById('otpToast');
    if (toast) toast.classList.add('show');

    // Also trigger floating toast banner
    showAuthToast(`📲 SMS Code for ${maskPhone(pendingSignupData?.phone || 'phone')}: ${currentOTP}`);

    // Start resend countdown
    startOTPTimer(30);
}

// ---- Auto-Fill Current OTP on Page ----
function autoFillCurrentOTP() {
    if (!currentOTP) currentOTP = generateOTP();
    const digits = document.querySelectorAll('#otpInputs .otp-digit');
    digits.forEach((d, i) => {
        d.value = currentOTP[i] || '';
        d.classList.add('filled');
    });
    checkOTPComplete();
    const last = document.querySelector('#otpInputs .otp-digit[data-index="5"]');
    if (last) last.focus();
}

// ---- OTP Toast ----
function closeOtpToast() {
    document.getElementById('otpToast').classList.remove('show');
}

// ---- OTP Timer ----
function startOTPTimer(seconds) {
    clearOtpTimer();
    let remaining = seconds;
    const timerEl = document.getElementById('otpTimer');
    const countdownEl = document.getElementById('otpCountdown');
    const resendBtn = document.getElementById('resendOtpBtn');

    timerEl.classList.remove('hidden');
    resendBtn.classList.add('hidden');
    countdownEl.textContent = remaining;

    otpTimerInterval = setInterval(() => {
        remaining--;
        countdownEl.textContent = remaining;
        if (remaining <= 0) {
            clearOtpTimer();
            timerEl.classList.add('hidden');
            resendBtn.classList.remove('hidden');
        }
    }, 1000);
}

function clearOtpTimer() {
    if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
        otpTimerInterval = null;
    }
}

// ---- Resend OTP ----
function resendOTP() {
    sendOTP();
    clearOTPInputs();
    document.querySelector('.otp-digit[data-index="0"]').focus();
}

// ---- Clear OTP Inputs ----
function clearOTPInputs() {
    document.querySelectorAll('.otp-digit').forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
    });
}

// ---- OTP Input Behavior ----
document.querySelectorAll('.otp-digit').forEach(input => {
    // Only allow digits
    input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val;

        if (val) {
            e.target.classList.add('filled');
            // Move to next input
            const idx = parseInt(e.target.dataset.index);
            const next = document.querySelector(`.otp-digit[data-index="${idx + 1}"]`);
            if (next) next.focus();
        } else {
            e.target.classList.remove('filled');
        }

        // Check if all filled
        checkOTPComplete();
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value) {
            const idx = parseInt(e.target.dataset.index);
            const prev = document.querySelector(`.otp-digit[data-index="${idx - 1}"]`);
            if (prev) {
                prev.focus();
                prev.value = '';
                prev.classList.remove('filled');
            }
        }

        // Handle arrow keys
        if (e.key === 'ArrowLeft') {
            const idx = parseInt(e.target.dataset.index);
            const prev = document.querySelector(`.otp-digit[data-index="${idx - 1}"]`);
            if (prev) prev.focus();
        }
        if (e.key === 'ArrowRight') {
            const idx = parseInt(e.target.dataset.index);
            const next = document.querySelector(`.otp-digit[data-index="${idx + 1}"]`);
            if (next) next.focus();
        }
    });

    // Handle paste (e.g. paste full OTP)
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            document.querySelectorAll('.otp-digit').forEach((inp, i) => {
                inp.value = pasted[i];
                inp.classList.add('filled');
            });
            document.querySelector('.otp-digit[data-index="5"]').focus();
            checkOTPComplete();
        }
    });
});

// ---- Check if OTP is complete ----
function checkOTPComplete() {
    const digits = document.querySelectorAll('.otp-digit');
    const allFilled = Array.from(digits).every(d => d.value.length === 1);
    const verifyBtn = document.getElementById('verifyOtpBtn');
    verifyBtn.style.opacity = allFilled ? '1' : '0.6';
}

// ---- Verify OTP ----
document.getElementById('verifyOtpBtn').addEventListener('click', () => {
    const digits = document.querySelectorAll('.otp-digit');
    const enteredOTP = Array.from(digits).map(d => d.value).join('');

    if (enteredOTP.length !== 6) {
        showAuthError('otpError', 'Please enter the complete 6-digit OTP.');
        digits.forEach(d => d.classList.add('error'));
        setTimeout(() => digits.forEach(d => d.classList.remove('error')), 600);
        return;
    }

    if (enteredOTP !== currentOTP) {
        showAuthError('otpError', 'Invalid OTP. Please check and try again.');
        digits.forEach(d => { d.classList.add('error'); d.classList.remove('filled'); });
        setTimeout(() => {
            digits.forEach(d => d.classList.remove('error'));
            clearOTPInputs();
            digits[0].focus();
        }, 800);
        return;
    }

    // ✅ OTP Verified — Create account
    const btn = document.getElementById('verifyOtpBtn');
    btn.classList.add('loading');
    btn.textContent = '';

    // Animate success on digits
    digits.forEach((d, i) => {
        setTimeout(() => {
            d.style.borderColor = 'var(--green)';
            d.style.color = 'var(--green)';
            d.style.background = 'rgba(16,185,129,0.1)';
        }, i * 100);
    });

    setTimeout(() => {
        // Register user into users list
        if (typeof adminLogout === 'function') adminLogout();
        const registeredEmail = pendingSignupData?.email || '';
        const registeredName = pendingSignupData?.name || 'Citizen';

        if (pendingSignupData) {
            registerUser({
                name: pendingSignupData.name,
                email: pendingSignupData.email,
                phone: pendingSignupData.phone,
                password: pendingSignupData.password,
                role: 'Citizen Reporter',
                registeredAt: new Date().toISOString(),
                district: 'Maharashtra',
                provider: 'email',
                verified: true
            });
        }

        clearOtpTimer();
        closeOtpToast();
        btn.classList.remove('loading');
        btn.textContent = '✅ Verify & Create Account';
        pendingSignupData = null;

        // Redirect directly to login form — do NOT sign in automatically
        switchAuthTab('login');
        const loginEmailInput = document.getElementById('loginEmail');
        if (loginEmailInput) {
            loginEmailInput.value = registeredEmail;
        }
        const loginPwdInput = document.getElementById('loginPassword');
        if (loginPwdInput) {
            loginPwdInput.value = '';
            loginPwdInput.focus();
        }

        showAuthToast(`Registration successful, ${registeredName}! Please login with your credentials.`);
    }, 1200);
});

// ---- Back to Signup ----
function backToSignup() {
    document.getElementById('otpPanel').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('authFooterText').parentElement.style.display = '';
    clearOtpTimer();
    closeOtpToast();
}

// ============================================================
// UNIVERSAL AUTH MODAL & GOOGLE ONE-TAP PICKER
// ============================================================

// ---- Open / Close Auth Modal ----
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.add('show');
    switchModalAuthTab(tab);
    if (window.renderAllIcons) window.renderAllIcons(modal);
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.remove('show');
    const err = document.getElementById('modalAuthError');
    if (err) err.textContent = '';
}

function switchModalAuthTab(tab) {
    const loginTab = document.getElementById('modalTabLogin');
    const signupTab = document.getElementById('modalTabSignup');
    const adminTab = document.getElementById('modalTabAdmin');
    const loginForm = document.getElementById('modalLoginForm');
    const signupForm = document.getElementById('modalSignupForm');
    const adminForm = document.getElementById('modalAdminForm');
    const otpPanel = document.getElementById('modalOtpPanel');
    const googleBtn = document.getElementById('modalGoogleBtn');
    const authDivider = document.querySelector('.auth-modal-dialog .auth-divider-line');
    const switchText = document.getElementById('modalAdminSwitchText');
    const switchBtn = document.getElementById('modalAdminSwitchBtn');

    // Hide OTP panel if open
    otpPanel?.classList.add('hidden');

    // Reset error messages
    const errAuth = document.getElementById('modalAuthError');
    const errSignup = document.getElementById('modalSignupError');
    const errAdmin = document.getElementById('modalAdminError');
    if (errAuth) errAuth.textContent = '';
    if (errSignup) errSignup.textContent = '';
    if (errAdmin) errAdmin.textContent = '';

    if (tab === 'admin') {
        loginTab?.classList.remove('active');
        signupTab?.classList.remove('active');
        adminTab?.classList.add('active');

        loginForm?.classList.add('hidden');
        signupForm?.classList.add('hidden');
        adminForm?.classList.remove('hidden');

        if (googleBtn) googleBtn.style.display = 'none';
        if (authDivider) authDivider.style.display = 'none';

        if (switchText) switchText.textContent = 'Citizen or Resident User?';
        if (switchBtn) {
            switchBtn.onclick = () => switchModalAuthTab('login');
            switchBtn.innerHTML = '<i data-lucide="arrow-left"></i><span>← Return to Citizen Sign In</span>';
        }
        setTimeout(() => document.getElementById('modalAdminUser')?.focus(), 80);
    } else if (tab === 'signup') {
        loginTab?.classList.remove('active');
        signupTab?.classList.add('active');
        adminTab?.classList.remove('active');

        loginForm?.classList.add('hidden');
        signupForm?.classList.remove('hidden');
        adminForm?.classList.add('hidden');

        if (googleBtn) googleBtn.style.display = '';
        if (authDivider) authDivider.style.display = '';

        if (switchText) switchText.textContent = 'PWD Officer or Municipal Administrator?';
        if (switchBtn) {
            switchBtn.onclick = () => switchModalAuthTab('admin');
            switchBtn.innerHTML = '<i data-lucide="shield-check"></i><span>Official Admin Login →</span>';
        }
    } else {
        loginTab?.classList.add('active');
        signupTab?.classList.remove('active');
        adminTab?.classList.remove('active');

        loginForm?.classList.remove('hidden');
        signupForm?.classList.add('hidden');
        adminForm?.classList.add('hidden');

        if (googleBtn) googleBtn.style.display = '';
        if (authDivider) authDivider.style.display = '';

        if (switchText) switchText.textContent = 'PWD Officer or Municipal Administrator?';
        if (switchBtn) {
            switchBtn.onclick = () => switchModalAuthTab('admin');
            switchBtn.innerHTML = '<i data-lucide="shield-check"></i><span>Official Admin Login →</span>';
        }
    }
    if (window.renderAllIcons) window.renderAllIcons();
}

// ---- Google Account Picker Dialog ----
function openGooglePicker() {
    const picker = document.getElementById('googleAccountPickerModal');
    if (!picker) return;
    picker.style.display = 'flex';
    if (window.renderAllIcons) window.renderAllIcons(picker);
}

function closeGooglePicker() {
    const picker = document.getElementById('googleAccountPickerModal');
    if (!picker) return;
    picker.style.display = 'none';
}

function selectGoogleAccount(accountKey) {
    let googleUser = null;
    if (accountKey === 'pravin') {
        googleUser = {
            name: 'Pravin Kumar',
            email: 'pravin.pwd@gmail.com',
            phone: '9820011223',
            picture: 'https://ui-avatars.com/api/?name=Pravin+Kumar&background=1A73E8&color=fff&size=128&bold=true',
            provider: 'google'
        };
    } else if (accountKey === 'citizen') {
        googleUser = {
            name: 'Maharashtra Citizen',
            email: 'citizen.mh@gmail.com',
            phone: '9876543210',
            picture: 'https://ui-avatars.com/api/?name=Maharashtra+Citizen&background=F97316&color=fff&size=128&bold=true',
            provider: 'google'
        };
    } else {
        const customEmail = prompt('Enter your Google Email:', 'citizen.pothole@gmail.com');
        if (!customEmail) return;
        const namePart = customEmail.split('@')[0].replace(/[._]/g, ' ');
        const customName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        googleUser = {
            name: customName,
            email: customEmail,
            phone: '9823098765',
            picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName)}&background=2563EB&color=fff&size=128&bold=true`,
            provider: 'google'
        };
    }

    if (!findUser(googleUser.email)) {
        registerUser({ ...googleUser, password: '' });
    }

    if (typeof adminLogout === 'function') adminLogout();
    setCurrentUser(googleUser, true);
    closeGooglePicker();
    closeAuthModal();
    updateNavAuth();

    showAuthToast(`Signed in with Google as ${googleUser.name}`);

    // Request accurate location and center map
    if (typeof requestUserLocationAndFocusMap === 'function') {
        setTimeout(() => requestUserLocationAndFocusMap(), 400);
    }

    // If on #page-login, also show success screen
    const pageLogin = document.getElementById('page-login');
    if (pageLogin && !pageLogin.classList.contains('hidden')) {
        showLoginSuccess(googleUser.name);
    }
}

function showAuthToast(msg) {
    const existing = document.querySelector('.auth-floating-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'auth-floating-toast';
    toast.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;">✅ ${msg}</span>`;
    toast.style.cssText = `
        position: fixed; top: 28px; left: 50%; transform: translateX(-50%);
        background: #0B1B2B; color: #FFFFFF; padding: 12px 24px;
        border-radius: 30px; font-weight: 700; font-size: 0.9rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.35); z-index: 9999;
        display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2);
        animation: modalPop 0.25s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function fillDemoUser(type) {
    // Demo credential auto-fill disabled for security
    return;
}

function handleModalEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('modalLoginEmail')?.value.trim();
    const password = document.getElementById('modalLoginPassword')?.value;
    const remember = document.getElementById('modalRememberMe')?.checked;

    if (!email || !password) {
        const err = document.getElementById('modalAuthError');
        if (err) err.textContent = 'Please enter both email and password.';
        return;
    }

    // Check if credentials match PWD Admin
    if (typeof adminLogin === 'function' && adminLogin(email, password)) {
        clearCurrentUser();
        updateNavAuth();
        closeAuthModal();
        showAuthToast('PWD Administrator Authenticated. Loading GIS Command Center...');
        if (typeof navigateTo === 'function') navigateTo('dashboard');
        if (typeof showAdminDashboard === 'function') showAdminDashboard();
        return;
    }

    let user = findUser(email);
    if (!user) {
        const err = document.getElementById('modalAuthError');
        if (err) err.textContent = 'No account found with this email. Please sign up first.';
        return;
    }

    if (user.password && user.password !== password) {
        const err = document.getElementById('modalAuthError');
        if (err) err.textContent = 'Incorrect password. Please try again.';
        return;
    }

    if (typeof adminLogout === 'function') adminLogout();
    setCurrentUser({
        name: user.name,
        email: user.email,
        phone: user.phone || '9823012345',
        provider: user.provider || 'email'
    }, remember);

    updateNavAuth();
    closeAuthModal();
    showAuthToast(`Welcome back, ${user.name}!`);

    // Request accurate location and center map
    if (typeof requestUserLocationAndFocusMap === 'function') {
        setTimeout(() => requestUserLocationAndFocusMap(), 400);
    }
}

let modalCurrentOTP = null;
let modalOtpTimerInterval = null;
let modalPendingSignupData = null;

function handleModalSignup(e) {
    e.preventDefault();
    const name = document.getElementById('modalSignupName')?.value.trim();
    const email = document.getElementById('modalSignupEmail')?.value.trim();
    const phone = document.getElementById('modalSignupPhone')?.value.trim();
    const password = document.getElementById('modalSignupPassword')?.value;
    const confirm = document.getElementById('modalSignupConfirm')?.value;

    if (!name || !email || !phone || !password || !confirm) {
        const err = document.getElementById('modalSignupError');
        if (err) err.textContent = 'Please fill in all fields.';
        return;
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        const err = document.getElementById('modalSignupError');
        if (err) err.textContent = 'Please enter a valid 10-digit mobile number.';
        return;
    }
    if (password.length < 6) {
        const err = document.getElementById('modalSignupError');
        if (err) err.textContent = 'Password must be at least 6 characters.';
        return;
    }
    if (password !== confirm) {
        const err = document.getElementById('modalSignupError');
        if (err) err.textContent = 'Passwords do not match.';
        return;
    }
    if (findUser(email)) {
        const err = document.getElementById('modalSignupError');
        if (err) err.textContent = 'An account with this email already exists.';
        return;
    }

    modalPendingSignupData = { name, email, phone, password, provider: 'email' };

    // Transition to Modal OTP Panel
    document.getElementById('modalSignupForm')?.classList.add('hidden');
    document.getElementById('modalLoginForm')?.classList.add('hidden');
    const otpPanel = document.getElementById('modalOtpPanel');
    if (otpPanel) otpPanel.classList.remove('hidden');

    const phoneDisp = document.getElementById('modalOtpPhoneDisplay');
    if (phoneDisp) phoneDisp.textContent = maskPhone(phone);

    sendModalOTP();

    // Focus first input
    setTimeout(() => {
        const first = document.querySelector('#modalOtpInputs .modal-otp-digit[data-index="0"]');
        if (first) first.focus();
    }, 250);
}

function sendModalOTP() {
    modalCurrentOTP = generateOTP();
    currentOTP = modalCurrentOTP; // keep synced
    const disp = document.getElementById('modalOtpDisplayCode');
    if (disp) disp.textContent = modalCurrentOTP;

    // Trigger toast notification
    showAuthToast(`📲 SMS Code for ${maskPhone(modalPendingSignupData?.phone || 'phone')}: ${modalCurrentOTP}`);

    startModalOTPTimer(30);
}

function autoFillModalOTP() {
    if (!modalCurrentOTP) modalCurrentOTP = generateOTP();
    const digits = document.querySelectorAll('#modalOtpInputs .modal-otp-digit');
    digits.forEach((d, i) => {
        d.value = modalCurrentOTP[i] || '';
        d.classList.add('filled');
    });
    const last = document.querySelector('#modalOtpInputs .modal-otp-digit[data-index="5"]');
    if (last) last.focus();
}

function verifyModalOTP() {
    const digits = document.querySelectorAll('#modalOtpInputs .modal-otp-digit');
    const entered = Array.from(digits).map(d => d.value).join('');

    if (entered.length !== 6) {
        const err = document.getElementById('modalOtpError');
        if (err) err.textContent = 'Please enter all 6 digits of the OTP.';
        return;
    }

    if (entered !== modalCurrentOTP && entered !== currentOTP) {
        const err = document.getElementById('modalOtpError');
        if (err) err.textContent = 'Invalid OTP. Please check the simulated SMS code.';
        digits.forEach(d => d.classList.add('error'));
        setTimeout(() => digits.forEach(d => d.classList.remove('error')), 600);
        return;
    }

    // Success: register user into database
    if (typeof adminLogout === 'function') adminLogout();
    const userData = modalPendingSignupData || {
        name: 'Citizen User',
        phone: '9823012345',
        email: 'citizen@maharashtra.gov.in',
        password: '',
        provider: 'email'
    };

    if (!findUser(userData.email)) {
        registerUser({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            role: 'Citizen Reporter',
            registeredAt: new Date().toISOString(),
            district: 'Maharashtra',
            provider: 'email',
            verified: true
        });
    }

    // Redirect directly to login form — do NOT sign in directly
    switchModalAuthTab('login');
    const modalEmailInput = document.getElementById('modalLoginEmail');
    if (modalEmailInput) {
        modalEmailInput.value = userData.email;
    }
    const modalPwdInput = document.getElementById('modalLoginPassword');
    if (modalPwdInput) {
        modalPwdInput.value = '';
        modalPwdInput.focus();
    }

    showAuthToast(`Registration successful, ${userData.name}! Please login with your password.`);
    modalPendingSignupData = null;
}

function resendModalOTP() {
    sendModalOTP();
    const digits = document.querySelectorAll('#modalOtpInputs .modal-otp-digit');
    digits.forEach(d => { d.value = ''; d.classList.remove('filled'); });
    const first = document.querySelector('#modalOtpInputs .modal-otp-digit[data-index="0"]');
    if (first) first.focus();
}

function backToModalSignup() {
    document.getElementById('modalOtpPanel')?.classList.add('hidden');
    document.getElementById('modalSignupForm')?.classList.remove('hidden');
}

function startModalOTPTimer(seconds) {
    let remaining = seconds;
    const timerEl = document.getElementById('modalOtpTimer');
    const countdownEl = document.getElementById('modalOtpCountdown');
    const resendBtn = document.getElementById('modalResendOtpBtn');

    if (timerEl) timerEl.classList.remove('hidden');
    if (resendBtn) resendBtn.classList.add('hidden');
    if (countdownEl) countdownEl.textContent = remaining;

    if (modalOtpTimerInterval) clearInterval(modalOtpTimerInterval);

    modalOtpTimerInterval = setInterval(() => {
        remaining--;
        if (countdownEl) countdownEl.textContent = remaining;
        if (remaining <= 0) {
            clearInterval(modalOtpTimerInterval);
            if (timerEl) timerEl.classList.add('hidden');
            if (resendBtn) resendBtn.classList.remove('hidden');
        }
    }, 1000);
}

// Switch between Citizen/User Login and PWD Official/Admin Login
function switchToAdminLogin() {
    closeGooglePicker();
    const authModal = document.getElementById('authModal');
    if (authModal && authModal.style.display !== 'none') {
        switchModalAuthTab('admin');
    } else {
        if (window.navigateTo) {
            navigateTo('login');
        }
        switchAuthTab('admin');
    }
    showAuthToast('Switched to PWD Official Admin Login');
}

function handleAdminPageLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const user = document.getElementById('adminPageUser')?.value.trim();
    const pass = document.getElementById('adminPagePassword')?.value;
    const err = document.getElementById('adminPageError');

    if (typeof adminLogin === 'function' && adminLogin(user, pass)) {
        clearCurrentUser();
        updateNavAuth();
        if (typeof requestUserLocationAndFocusMap === 'function') {
            setTimeout(() => requestUserLocationAndFocusMap(), 400);
        }
        if (err) { err.textContent = ''; err.classList.remove('show'); }
        showAuthToast('PWD Administrator Authenticated. Loading GIS Command Center...');
        if (typeof navigateTo === 'function') navigateTo('dashboard');
        if (typeof showAdminDashboard === 'function') showAdminDashboard();
    } else {
        if (err) {
            err.textContent = 'Invalid officer credentials. Please enter valid admin username and password.';
            err.classList.add('show');
        }
    }
    return false;
}

function handleModalAdminLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const user = document.getElementById('modalAdminUser')?.value.trim();
    const pass = document.getElementById('modalAdminPass')?.value;
    const err = document.getElementById('modalAdminError');

    if (typeof adminLogin === 'function' && adminLogin(user, pass)) {
        clearCurrentUser();
        updateNavAuth();
        closeAuthModal();
        if (typeof requestUserLocationAndFocusMap === 'function') {
            setTimeout(() => requestUserLocationAndFocusMap(), 400);
        }
        showAuthToast('PWD Administrator Authenticated. Loading GIS Command Center...');
        if (typeof navigateTo === 'function') navigateTo('dashboard');
        if (typeof showAdminDashboard === 'function') showAdminDashboard();
    } else {
        if (err) {
            err.textContent = 'Invalid officer credentials. Please enter valid admin username and password.';
            err.style.display = 'block';
        }
    }
    return false;
}

function switchToUserLogin() {
    if (window.navigateTo) {
        navigateTo('login');
    }
    openAuthModal('login');
}

// Wire up keyboard event listeners for modal OTP inputs
function setupModalOtpInputs() {
    const inputs = document.querySelectorAll('#modalOtpInputs .modal-otp-digit');
    inputs.forEach((input, idx) => {
        input.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = val;
            if (val) {
                e.target.classList.add('filled');
                const next = document.querySelector(`#modalOtpInputs .modal-otp-digit[data-index="${idx + 1}"]`);
                if (next) next.focus();
            } else {
                e.target.classList.remove('filled');
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value) {
                const prev = document.querySelector(`#modalOtpInputs .modal-otp-digit[data-index="${idx - 1}"]`);
                if (prev) {
                    prev.focus();
                    prev.value = '';
                    prev.classList.remove('filled');
                }
            }
        });
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
            if (pasted.length === 6) {
                inputs.forEach((inp, i) => {
                    inp.value = pasted[i];
                    inp.classList.add('filled');
                });
                inputs[5]?.focus();
            }
        });
    });
}

// Hook Google Sign-In button on #page-login
const googleSignInBtnEl = document.getElementById('googleSignInBtn');
if (googleSignInBtnEl) {
    googleSignInBtnEl.addEventListener('click', () => {
        openGooglePicker();
    });
}

// ---- Login Success Animation ----
function showLoginSuccess(name) {
    const card = document.querySelector('.auth-card');
    if (!card) return;
    card.innerHTML = `
        <div style="text-align:center;padding:40px 0;animation:fadeInUp 0.5s ease;">
            <div style="font-size:4rem;margin-bottom:16px;">✅</div>
            <h2 style="color:var(--green);font-size:1.6rem;margin-bottom:8px;">Welcome, ${name}!</h2>
            <p style="color:var(--gray-400);margin-bottom:32px;">Your account has been verified and signed in successfully.</p>
            <button class="btn-primary" data-page="home" style="margin:0 auto;" onclick="navigateTo('home')">🏠 Go to Home</button>
            <br><br>
            <button class="btn-secondary" data-page="report" onclick="navigateTo('report')">📸 Report a Pothole</button>
        </div>
    `;
}

// ---- Init Auth State on Page Load ----
document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();
    setupModalOtpInputs();

    // Pre-fill report form if user is logged in
    const user = getCurrentUser();
    if (user) {
        const nameEl = document.getElementById('userName');
        const phoneEl = document.getElementById('userPhone');
        const emailEl = document.getElementById('userEmail');
        if (nameEl && user.name) nameEl.value = user.name;
        if (phoneEl && user.phone) phoneEl.value = user.phone;
        if (emailEl && user.email) emailEl.value = user.email;
    }

    // Init OTP verify button opacity
    const verifyBtn = document.getElementById('verifyOtpBtn');
    if (verifyBtn) verifyBtn.style.opacity = '0.6';
});
