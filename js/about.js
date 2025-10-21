
class AboutPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupTeamInteractions();
        this.setupValueCards();
        this.initializeCounters();
    }

    // إعداد أنيميشن التمرير
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // إذا كان عنصر إحصائية، بدء العد
                    if (entry.target.classList.contains('stat-card')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // مراقبة جميع العناصر التي نريد إظهارها
        document.querySelectorAll('.value-card, .team-member, .stat-card').forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    // إعداد تفاعلات فريق العمل
    setupTeamInteractions() {
        const teamMembers = document.querySelectorAll('.team-member');
        
        teamMembers.forEach(member => {
            member.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.background = 'rgba(251, 191, 36, 0.1)';
            });
            
            member.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(-5px) scale(1)';
                this.style.background = 'var(--bg-card)';
            });

            // نقرة على عضو الفريق
            member.addEventListener('click', function() {
                const name = this.querySelector('h3').textContent;
                const role = this.querySelector('p').textContent;
                AboutPage.showTeamMemberDetails(name, role);
            });
        });
    }

    // إعداد بطاقات القيم
    setupValueCards() {
        const valueCards = document.querySelectorAll('.value-card');
        
        valueCards.forEach(card => {
            card.addEventListener('click', function() {
                const title = this.querySelector('h3').textContent;
                const description = this.querySelector('p').textContent;
                AboutPage.showValueDetails(title, description);
            });
        });
    }

    // تهيئة العدادات
    initializeCounters() {
        this.statsData = {
            books: 15000,
            readers: 50000,
            pages: 2000000,
            support: 24
        };
    }

    // تحريك العدادات
    animateCounter(statCard) {
        const statNumber = statCard.querySelector('.stat-number');
        const label = statCard.querySelector('.stat-label').textContent;
        const targetValue = this.getTargetValue(label);
        
        if (!targetValue || statCard.dataset.animated) return;
        
        statCard.dataset.animated = 'true';
        this.animateValue(statNumber, 0, targetValue, 2000);
    }

    // الحصول على القيمة المستهدفة حسب التسمية
    getTargetValue(label) {
        const values = {
            'كتاب متاح': this.statsData.books,
            'قارئ نشط': this.statsData.readers,
            'صفحة مقروءة': this.statsData.pages,
            'دعم مستمر': this.statsData.support
        };
        
        return values[label];
    }

    // تحريك القيمة برسوم متحركة
    animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // استخدام easeOutQuad
            const current = Math.floor(progress * (end - start) + start);
            
            // تنسيق الأرقام الكبيرة
            element.textContent = this.formatNumber(current);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // تنسيق الأرقام الكبيرة
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }

    // عرض تفاصيل عضو الفريق
    static showTeamMemberDetails(name, role) {
        const modal = document.createElement('div');
        modal.className = 'about-modal';
        modal.innerHTML = `
            <div class="about-modal-content">
                <div class="about-modal-header">
                    <h3>${name}</h3>
                    <button class="about-modal-close">&times;</button>
                </div>
                <div class="about-modal-body">
                    <p><strong>الدور:</strong> ${role}</p>
                    <p>معلومات إضافية عن ${name} وخبراته في مجال التطوير والتصميم.</p>
                    <p>ساهم في تطوير العديد من الميزات الرئيسية في منصة لوميناريا.</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // أحداث الإغلاق
        modal.querySelector('.about-modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    // عرض تفاصيل القيمة
    static showValueDetails(title, description) {
        GlobalUtils.showNotification(`قيمة: ${title} - ${description}`, 'info');
    }
}

// إضافة أنماط الـ modal
const aboutStyles = document.createElement('style');
aboutStyles.textContent = `
    .about-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        backdrop-filter: blur(5px);
    }
    
    .about-modal-content {
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(251, 191, 36, 0.3);
        border-radius: 12px;
        padding: 0;
        max-width: 500px;
        width: 100%;
        backdrop-filter: blur(20px);
        animation: modalSlideIn 0.3s ease;
    }
    
    .about-modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .about-modal-header h3 {
        color: var(--primary-gold);
        margin: 0;
    }
    
    .about-modal-close {
        background: none;
        border: none;
        color: var(--text-gray);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .about-modal-close:hover {
        color: var(--text-light);
    }
    
    .about-modal-body {
        padding: 1.5rem;
        color: var(--text-gray);
        line-height: 1.6;
    }
    
    .about-modal-body p {
        margin-bottom: 1rem;
    }
    
    .about-modal-body strong {
        color: var(--text-light);
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
`;

document.head.appendChild(aboutStyles);

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    new AboutPage();
});