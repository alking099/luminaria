// ===== سكريبتات صفحة تفاصيل الكتاب مع API =====

class BookDetailsManager {
    constructor() {
        this.bookData = null;
        this.currentTab = 'description';
        this.API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
        this.init();
    }

    async init() {
        await this.loadBookDetails();
    }

    // تحميل تفاصيل الكتاب من API
    async loadBookDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get("id");

        console.log("Book ID from URL:", bookId);

        if (!bookId) {
            this.showError("لم يتم تحديد كتاب. يرجى اختيار كتاب من صفحة الاكتشاف.");
            return;
        }

        try {
            this.showLoading();
            
            // أولاً: محاولة جلب البيانات المؤقتة من الاكتشاف
            const tempBookData = this.getTemporaryBookData(bookId);
            if (tempBookData) {
                this.bookData = tempBookData;
                this.renderBookDetails();
                this.setupTabs();
                return;
            }
            
            // ثانياً: جلب البيانات من API
            this.bookData = await this.fetchBookData(bookId);
            
            if (!this.bookData) {
                throw new Error('الكتاب غير موجود');
            }
            
            this.renderBookDetails();
            this.setupTabs();
            
        } catch (error) {
            console.error("Error loading book details:", error);
            this.showError("تعذر تحميل تفاصيل الكتاب. قد يكون الكتاب غير موجود أو هناك مشكلة في الاتصال.");
        }
    }

    // محاولة جلب البيانات المؤقتة من localStorage
    getTemporaryBookData(bookId) {
        try {
            const tempBook = localStorage.getItem('tempSelectedBook');
            if (tempBook) {
                const bookData = JSON.parse(tempBook);
                if (bookData.id === bookId) {
                    // مسح البيانات المؤقتة بعد استخدامها
                    localStorage.removeItem('tempSelectedBook');
                    return bookData;
                }
            }
        } catch (error) {
            console.error('Error getting temporary book data:', error);
        }
        return null;
    }

    // جلب بيانات الكتاب من API
    async fetchBookData(bookId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${bookId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.transformApiData(data);
            
        } catch (error) {
            console.error('Error fetching book data:', error);
            
            // محاولة استخدام البيانات المحلية كبديل
            return this.getLocalBookData(bookId);
        }
    }

    // تحويل بيانات API إلى التنسيق المحلي
    transformApiData(apiData) {
        const volumeInfo = apiData.volumeInfo || {};
        const saleInfo = apiData.saleInfo || {};
        
        return {
            id: apiData.id,
            title: volumeInfo.title || 'لا يوجد عنوان',
            author: this.getAuthors(volumeInfo.authors),
            description: volumeInfo.description || 'لا يوجد وصف متاح.',
            publisher: volumeInfo.publisher || 'غير معروف',
            publishedDate: volumeInfo.publishedDate || 'غير معروف',
            pages: volumeInfo.pageCount || 'غير معروف',
            category: this.getCategories(volumeInfo.categories),
            rating: volumeInfo.averageRating || 4.0,
            reviews: volumeInfo.ratingsCount || Math.floor(Math.random() * 1000) + 100,
            genre: this.getCategories(volumeInfo.categories),
            language: volumeInfo.language === 'ar' ? 'العربية' : volumeInfo.language || 'غير معروف',
            isbn: this.getISBN(volumeInfo.industryIdentifiers),
            coverUrl: this.getCoverUrl(volumeInfo.imageLinks),
            previewLink: volumeInfo.previewLink || '#',
            infoLink: volumeInfo.infoLink || '#',
            isAvailable: saleInfo.saleability !== 'NOT_FOR_SALE',
            price: this.getPrice(saleInfo),
            coverColor: this.generateCoverColor(apiData.id)
        };
    }

    // دعم للكتب المحلية إذا فشل API
    getLocalBookData(bookId) {
        const localBooks = {
            'wrOQLV6xB-wC': {
                id: 'wrOQLV6xB-wC',
                title: 'ثلاثية غرناطة',
                author: 'رضوى عاشور',
                description: 'رواية تاريخية تتكون من ثلاثة أجزاء: غرناطة، مريم والرحيل. تروي قصة عائلة موريسكية في الأندلس خلال فترة سقوط غرناطة وآخر أيام المسلمين في إسبانيا. تعتبر من أهم الأعمال الأدبية العربية في القرن العشرين.',
                publisher: 'دار الشروق',
                publishedDate: '1994-1995',
                pages: '800',
                category: 'رواية تاريخية',
                rating: 4.3,
                reviews: 1250,
                language: 'العربية',
                isbn: '9789770930054',
                coverColor: '#1e40af',
                isAvailable: true,
                coverUrl: 'https://covers.openlibrary.org/b/id/10502091-M.jpg'
            },
            'zyTCAlFPjgYC': {
                id: 'zyTCAlFPjgYC',
                title: 'الأسود يليق بك',
                author: 'أحلام مستغانمي',
                description: 'رواية عاطفية تدور حول الحب والفن والثورة. تروي قصة حب مستحيل بين فنانة جزائرية وثوري في المنفى. تعتبر من أشهر الروايات العربية الحديثة.',
                publisher: 'دار الآداب',
                publishedDate: '2012',
                pages: '368',
                category: 'رواية عاطفية',
                rating: 4.1,
                reviews: 756,
                language: 'العربية',
                isbn: '9789953896392',
                coverColor: '#dc2626',
                isAvailable: true,
                coverUrl: 'https://covers.openlibrary.org/b/id/10502093-M.jpg'
            },
            '1q_xAwAAQBAJ': {
                id: '1q_xAwAAQBAJ',
                title: 'يوتوبيا',
                author: 'أحمد خالد توفيق',
                description: 'رواية ديستوبية تصور مستقبل مصر في عام 2023 حيث انقسم المجتمع إلى طبقتين: الأغنياء في مجمعات مغلقة والفقراء في مناطق منعزلة. تطرح أسئلة عميقة عن العدالة الاجتماعية والإنسانية.',
                publisher: 'دار الشروق',
                publishedDate: '2008',
                pages: '280',
                category: 'خيال علمي',
                rating: 4.0,
                reviews: 1200,
                language: 'العربية',
                isbn: '9789770930474',
                coverColor: '#059669',
                isAvailable: true,
                coverUrl: 'https://covers.openlibrary.org/b/id/10502094-M.jpg'
            }
        };
        
        return localBooks[bookId] || null;
    }

    // دوال مساعدة لمعالجة بيانات API
    getAuthors(authors) {
        return authors ? authors.join('، ') : 'مؤلف غير معروف';
    }

    getCategories(categories) {
        return categories ? categories.join('، ') : 'عام';
    }

    getISBN(identifiers) {
        if (!identifiers) return 'غير متوفر';
        const isbn = identifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10');
        return isbn ? isbn.identifier : 'غير متوفر';
    }

    getCoverUrl(imageLinks) {
        if (!imageLinks) return null;
        return imageLinks.thumbnail || imageLinks.smallThumbnail || imageLinks.medium;
    }

    getPrice(saleInfo) {
        if (saleInfo.saleability === 'FOR_SALE' && saleInfo.listPrice) {
            return `${saleInfo.listPrice.amount} ${saleInfo.listPrice.currencyCode}`;
        }
        return 'غير متوفر للبيع';
    }

    generateCoverColor(bookId) {
        const colors = ['#1e40af', '#7c3aed', '#dc2626', '#059669', '#d97706', '#4338ca'];
        const index = bookId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    }

    // عرض تفاصيل الكتاب
    renderBookDetails() {
        if (!this.bookData) return;

        const container = document.getElementById('bookDetailsContainer');
        
        container.innerHTML = `
            <div class="book-cover-section">
                ${this.renderBookCover()}
                <div class="book-actions">
                    ${this.renderActionButtons()}
                </div>
            </div>
            <div class="book-info-section">
                <h1 class="book-title">${this.bookData.title}</h1>
                <p class="book-author">${this.bookData.author}</p>
                <div class="book-rating">
                    ${this.generateStars(this.bookData.rating)}
                    <span>${this.bookData.rating.toFixed(1)} (${this.formatNumber(this.bookData.reviews)} تقييم)</span>
                </div>
                <p class="book-description">
                    ${this.bookData.description}
                </p>
                <div class="book-meta">
                    <p><strong>الناشر:</strong> <span>${this.bookData.publisher}</span></p>
                    <p><strong>تاريخ النشر:</strong> <span>${this.bookData.publishedDate}</span></p>
                    <p><strong>عدد الصفحات:</strong> <span>${this.bookData.pages}</span></p>
                    <p><strong>التصنيف:</strong> <span>${this.bookData.category}</span></p>
                    ${this.bookData.price !== 'غير متوفر للبيع' ? `
                        <p><strong>السعر:</strong> <span>${this.bookData.price}</span></p>
                    ` : ''}
                </div>

                <!-- معلومات إضافية -->
                <div class="book-additional-info">
                    <div class="info-tabs">
                        <div class="info-tab active" data-tab="description">الوصف</div>
                        <div class="info-tab" data-tab="details">التفاصيل</div>
                        <div class="info-tab" data-tab="reviews">التقييمات</div>
                    </div>
                    
                    <div class="info-content active" id="description-content">
                        <p>${this.bookData.description}</p>
                        ${this.bookData.previewLink && this.bookData.previewLink !== '#' ? `
                            <div style="margin-top: 1rem;">
                                <a href="${this.bookData.previewLink}" target="_blank" class="action-btn action-btn-secondary" style="text-decoration: none; display: inline-flex;">
                                    <i class="fas fa-external-link-alt"></i>
                                    معاينة من Google Books
                                </a>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="info-content" id="details-content">
                        <div class="book-meta">
                            <p><strong>اللغة:</strong> <span>${this.bookData.language}</span></p>
                            <p><strong>سنة النشر:</strong> <span>${this.bookData.publishedDate}</span></p>
                            <p><strong>الترقيم الدولي:</strong> <span>${this.bookData.isbn}</span></p>
                            <p><strong>التوفر:</strong> <span>${this.bookData.isAvailable ? 'متاح' : 'غير متاح'}</span></p>
                            ${this.bookData.infoLink && this.bookData.infoLink !== '#' ? `
                                <p><strong>رابط إضافي:</strong> 
                                    <a href="${this.bookData.infoLink}" target="_blank" style="color: var(--primary-gold); text-decoration: none;">
                                        معلومات إضافية
                                    </a>
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="info-content" id="reviews-content">
                        <div class="reviews-list">
                            ${this.generateSampleReviews(this.bookData.title).map(review => `
                                <div class="review-item">
                                    <div class="review-header">
                                        <span class="reviewer-name">${review.name}</span>
                                        <div>
                                            ${this.generateStars(review.rating)}
                                            <span class="review-date">${review.date}</span>
                                        </div>
                                    </div>
                                    <p class="review-text">${review.text}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupTabs();
    }

    // عرض غلاف الكتاب
    renderBookCover() {
        if (this.bookData.coverUrl) {
            return `
                <img src="${this.bookData.coverUrl.replace('http://', 'https://')}" 
                     alt="${this.bookData.title}" 
                     class="book-cover"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="book-cover-placeholder" style="display: none; background: linear-gradient(135deg, ${this.bookData.coverColor}, ${this.darkenColor(this.bookData.coverColor, 20)});">
                    <i class="fas fa-book"></i>
                    <span>${this.bookData.title}</span>
                </div>
            `;
        } else {
            return `
                <div class="book-cover-placeholder" style="background: linear-gradient(135deg, ${this.bookData.coverColor}, ${this.darkenColor(this.bookData.coverColor, 20)});">
                    <i class="fas fa-book"></i>
                    <span>${this.bookData.title}</span>
                </div>
            `;
        }
    }

    // عرض أزرار الإجراءات
    renderActionButtons() {
        let buttons = '';
        
        if (this.bookData.isAvailable) {
            buttons += `
                <button class="action-btn action-btn-primary" onclick="bookDetailsManager.readBook()">
                    <i class="fas fa-book-reader"></i>
                    ابدأ القراءة
                </button>
            `;
        }
        
        buttons += `
            <button class="action-btn action-btn-secondary" onclick="bookDetailsManager.addToLibrary()">
                <i class="fas fa-bookmark"></i>
                أضف إلى مكتبتي
            </button>
            <button class="action-btn action-btn-secondary" onclick="bookDetailsManager.shareBook()">
                <i class="fas fa-share-alt"></i>
                مشاركة
            </button>
        `;

        if (this.bookData.previewLink && this.bookData.previewLink !== '#') {
            buttons += `
                <button class="action-btn action-btn-secondary" onclick="bookDetailsManager.openPreview()">
                    <i class="fas fa-external-link-alt"></i>
                    معاينة في Google
                </button>
            `;
        }

        return buttons;
    }

    // توليد النجوم للتقييم
    generateStars(rating) {
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

    // تنسيق الأرقام
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // تظليل اللون
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // إنشاء مراجعات تجريبية
    generateSampleReviews(bookTitle) {
        const reviews = [
            { 
                name: 'محمد أحمد', 
                date: '2024-01-15', 
                rating: 5, 
                text: `رواية رائعة تستحق القراءة أكثر من مرة. أسلوب الكاتب شيق ومشوق. ${bookTitle} من أفضل ما قرأت هذا العام.` 
            },
            { 
                name: 'فاطمة علي', 
                date: '2024-01-10', 
                rating: 4, 
                text: `عمل أدبي مميز يقدم صورة حية عن الواقع. الشخصيات متطورة والأحداث مشوقة. أنصح الجميع بقراءة ${bookTitle}.` 
            },
            { 
                name: 'خالد حسن', 
                date: '2024-01-08', 
                rating: 4, 
                text: `الرواية تلامس القلب والعقل معاً. أسلوب سردي رائع وحبكة مشوقة. ${bookTitle} تستحق كل التقدير.` 
            }
        ];
        return reviews;
    }

    // إعداد التبويبات
    setupTabs() {
        const tabs = document.querySelectorAll('.info-tab');
        const contents = document.querySelectorAll('.info-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                // إزالة النشاط من جميع التبويبات والمحتويات
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // إضافة النشاط للتبويب والمحتوى المحدد
                tab.classList.add('active');
                document.getElementById(`${target}-content`).classList.add('active');
            });
        });
    }

    // قراءة الكتاب
    readBook() {
        if (!this.bookData) {
            this.showNotification("لا يمكن قراءة الكتاب", "error");
            return;
        }

        if (!this.bookData.isAvailable) {
            this.showNotification("هذا الكتاب غير متاح للقراءة حالياً", "error");
            return;
        }

        this.showNotification("جاري فتح القارئ...", "info");
        
        // حفظ بيانات الكتاب
        localStorage.setItem('selectedBook', JSON.stringify(this.bookData));
        
        // التوجيه للقارئ
        setTimeout(() => {
            window.location.href = `book-reader.html?id=${this.bookData.id}`;
        }, 1000);
    }

    // فتح المعاينة في Google Books
    openPreview() {
        if (this.bookData.previewLink && this.bookData.previewLink !== '#') {
            window.open(this.bookData.previewLink, '_blank');
        } else {
            this.showNotification("لا توجد معاينة متاحة لهذا الكتاب", "error");
        }
    }

    // إضافة إلى المكتبة
    addToLibrary() {
        if (!this.bookData) return;

        this.showNotification("تمت إضافة الكتاب إلى مكتبتك بنجاح! ✓", "success");
        
        // محاكاة إضافة للمكتبة
        const userLibrary = JSON.parse(localStorage.getItem('userLibrary') || '[]');
        const existingBook = userLibrary.find(book => book.id === this.bookData.id);
        
        if (!existingBook) {
            userLibrary.push({
                id: this.bookData.id,
                title: this.bookData.title,
                author: this.bookData.author,
                addedAt: new Date().toISOString(),
                progress: 0,
                coverColor: this.bookData.coverColor,
                coverUrl: this.bookData.coverUrl,
                rating: this.bookData.rating
            });
            localStorage.setItem('userLibrary', JSON.stringify(userLibrary));
        }
    }

    // مشاركة الكتاب
    shareBook() {
        if (!this.bookData) return;

        if (navigator.share) {
            navigator.share({
                title: this.bookData.title,
                text: `اقرأ "${this.bookData.title}" بواسطة ${this.bookData.author} على لوميناريا`,
                url: window.location.href
            });
        } else {
            this.showNotification("تم نسخ رابط الكتاب", "info");
            // نسخ الرابط للحافظة
            navigator.clipboard.writeText(window.location.href);
        }
    }

    showLoading() {
        const container = document.getElementById('bookDetailsContainer');
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div class="loading-spinner"></div>
                <p style="color: #9ca3af; margin-top: 1rem;">جاري تحميل تفاصيل الكتاب...</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('bookDetailsContainer');
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h3 style="color: #ef4444; margin-bottom: 1rem;">خطأ في التحميل</h3>
                <p style="color: #9ca3af; margin-bottom: 1.5rem;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i>
                        إعادة المحاولة
                    </button>
                    <button class="btn btn-secondary" onclick="window.location.href='discover.html'">
                        <i class="fas fa-arrow-right"></i>
                        العودة للاكتشاف
                    </button>
                </div>
            </div>
        `;
    }

    showNotification(message, type) {
        // إزالة أي إشعارات سابقة
        const existingNotification = document.querySelector('.custom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// إضافة أنماط CSS للتحميل والإشعارات
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid #fbbf24;
        border-top: 4px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    
    .book-cover-placeholder {
        width: 100%;
        max-width: 300px;
        height: 400px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
    }
    
    .book-cover-placeholder:hover {
        transform: scale(1.02);
    }
    
    .book-cover-placeholder i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.9;
    }
    
    .book-cover-placeholder span {
        font-weight: 500;
        padding: 0 1rem;
        line-height: 1.4;
    }
`;
document.head.appendChild(style);

// إنشاء الكائن وجعله متاحاً globally
const bookDetailsManager = new BookDetailsManager();
window.bookDetailsManager = bookDetailsManager;