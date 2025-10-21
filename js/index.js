

class HomePage {
    constructor() {
        this.featuredBooks = [];
        this.init();
    }

    async init() {
        await this.loadFeaturedBooks();
        this.setupEventListeners();
        this.setupAnimations();
        this.initializeSearch();
    }

    // تحميل الكتب المميزة من API مع التخزين المؤقت
    async loadFeaturedBooks() {
        const featuredBooksContainer = document.getElementById('featured-books-grid');
        if (!featuredBooksContainer) return;

        try {
            this.showLoadingState(featuredBooksContainer);

            // استخدام التخزين المؤقت
            this.featuredBooks = await GlobalUtils.cachedFetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=8&langRestrict=ar,en')
                .then(data => this.transformGoogleBooksData(data));
            
            this.displayFeaturedBooks();

        } catch (error) {
            console.error('Error loading featured books:', error);
            // استخدام بيانات تجريبية إذا فشل API
            this.featuredBooks = this.getSampleBooks();
            this.displayFeaturedBooks();
        }
    }

    // تحويل بيانات Google Books
    transformGoogleBooksData(data) {
        if (!data.items) return this.getSampleBooks();
        
        return data.items.slice(0, 8).map(item => {
            const volumeInfo = item.volumeInfo || {};
            return {
                id: item.id,
                title: volumeInfo.title || 'عنوان غير معروف',
                author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'مؤلف غير معروف',
                cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'images/book_cover_placeholder.jpg',
                rating: volumeInfo.averageRating || (Math.random() * 2) + 3,
                genre: volumeInfo.categories ? volumeInfo.categories[0] : 'عام',
                description: 'وصف الكتاب سيظهر هنا...'
            };
        });
    }

    // كتب تجريبية إذا فشل API
    getSampleBooks() {
        return [
            {
                id: 'OL1',
                title: 'ثلاثية غرناطة',
                author: 'رضوى عاشور',
                cover: 'images/book_cover_1.jpg',
                rating: 4.3,
                genre: 'رواية تاريخية',
                description: 'رواية تاريخية عن الأندلس'
            },
            {
                id: 'OL2',
                title: 'أرض زيكولا',
                author: 'عمرو عبدالحميد',
                cover: 'images/book_cover_2.jpg',
                rating: 4.2,
                genre: 'رواية',
                description: 'رواية خيال علمي'
            },
            {
                id: 'OL3',
                title: 'الأسود يليق بك',
                author: 'أحلام مستغانمي',
                cover: 'images/book_cover_3.jpg',
                rating: 4.1,
                genre: 'رواية',
                description: 'رواية عاطفية'
            },
            {
                id: 'OL4',
                title: 'يوتوبيا',
                author: 'أحمد خالد توفيق',
                cover: 'images/book_cover_4.jpg',
                rating: 4.0,
                genre: 'خيال علمي',
                description: 'رواية مستقبلية'
            }
        ];
    }

    displayFeaturedBooks() {
        const container = document.getElementById('featured-books-grid');
        if (!container) return;

        if (this.featuredBooks.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        container.innerHTML = this.featuredBooks.map(book => `
            <div class="book-card" onclick="homePage.openBookDetails('${book.id}')">
                <div class="book-cover">
                    <img class="lazy-img" 
                         data-src="${book.cover}" 
                         src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='200' viewBox='0 0 140 200'%3E%3Crect width='140' height='200' fill='%23374151'/%3E%3C/svg%3E"
                         alt="${book.title}" 
                         onerror="this.src='images/book_cover_placeholder.jpg'">
                </div>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <div class="book-rating">
                    ${GlobalUtils.generateStars(book.rating)}
                </div>
                <div class="book-tag">${book.genre}</div>
            </div>
        `).join('');

        // تفعيل lazy loading للصور
        GlobalUtils.setupLazyLoading();
    }

    // إعداد أحداث البحث والكلمات المفتاحية
    setupEventListeners() {
        this.setupSearchFunctionality();
        this.setupGenreNavigation();
        this.setupCTAActions();
        this.setupContactLinks();
    }

    // إعداد البحث والكلمات المفتاحية
    setupSearchFunctionality() {
        const searchInput = document.getElementById('main-search-input');
        const searchButton = document.querySelector('.search-button');
        const searchTags = document.querySelectorAll('.search-tag');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
        }

        // إصلاح: الكلمات المفتاحية تظهر في صندوق البحث
        searchTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const tagText = tag.dataset.tag;
                if (searchInput) {
                    searchInput.value = tagText;
                    searchInput.focus();
                }
                this.performSearch(tagText);
            });
        });
    }

    // إعداد روابط التواصل
    setupContactLinks() {
        const contactLinks = document.querySelectorAll('a[href="#"], .footer-links a');
        
        contactLinks.forEach(link => {
            if (link.textContent.includes('اتصل بنا') || link.textContent.includes('تواصل معنا')) {
                link.href = 'mailto:luminaria.books@gmail.com?subject=اتصال من موقع لوميناريا&body=مرحباً، أود التواصل معكم بخصوص...';
                link.target = '_blank';
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.open(link.href, '_blank');
                });
            }
        });
    }

    // البحث
    performSearch(query) {
        if (!query.trim()) {
            GlobalUtils.showNotification('الرجاء إدخال كلمة للبحث', 'warning');
            return;
        }

        GlobalUtils.showNotification(`جاري البحث عن: "${query}"`, 'info');
        
        // التوجيه لصفحة الاكتشاف مع معامل البحث
        setTimeout(() => {
            window.location.href = `discover.html?q=${encodeURIComponent(query)}`;
        }, 1000);
    }

    // فتح تفاصيل الكتاب
    openBookDetails(bookId) {
        const book = this.featuredBooks.find(b => b.id === bookId);
        if (book) {
            // حفظ بيانات الكتاب للاستخدام في صفحة التفاصيل
            GlobalUtils.saveToLocalStorage('selectedBook', book);
            window.location.href = `book-details.html?id=${bookId}`;
        }
    }

    // حالة التحميل
    showLoadingState(container) {
        container.innerHTML = `
            <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="width: 60px; height: 60px; border: 4px solid rgba(251, 191, 36, 0.3); border-top: 4px solid var(--primary-gold); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p style="color: var(--text-gray);">جاري تحميل الكتب المميزة...</p>
            </div>
        `;
    }

    // حالة عدم وجود كتب
    getEmptyState() {
        return `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-book-open" style="font-size: 4rem; color: var(--text-gray); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-light); margin-bottom: 1rem;">لا توجد كتب متاحة</h3>
                <p style="color: var(--text-gray); margin-bottom: 1.5rem;">تعذر تحميل الكتب المميزة حالياً</p>
                <button class="btn btn-primary" onclick="homePage.loadFeaturedBooks()">
                    <i class="fas fa-redo"></i>
                    إعادة المحاولة
                </button>
            </div>
        `;
    }

    setupGenreNavigation() {
        const genreCards = document.querySelectorAll('.genre-card');
        genreCards.forEach(card => {
            card.addEventListener('click', () => {
                const genre = card.querySelector('h3').textContent;
                this.filterByGenre(genre);
            });
        });
    }

    setupCTAActions() {
        const joinButtons = document.querySelectorAll('.btn-primary[href="account.html"]');
        const exploreButtons = document.querySelectorAll('.btn-secondary[href="discover.html"]');

        joinButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleJoinClick();
            });
        });

        exploreButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleExploreClick();
            });
        });
    }

    setupAnimations() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.genre-card, .book-card, .community-stat').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.genre-card')) {
                const card = e.target.closest('.genre-card');
                card.style.transform = 'translateY(-10px) scale(1.02)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.genre-card')) {
                const card = e.target.closest('.genre-card');
                card.style.transform = 'translateY(-8px) scale(1)';
            }
        });
    }

    filterByGenre(genre) {
        GlobalUtils.showNotification(`جاري عرض كتب: ${genre}`, 'info');
        
        setTimeout(() => {
            window.location.href = `discover.html?genre=${encodeURIComponent(genre)}`;
        }, 1000);
    }

    handleJoinClick() {
        GlobalUtils.showNotification('جاري التوجيه إلى صفحة التسجيل...', 'info');
        setTimeout(() => {
            window.location.href = 'account.html';
        }, 1000);
    }

    handleExploreClick() {
        GlobalUtils.showNotification('جاري التوجيه إلى مكتبة الكتب...', 'info');
        setTimeout(() => {
            window.location.href = 'discover.html';
        }, 1000);
    }

    initializeSearch() {
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
            }, 1000);
        }
    }
}

// إضافة أنميشن الدوران
const homeStyles = document.createElement('style');
homeStyles.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .genre-card, .book-card {
        transition: all 0.3s ease !important;
    }
    
    .search-tag {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .search-tag:hover {
        transform: translateY(-2px);
    }
`;

document.head.appendChild(homeStyles);

// إنشاء instance من الصفحة الرئيسية
const homePage = new HomePage();

// جعل الدوال متاحة globally للاستخدام في الأحداث
window.homePage = homePage;
window.filterByGenre = (genre) => homePage.filterByGenre(genre);
window.performMainSearch = () => {
    const input = document.getElementById('main-search-input');
    homePage.performSearch(input.value);
};
