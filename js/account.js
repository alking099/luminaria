// ===== سكريبتات صفحة الحساب فقط =====

class AccountManager {
    constructor() {
        this.currentTab = 'login';
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupPasswordToggles();
        this.setupPasswordStrength();
        this.setupFormSubmissions();
        this.setupSocialLogins();
        this.checkRememberedUser();
    }

    // تبديل التبويبات
    setupTabSwitching() {
        const tabHeaders = document.querySelectorAll('.tab-header');
        const tabContents = document.querySelectorAll('.tab-content');

        tabHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetTab = header.dataset.tab;
                this.switchToTab(targetTab, tabHeaders, tabContents);
            });
        });
    }

    switchToTab(targetTab, tabHeaders, tabContents) {
        // تحديث التبويبات النشطة
        tabHeaders.forEach(h => h.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // تفعيل التبويب الجديد
        const activeHeader = document.querySelector(`[data-tab="${targetTab}"]`);
        const activeContent = document.getElementById(`${targetTab}-tab`);

        if (activeHeader && activeContent) {
            activeHeader.classList.add('active');
            activeContent.classList.add('active');
            this.currentTab = targetTab;
            
            this.showAccountNotification(
                `تم التبديل إلى ${targetTab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}`,
                'info'
            );
        }
    }

    // إظهار/إخفاء كلمة المرور
    setupPasswordToggles() {
        window.togglePassword = (inputId) => {
            const input = document.getElementById(inputId);
            const icon = input.nextElementSibling.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        };
    }

    // قوة كلمة المرور
    setupPasswordStrength() {
        const signupPassword = document.getElementById('signup-password');
        const passwordStrength = document.getElementById('password-strength');

        if (signupPassword && passwordStrength) {
            signupPassword.addEventListener('input', () => {
                const password = signupPassword.value;
                const strength = this.calculatePasswordStrength(password);
                this.updatePasswordStrengthDisplay(strength, passwordStrength);
            });
        }
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length > 5) strength++;
        if (password.length > 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    }

    updatePasswordStrengthDisplay(strength, element) {
        let strengthText = '';
        let strengthClass = '';

        if (strength <= 2) {
            strengthText = 'ضعيفة';
            strengthClass = 'weak';
        } else if (strength <= 4) {
            strengthText = 'متوسطة';
            strengthClass = 'medium';
        } else {
            strengthText = 'قوية';
            strengthClass = 'strong';
        }

        element.textContent = `قوة كلمة المرور: ${strengthText}`;
        element.className = `password-strength ${strengthClass}`;
    }

    // إرسال النماذج
    setupFormSubmissions() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    // معالجة تسجيل الدخول
    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // التحقق من صحة البيانات
        if (!this.validateLoginData(email, password)) {
            return;
        }

        this.showLoadingState('login');

        try {
            // محاكاة اتصال بالخادم
            await this.mockLoginRequest(email, password);
            
            // حفظ بيانات المستخدم إذا طلب التذكر
            if (rememberMe) {
                this.rememberUser(email);
            }

            this.showAccountNotification('تم تسجيل الدخول بنجاح!', 'success');
            
            // التوجيه للصفحة الرئيسية بعد نجاح التسجيل
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            this.showAccountNotification(error.message, 'error');
        } finally {
            this.hideLoadingState('login');
        }
    }

    // معالجة إنشاء الحساب
    async handleSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        const agreeTerms = document.getElementById('agree-terms').checked;

        // التحقق من صحة البيانات
        if (!this.validateSignupData(name, email, password, confirmPassword, agreeTerms)) {
            return;
        }

        this.showLoadingState('signup');

        try {
            // محاكاة اتصال بالخادم
            await this.mockSignupRequest(name, email, password);
            
            this.showAccountNotification('تم إنشاء الحساب بنجاح!', 'success');
            
            // الانتقال تلقائياً لتبويب تسجيل الدخول
            setTimeout(() => {
                this.switchToTab('login', 
                    document.querySelectorAll('.tab-header'), 
                    document.querySelectorAll('.tab-content')
                );
                
                // تعبئة بيانات تسجيل الدخول تلقائياً
                document.getElementById('login-email').value = email;
                document.getElementById('login-password').value = password;
            }, 1500);

        } catch (error) {
            this.showAccountNotification(error.message, 'error');
        } finally {
            this.hideLoadingState('signup');
        }
    }

    // التحقق من بيانات تسجيل الدخول
    validateLoginData(email, password) {
        if (!email || !password) {
            this.showAccountNotification('الرجاء ملء جميع الحقول', 'error');
            return false;
        }

        if (!GlobalUtils.isValidEmail(email)) {
            this.showAccountNotification('البريد الإلكتروني غير صحيح', 'error');
            return false;
        }

        return true;
    }

    // التحقق من بيانات إنشاء الحساب
    validateSignupData(name, email, password, confirmPassword, agreeTerms) {
        if (!name || !email || !password || !confirmPassword) {
            this.showAccountNotification('الرجاء ملء جميع الحقول', 'error');
            return false;
        }

        if (!GlobalUtils.isValidEmail(email)) {
            this.showAccountNotification('البريد الإلكتروني غير صحيح', 'error');
            return false;
        }

        if (password !== confirmPassword) {
            this.showAccountNotification('كلمتا المرور غير متطابقتين', 'error');
            return false;
        }

        if (password.length < 6) {
            this.showAccountNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return false;
        }

        if (!agreeTerms) {
            this.showAccountNotification('يجب الموافقة على الشروط والأحكام', 'error');
            return false;
        }

        return true;
    }

    // محاكاة طلب تسجيل الدخول
    mockLoginRequest(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // محاكاة قاعدة بيانات بسيطة
                const users = JSON.parse(localStorage.getItem('luminaria_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    // حفظ حالة تسجيل الدخول
                    localStorage.setItem('current_user', JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة'));
                }
            }, 1500);
        });
    }

    // محاكاة طلب إنشاء حساب
    mockSignupRequest(name, email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // التحقق إذا المستخدم موجود مسبقاً
                const users = JSON.parse(localStorage.getItem('luminaria_users') || '[]');
                const existingUser = users.find(u => u.email === email);
                
                if (existingUser) {
                    reject(new Error('هذا البريد الإلكتروني مسجل مسبقاً'));
                    return;
                }

                // إنشاء مستخدم جديد
                const newUser = {
                    id: Date.now().toString(),
                    name: name,
                    email: email,
                    password: password, // في التطبيق الحقيقي: يجب تشفير كلمة المرور
                    joinedAt: new Date().toISOString(),
                    library: []
                };

                users.push(newUser);
                localStorage.setItem('luminaria_users', JSON.stringify(users));
                resolve(newUser);
            }, 2000);
        });
    }

    // تسجيل الدخول الاجتماعي
    setupSocialLogins() {
        const googleBtn = document.querySelector('.google-btn');
        const facebookBtn = document.querySelector('.facebook-btn');

        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                this.handleSocialLogin('google');
            });
        }

        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => {
                this.handleSocialLogin('facebook');
            });
        }
    }

    // معالجة التسجيل الاجتماعي
    handleSocialLogin(provider) {
        this.showAccountNotification(`جاري التسجيل باستخدام ${provider === 'google' ? 'Google' : 'Facebook'}...`, 'info');
        
        // في التطبيق الحقيقي: integration مع خدمات الطرف الثالث
        setTimeout(() => {
            this.showAccountNotification(`تسجيل الدخول عبر ${provider === 'google' ? 'Google' : 'Facebook'} غير متاح حالياً`, 'info');
        }, 2000);
    }

    // تذكر المستخدم
    rememberUser(email) {
        localStorage.setItem('remembered_user', email);
    }

    // التحقق من المستخدم المذكر
    checkRememberedUser() {
        const rememberedEmail = localStorage.getItem('remembered_user');
        if (rememberedEmail) {
            document.getElementById('login-email').value = rememberedEmail;
            document.getElementById('remember-me').checked = true;
        }
    }

    // حالة التحميل
    showLoadingState(formType) {
        const submitBtn = document.querySelector(`#${formType}-form .btn-primary`);
        if (submitBtn) {
            submitBtn.innerHTML = '<div class="loading-spinner"></div>جاري المعالجة...';
            submitBtn.disabled = true;
        }
    }

    // إخفاء حالة التحميل
    hideLoadingState(formType) {
        const submitBtn = document.querySelector(`#${formType}-form .btn-primary`);
        if (submitBtn) {
            const text = formType === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب';
            submitBtn.innerHTML = `<i class="fas fa-${formType === 'login' ? 'sign-in-alt' : 'user-plus'}"></i>${text}`;
            submitBtn.disabled = false;
        }
    }

    // إشعارات الحساب
    showAccountNotification(message, type) {
        // إزالة أي إشعارات سابقة
        const existingNotifications = document.querySelectorAll('.account-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `account-notification account-notification-${type}`;
        notification.innerHTML = `
            <div class="account-notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إظهار الإشعار
        setTimeout(() => notification.classList.add('show'), 100);
        
        // إخفاء الإشعار بعد 4 ثوان
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
}

// إضافة أنماط التحميل
const accountStyles = document.createElement('style');
accountStyles.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

document.head.appendChild(accountStyles);

// تهيئة صفحة الحساب
document.addEventListener('DOMContentLoaded', () => {
    new AccountManager();
});