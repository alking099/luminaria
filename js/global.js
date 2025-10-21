
   // الدوال العامة المشتركة بين جميع الصفحات

class GlobalUtils {
    static init() {
        this.initializeStars();
        this.setupGlobalEventListeners();
        this.setupLazyLoading();
    }

    // إنشاء خلفية النجوم
    static initializeStars() {
        const starsContainer = document.getElementById('starsContainer');
        if (!starsContainer) return;

        const numberOfStars = 600; // تقليل لتحسين الأداء
        for (let i = 0; i < numberOfStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }
    }

    // إعداد الأحداث العامة
    static setupGlobalEventListeners() {
        // منع السلوك الافتراضي للروابط الفارغة
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
                e.preventDefault();
            }
        });

        // تحسين تجربة النماذج
        this.enhanceForms();
    }

    // تحسين النماذج
    static enhanceForms() {
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }

    // ===== تحسينات السرعة =====
    
    // إضافة: تحميل الصور بشكل كسول
    static setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback للمتصفحات القديمة
            lazyImages.forEach(img => this.loadImage(img));
        }
    }

    static loadImage(img) {
        img.src = img.dataset.src;
        img.classList.remove('lazy-img');
        img.classList.add('loaded');
        img.onerror = function() {
            this.src = 'images/book_cover_placeholder.jpg';
        };
    }

    // إضافة: التخزين المؤقت للطلبات
    static async cachedFetch(url, options = {}) {
        const cacheKey = `cache_${btoa(url)}`;
        const cache = localStorage.getItem(cacheKey);
        const now = Date.now();
        
        // التحقق من التخزين المؤقت (10 دقائق)
        if (cache) {
            const { data, timestamp } = JSON.parse(cache);
            if (now - timestamp < 600000) {
                return data;
            }
        }
        
        // جلب بيانات جديدة
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // حفظ في التخزين المؤقت
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                timestamp: now
            }));
            
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    // توليد النجوم للتقييم
    static generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        return stars;
    }

    // عرض الإشعارات
    static showNotification(message, type = 'info') {
        // إزالة أي إشعارات سابقة
        const existingNotifications = document.querySelectorAll('.global-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `global-notification global-notification-${type}`;
        
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle'
        };

        notification.innerHTML = `
            <div class="global-notification-content">
                <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button class="global-notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إظهار الإشعار
        setTimeout(() => notification.classList.add('show'), 100);
        
        // إخفاء تلقائي بعد 4 ثوان
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    // تحميل البيانات من API
    static async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            this.showNotification('حدث خطأ في تحميل البيانات', 'error');
            throw error;
        }
    }

    // حفظ البيانات في localStorage
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('LocalStorage error:', error);
            this.showNotification('حدث خطأ في حفظ البيانات', 'error');
            return false;
        }
    }

    // جلب البيانات من localStorage
    static getFromLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('LocalStorage error:', error);
            return defaultValue;
        }
    }

    // تحقق من صحة البريد الإلكتروني
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // تحقق من قوة كلمة المرور
    static checkPasswordStrength(password) {
        let strength = 0;
        
        if (password.length > 5) strength++;
        if (password.length > 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    }

    // تنسيق التاريخ
    static formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'islamic-umalqura'
        };
        return new Date(dateString).toLocaleDateString('ar-SA', options);
    }

    // تقييد النص وإضافة ...
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // التمرير السلس إلى العنصر
    static smoothScrollTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // إظهار نافذة التأكيد
    static showConfirmation(message, onConfirm, onCancel = null) {
        const confirmation = document.createElement('div');
        confirmation.className = 'global-confirmation';
        confirmation.innerHTML = `
            <div class="global-confirmation-content">
                <div class="global-confirmation-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${message}</span>
                </div>
                <div class="global-confirmation-actions">
                    <button class="btn btn-secondary global-confirmation-cancel">
                        إلغاء
                    </button>
                    <button class="btn btn-primary global-confirmation-confirm">
                        تأكيد
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmation);

        // الأحداث
        confirmation.querySelector('.global-confirmation-confirm').onclick = () => {
            confirmation.remove();
            if (onConfirm) onConfirm();
        };

        confirmation.querySelector('.global-confirmation-cancel').onclick = () => {
            confirmation.remove();
            if (onCancel) onCancel();
        };

        // إغلاق عند النقر خارج النافذة
        confirmation.onclick = (e) => {
            if (e.target === confirmation) {
                confirmation.remove();
                if (onCancel) onCancel();
            }
        };
    }
}

// إضافة الأنماط للعناصر العالمية
const globalStyles = document.createElement('style');
globalStyles.textContent = `
    .global-notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid;
        border-radius: 8px;
        padding: 16px;
        color: white;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        backdrop-filter: blur(20px);
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .global-notification.show {
        transform: translateX(0);
    }
    
    .global-notification-success {
        border-color: rgba(34, 197, 94, 0.3);
        background: rgba(34, 197, 94, 0.1);
    }
    
    .global-notification-error {
        border-color: rgba(239, 68, 68, 0.3);
        background: rgba(239, 68, 68, 0.1);
    }
    
    .global-notification-info {
        border-color: rgba(59, 130, 246, 0.3);
        background: rgba(59, 130, 246, 0.1);
    }
    
    .global-notification-warning {
        border-color: rgba(245, 158, 11, 0.3);
        background: rgba(245, 158, 11, 0.1);
    }
    
    .global-notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .global-notification-content i {
        font-size: 18px;
        flex-shrink: 0;
    }
    
    .global-notification-content span {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .global-notification-close {
        background: none;
        border: none;
        color: currentColor;
        cursor: pointer;
        padding: 4px;
        opacity: 0.7;
        transition: opacity 0.3s ease;
        flex-shrink: 0;
    }
    
    .global-notification-close:hover {
        opacity: 1;
    }
    
    .global-confirmation {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        backdrop-filter: blur(5px);
    }
    
    .global-confirmation-content {
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(251, 191, 36, 0.3);
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 100%;
        backdrop-filter: blur(20px);
    }
    
    .global-confirmation-message {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        color: var(--text-light);
    }
    
    .global-confirmation-message i {
        color: var(--primary-gold);
        font-size: 20px;
        flex-shrink: 0;
    }
    
    .global-confirmation-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;

document.head.appendChild(globalStyles);

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    GlobalUtils.init();
});

// جعل الدوال متاحة globally
window.GlobalUtils = GlobalUtils;
window.showNotification = GlobalUtils.showNotification;
window.generateStars = GlobalUtils.generateStars;
