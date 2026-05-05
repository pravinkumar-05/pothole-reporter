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
}

function clearCurrentUser() {
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_KEY);
    updateNavAuth();
}

// ---- Local Users DB (demo) ----
function getUsersDB() {
    const data = localStorage.getItem(USERS_DB_KEY);
    return data ? JSON.parse(data) : [];
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
    users.push(user);
    saveUsersDB(users);
    return true;
}

// ---- Update Navbar Auth State ----
function updateNavAuth() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('navAuth');
    const profileBtn = document.getElementById('navUserProfile');

    if (user) {
        loginBtn.classList.add('hidden');
        profileBtn.classList.remove('hidden');

        const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
        const displayName = user.name || user.email.split('@')[0];

        const navAvatar = document.getElementById('navAvatar');
        const dropdownAvatar = document.getElementById('dropdownAvatar');
        if (user.picture) {
            navAvatar.innerHTML = `<img src="${user.picture}" alt="${displayName}">`;
            dropdownAvatar.innerHTML = `<img src="${user.picture}" alt="${displayName}">`;
        } else {
            navAvatar.textContent = initial;
            dropdownAvatar.textContent = initial;
        }

        document.getElementById('navUserName').textContent = displayName;
        document.getElementById('dropdownName').textContent = displayName;
        document.getElementById('dropdownEmail').textContent = user.email;
    } else {
        loginBtn.classList.remove('hidden');
        profileBtn.classList.add('hidden');
    }
}

// ---- Toggle User Dropdown ----
document.getElementById('navUserBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('navUserDropdown').classList.toggle('show');
});

document.addEventListener('click', () => {
    document.getElementById('navUserDropdown').classList.remove('show');
});

// ---- Logout ----
document.getElementById('userLogoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    clearCurrentUser();
    navigateTo('home');
});

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
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const footerText = document.getElementById('authFooterText');

    // Clear errors
    document.querySelectorAll('.auth-error').forEach(el => { el.classList.remove('show'); el.textContent = ''; });

    // Hide OTP panel
    otpPanel.classList.add('hidden');
    clearOtpTimer();

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        footerText.innerHTML = 'Don\'t have an account? <a href="#" onclick="switchAuthTab(\'signup\'); return false;">Sign up</a>';
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabSignup.classList.add('active');
        footerText.innerHTML = 'Already have an account? <a href="#" onclick="switchAuthTab(\'login\'); return false;">Login</a>';
    }
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

    const user = findUser(email);
    if (!user || user.password !== password) {
        showAuthError('authError', 'Invalid email or password. Try again.');
        return;
    }

    setCurrentUser({ name: user.name, email: user.email, phone: user.phone, provider: 'email' }, remember);
    showLoginSuccess(user.name);
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

    // Show toast with OTP (simulates SMS)
    document.getElementById('otpToastCode').textContent = currentOTP;
    const toast = document.getElementById('otpToast');
    toast.classList.add('show');

    // Auto-hide toast after 10 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 10000);

    // Start resend countdown
    startOTPTimer(30);
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
        // Register user
        if (pendingSignupData) {
            registerUser(pendingSignupData);
            setCurrentUser({
                name: pendingSignupData.name,
                email: pendingSignupData.email,
                phone: pendingSignupData.phone,
                provider: 'email',
                verified: true
            }, false);
        }

        clearOtpTimer();
        closeOtpToast();
        btn.classList.remove('loading');
        btn.textContent = '✅ Verify & Create Account';
        showLoginSuccess(pendingSignupData?.name || 'User');
        pendingSignupData = null;
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

// ---- Google Sign-In (Simulated Demo) ----
document.getElementById('googleSignInBtn').addEventListener('click', () => {
    const googleBtn = document.getElementById('googleSignInBtn');
    googleBtn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> <span>Signing in...</span>';
    googleBtn.style.pointerEvents = 'none';

    setTimeout(() => {
        const googleUser = {
            name: 'Google User',
            email: 'user@gmail.com',
            picture: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff&size=128&bold=true',
            provider: 'google'
        };

        if (!findUser(googleUser.email)) {
            registerUser({ ...googleUser, phone: '', password: '' });
        }

        setCurrentUser(googleUser, true);

        googleBtn.innerHTML = `
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>`;
        googleBtn.style.pointerEvents = '';

        showLoginSuccess(googleUser.name);
    }, 1500);
});

// ---- Login Success Animation ----
function showLoginSuccess(name) {
    const card = document.querySelector('.auth-card');
    card.innerHTML = `
        <div style="text-align:center;padding:40px 0;animation:fadeInUp 0.5s ease;">
            <div style="font-size:4rem;margin-bottom:16px;">✅</div>
            <h2 style="color:var(--green);font-size:1.6rem;margin-bottom:8px;">Welcome, ${name}!</h2>
            <p style="color:var(--gray-400);margin-bottom:32px;">Your account has been verified and created successfully.</p>
            <button class="btn-primary" data-page="home" style="margin:0 auto;">🏠 Go to Home</button>
            <br><br>
            <button class="btn-secondary" data-page="report">📸 Report a Pothole</button>
        </div>
    `;
}

// ---- Init Auth State on Page Load ----
document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();

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
