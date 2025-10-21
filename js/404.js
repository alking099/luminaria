

class ErrorPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupInteractiveElements();
        this.setupFloatingAnimation();
        this.setupPageTurnEffect();
        this.setupAutoRedirect();
    }

    // إعداد العناصر التفاعلية
    setupInteractiveElements() {
        // تأثيرات عند التمرير على الأزرار
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.createRippleEffect(btn);
            });
        });

        // تأثيرات على روابط الاقتراحات
        const suggestionLinks = document.querySelectorAll('.suggestion-link');
        suggestionLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.animateSuggestionLink(link);
            });
        });
    }

    // تأثير التموج على الأزرار
    createRippleEffect(button) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = rect.width / 2;
        const y = rect.height / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x - size / 2 + 'px';
        ripple.style.top = y - size / 2 + 'px';

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // تأثير الرسوم المتحركة للروابط المقترحة
    animateSuggestionLink(link) {
        link.style.transform = 'translateY(-2px) scale(1.05)';
        setTimeout(() => {
            link.style.transform = 'translateY(-2px) scale(1.02)';
        }, 150);
    }

    // إعداد الرسوم المتحركة للنجوم
    setupFloatingAnimation() {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            // إضافة حركات عشوائية إضافية
            star.style.animationDelay = `${index * 0.5}s`;
        });
    }

    // تأثير تقليب الصفحات
    setupPageTurnEffect() {
        const pages = document.querySelectorAll('.page');
        pages.forEach((page, index) => {
            page.addEventListener('mouseenter', () => {
                this.enhancePageAnimation(page, index);
            });
        });
    }

    // تحسين أنيميشن الصفحة
    enhancePageAnimation(page, index) {
        page.style.transform = `translateY(-20px) rotate(${index % 2 === 0 ? -10 : 10}deg) scale(1.1)`;
        page.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            page.style.transform = '';
        }, 1000);
    }

    // إعادة التوجيه التلقائي (اختياري)
    setupAutoRedirect() {
        // إعادة التوجيه بعد 30 ثانية إذا بقي المستخدم على الصفحة
        setTimeout(() => {
            this.showRedirectNotification();
        }, 25000);

        setTimeout(() => {
            if (window.location.pathname.includes('404')) {
                window.location.href = 'index.html';
            }
        }, 30000);
    }

    // إشعار إعادة التوجيه
    showRedirectNotification() {
        if (window.location.pathname.includes('404')) {
            const notification = document.createElement('div');
            notification.className = 'redirect-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-info-circle"></i>
                    <span>سيتم إعادة توجيهك إلى الصفحة الرئيسية خلال 5 ثوانٍ</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => notification.classList.add('show'), 100);
        }
    }

    // تأثيرات إضافية عند تحميل الصفحة
    onPageLoad() {
        this.animateErrorNumber();
        this.createParticleEffect();
    }

    // تحريك الرقم 404
    animateErrorNumber() {
        const errorNumber = document.querySelector('.error-number');
        if (errorNumber) {
            errorNumber.style.animation = 'glow 2s ease-in-out infinite alternate, bounce 2s ease-in-out infinite';
        }
    }

    // تأثير الجسيمات
    createParticleEffect() {
        const container = document.querySelector('.error-animation');
        if (!container) return;

        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createParticle(container);
            }, i * 200);
        }
    }

    // إنشاء جسيم فردي
    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-gold);
            border-radius: 50%;
            pointer-events: none;
            animation: particleFloat 3s ease-in-out forwards;
        `;

        // وضع عشوائي
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        
        particle.style.left = startX + '%';
        particle.style.top = startY + '%';

        container.appendChild(particle);

        // إزالة الجسيم بعد انتهاء الأنيميشن
        setTimeout(() => {
            particle.remove();
        }, 3000);
    }
}

// إضافة أنماط إضافية للـ CSS
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    @keyframes particleFloat {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0);
            opacity: 0;
        }
    }
    
    .redirect-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(251, 191, 36, 0.3);
        border-radius: 8px;
        padding: 1rem 1.25rem;
        color: white;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        backdrop-filter: blur(20px);
        min-width: 300px;
    }
    
    .redirect-notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .notification-content i {
        color: var(--primary-gold);
        flex-shrink: 0;
    }
    
    .notification-content span {
        flex: 1;
        font-size: 0.9rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-gray);
        cursor: pointer;
        padding: 4px;
        opacity: 0.7;
        transition: opacity 0.3s ease;
        flex-shrink: 0;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .particle {
        filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
    }
`;

document.head.appendChild(errorStyles);

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    const errorPage = new ErrorPage();
    errorPage.onPageLoad();
});

// جعل الدوال متاحة globally للاستخدام في الأحداث
window.errorPage = new ErrorPage();