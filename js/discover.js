// ===== سكريبتات صفحة الاكتشاف فقط =====
class DiscoverPage {
    constructor() {
        this.allBooks = [];
        this.filteredBooks = [];
        this.currentPage = 1;
        this.booksPerPage = 12;
        this.isLoading = false;
        this.currentFilters = {
            searchQuery: '',
            genre: '',
            minRating: 0,
            sortBy: 'rating'
        };
        
        this.availableGenres = [
            'روايات', 'تطوير الذات', 'تاريخ', 'علوم', 'مغامرات', 
            'غامض', 'رومانسية', 'خيال علمي', 'أدب عالمي', 'شعر'
        ];
        
        this.init();
    }

    async init() {
        await this.loadInitialBooks();
        this.setupEventListeners();
        this.setupSearchFromURL();
        this.applyInitialFilters();
        this.populateGenreFilter();
    }

    // تحميل الكتب الأولية من API مع التخزين المؤقت
    async loadInitialBooks() {
        this.showLoadingState();
        
        try {
            // استخدام التخزين المؤقت من GlobalUtils مع fallback
            let booksData;
            try {
                if (window.GlobalUtils && typeof window.GlobalUtils.cachedFetch === 'function') {
                    console.log("Using cachedFetch for books...");
                    booksData = await GlobalUtils.cachedFetch('https://www.googleapis.com/books/v1/volumes?q=arabic+literature&maxResults=20&langRestrict=ar,en');
                } else {
                    // fallback إلى fetch عادي
                    console.log("Using regular fetch for books...");
                    const response = await fetch('https://www.googleapis.com/books/v1/volumes?q=arabic+literature&maxResults=20&langRestrict=ar,en');
                    if (!response.ok) throw new Error('فشل في جلب البيانات');
                    booksData = await response.json();
                }
                
                this.allBooks = this.transformGoogleBooksData(booksData);
            } catch (apiError) {
                console.error('API Error:', apiError);
                // استخدام البيانات المحلية إذا فشل API
                this.allBooks = this.getSampleBooks();
            }
            
            // إضافة بيانات إضافية للكتب
            this.enhanceBooksData();
            
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading books:', error);
            this.allBooks = this.getSampleBooks();
            this.applyFilters();
        }
    }

    // جلب كتب من Google Books API مع التخزين المؤقت
    async fetchBooksFromGoogleAPI(query = "", maxResults = 10) {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=ar,en`;
        
        try {
            let data;
            if (window.GlobalUtils && typeof window.GlobalUtils.cachedFetch === 'function') {
                data = await GlobalUtils.cachedFetch(url);
            } else {
                const response = await fetch(url);
                if (!response.ok) throw new Error('فشل في جلب البيانات');
                data = await response.json();
            }
            
            if (!data.items) {
                return [];
            }
            
            return data.items.map(item => {
                const volumeInfo = item.volumeInfo || {};
                return {
                    id: item.id,
                    title: volumeInfo.title || 'عنوان غير معروف',
                    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'مؤلف غير معروف',
                    cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'images/book_cover_placeholder.jpg',
                    rating: volumeInfo.averageRating || (Math.random() * 2) + 3,
                    reviews: volumeInfo.ratingsCount || Math.floor(Math.random() * 500) + 50,
                    genre: volumeInfo.categories ? volumeInfo.categories[0] : this.getRandomGenre(),
                    publishYear: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0,4) : 'غير معروف',
                    description: volumeInfo.description || this.generateBookDescription(volumeInfo.title, volumeInfo.authors ? volumeInfo.authors[0] : ''),
                    pages: volumeInfo.pageCount || Math.floor(Math.random() * 400) + 100,
                    language: volumeInfo.language || 'الإنجليزية',
                    previewLink: volumeInfo.previewLink || '',
                    infoLink: volumeInfo.infoLink || ''
                };
            });
        } catch (error) {
            console.error('Error fetching from Google Books API:', error);
            return [];
        }
    }

    // تحويل بيانات Google Books
    transformGoogleBooksData(data) {
        if (!data.items) return this.getSampleBooks();
        
        return data.items.map(item => {
            const volumeInfo = item.volumeInfo || {};
            return {
                id: item.id,
                title: volumeInfo.title || 'عنوان غير معروف',
                author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'مؤلف غير معروف',
                cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'images/book_cover_placeholder.jpg',
                rating: volumeInfo.averageRating || (Math.random() * 2) + 3,
                reviews: volumeInfo.ratingsCount || Math.floor(Math.random() * 500) + 50,
                genre: volumeInfo.categories ? volumeInfo.categories[0] : 'عام',
                publishYear: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0,4) : 'غير معروف',
                description: volumeInfo.description || this.generateBookDescription(volumeInfo.title, volumeInfo.authors ? volumeInfo.authors[0] : ''),
                pages: volumeInfo.pageCount || Math.floor(Math.random() * 400) + 100,
                language: volumeInfo.language || 'الإنجليزية',
                previewLink: volumeInfo.previewLink || '',
                infoLink: volumeInfo.infoLink || ''
            };
        });
    }

    // توليد وصف للكتاب
    generateBookDescription(title, author) {
        const descriptions = [
            `رواية رائعة تحكي قصة ${title} التي تأخذ القارئ في رحلة لا تُنسى عبر عوالم الأدب الجميل.`,
            `عمل أدبي مميز من تأليف ${author} يقدم رؤية عميقة للحياة والمجتمع من خلال قصة شيقة.`,
            `كتاب استثنائي يجمع بين التشويق والعمق الفكري، يقدم ${author} من خلاله تحفة أدبية فريدة.`
        ];
        
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    // الحصول على نوع عشوائي
    getRandomGenre() {
        return this.availableGenres[Math.floor(Math.random() * this.availableGenres.length)];
    }

    // إزالة الكتب المكررة
    removeDuplicates(books) {
        const seen = new Set();
        return books.filter(book => {
            const identifier = book.id || (book.title + book.author);
            if (seen.has(identifier)) {
                return false;
            }
            seen.add(identifier);
            return true;
        });
    }

    // تحسين بيانات الكتب
    enhanceBooksData() {
        this.allBooks.forEach(book => {
            // تأكد من وجود غلاف
            if (book.cover.includes('placeholder') || !book.cover) {
                book.cover = this.generateBookCover(book.title);
            }
            
            // إضافة بيانات إضافية
            book.isFeatured = Math.random() > 0.7;
            book.isNew = Math.random() > 0.8;
            
            // تأكد من وجود ID
            if (!book.id) {
                book.id = this.generateBookId(book.title, book.author);
            }
        });
    }

    // توليد غلاف كتاب
    generateBookCover(title) {
        const colors = ['1e40af', '7c3aed', 'dc2626', '059669', 'd97706'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `https://via.placeholder.com/150x200/${color}/ffffff?text=${encodeURIComponent(title.substring(0, 15))}`;
    }

    // توليد ID للكتاب
    generateBookId(title, author) {
        return 'book_' + Math.random().toString(36).substr(2, 9) + '_' + 
               btoa(title + author).substr(0, 10);
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
                reviews: 1250,
                genre: 'روايات تاريخية',
                publishYear: '1994',
                description: 'رواية تاريخية تستعرض آخر أيام المسلمين في الأندلس.',
                pages: 589,
                language: 'العربية',
                isFeatured: true
            },
            {
                id: 'OL2',
                title: 'أرض زيكولا',
                author: 'عمرو عبدالحميد',
                cover: 'images/book_cover_2.jpg',
                rating: 4.2,
                reviews: 890,
                genre: 'روايات',
                publishYear: '2020',
                description: 'رواية خيال علمي عن عالم موازي.',
                pages: 320,
                language: 'العربية',
                isNew: true
            },
            {
                id: 'OL3',
                title: 'الأسود يليق بك',
                author: 'أحلام مستغانمي',
                cover: 'images/book_cover_3.jpg',
                rating: 4.1,
                reviews: 756,
                genre: 'روايات',
                publishYear: '2012',
                description: 'رواية عاطفية من الأدب العربي الحديث.',
                pages: 280,
                language: 'العربية'
            },
            {
                id: 'OL4',
                title: 'يوتوبيا',
                author: 'أحمد خالد توفيق',
                cover: 'images/book_cover_4.jpg',
                rating: 4.0,
                reviews: 1200,
                genre: 'خيال علمي',
                publishYear: '2008',
                description: 'رواية مستقبلية عن مجتمع مثالي يتحول إلى كابوس.',
                pages: 256,
                language: 'العربية'
            },
            {
                id: 'OL5',
                title: 'ساق البامبو',
                author: 'سعود السنعوسي',
                cover: 'images/book_cover_5.jpg',
                rating: 4.4,
                reviews: 980,
                genre: 'روايات',
                publishYear: '2012',
                description: 'رواية عن الهوية والانتماء والبحث عن الجذور.',
                pages: 480,
                language: 'العربية',
                isFeatured: true
            },
            {
                id: 'OL6',
                title: 'عزازيل',
                author: 'يوسف زيدان',
                cover: 'images/book_cover_6.jpg',
                rating: 4.2,
                reviews: 1100,
                genre: 'روايات تاريخية',
                publishYear: '2008',
                description: 'رواية تاريخية عن الصراعات الدينية والفكرية في القرن الخامس الميلادي.',
                pages: 360,
                language: 'العربية'
            }
        ];
    }

    // تعبئة فلاتر الأنواع
    populateGenreFilter() {
        const genreFilter = document.getElementById('genre-filter');
        if (genreFilter) {
            // إضافة الخيار الافتراضي
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'جميع الأنواع';
            genreFilter.appendChild(defaultOption);

            // إضافة الأنواع المتاحة
            this.availableGenres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre;
                option.textContent = genre;
                genreFilter.appendChild(option);
            });
        }
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        this.setupSearchInput();
        this.setupFilterControls();
        this.setupTagClicks();
        this.setupLoadMore();
    }

    // إعداد حقل البحث
    setupSearchInput() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.searchQuery = e.target.value;
                this.debouncedSearch();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
        }
    }

    // إعداد عناصر التحكم في الفلاتر
    setupFilterControls() {
        const genreFilter = document.getElementById('genre-filter');
        const ratingFilter = document.getElementById('rating-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (genreFilter) {
            genreFilter.addEventListener('change', (e) => {
                this.currentFilters.genre = e.target.value;
                this.applyFilters();
            });
        }

        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.currentFilters.minRating = parseFloat(e.target.value) || 0;
                this.applyFilters();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.applyFilters();
            });
        }
    }

    // إعداد النقر على الوسوم
    setupTagClicks() {
        const tags = document.querySelectorAll('.tag-glow');
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                const tagText = tag.dataset.tag;
                this.searchByTag(tagText);
            });
        });
    }

    // إعداد زر تحميل المزيد
    setupLoadMore() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreBooks();
            });
        }
    }

    // البحث بالوسم
    searchByTag(tag) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = tag;
            this.currentFilters.searchQuery = tag;
            this.applyFilters();
        }
    }

    // تطبيق الفلاتر
    applyFilters() {
        this.currentPage = 1;
        
        // ترشيح الكتب
        this.filteredBooks = this.allBooks.filter(book => {
            const matchesSearch = !this.currentFilters.searchQuery || 
                book.title.toLowerCase().includes(this.currentFilters.searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(this.currentFilters.searchQuery.toLowerCase()) ||
                book.genre.toLowerCase().includes(this.currentFilters.searchQuery.toLowerCase()) ||
                (book.description && book.description.toLowerCase().includes(this.currentFilters.searchQuery.toLowerCase()));

            const matchesGenre = !this.currentFilters.genre || 
                book.genre.includes(this.currentFilters.genre);

            const matchesRating = book.rating >= this.currentFilters.minRating;

            return matchesSearch && matchesGenre && matchesRating;
        });

        // ترتيب النتائج
        this.sortBooks();

        // عرض النتائج
        this.displayBooks();
        this.updateResultsCount();

        // استخدام showNotification مع fallback
        if (window.GlobalUtils && typeof window.GlobalUtils.showNotification === 'function') {
            GlobalUtils.showNotification(`تم العثور على ${this.filteredBooks.length} كتاب`, 'success');
        }
    }

    // ترتيب الكتب
    sortBooks() {
        switch (this.currentFilters.sortBy) {
            case 'title':
                this.filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                this.filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case 'newest':
                this.filteredBooks.sort((a, b) => (b.publishYear || '').localeCompare(a.publishYear || ''));
                break;
            case 'rating':
            default:
                this.filteredBooks.sort((a, b) => b.rating - a.rating);
        }
    }

    // عرض الكتب مع lazy loading
    displayBooks() {
        const container = document.getElementById('discover-books');
        if (!container) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.booksPerPage;
        const booksToShow = this.filteredBooks.slice(startIndex, endIndex);

        if (booksToShow.length === 0) {
            this.showNoResults();
            return;
        }

        container.innerHTML = booksToShow.map(book => `
            <div class="book-card" onclick="discoverPage.openBookDetails('${book.id}')">
                <div class="book-cover">
                    <img class="lazy-img" 
                         data-src="${book.cover}" 
                         src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='180' viewBox='0 0 140 180'%3E%3Crect width='140' height='180' fill='%23374151'/%3E%3C/svg%3E"
                         alt="${book.title}" 
                         onerror="this.src='images/book_cover_placeholder.jpg'">
                    ${book.isNew ? '<div class="book-badge">جديد</div>' : ''}
                    ${book.isFeatured ? '<div class="book-badge featured">مميز</div>' : ''}
                </div>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <div class="book-rating">
                    ${this.generateStars(book.rating)}
                    <span>${book.rating.toFixed(1)}</span>
                </div>
                <div class="book-meta">
                    <span class="book-year">${book.publishYear}</span>
                    <span class="book-pages">${book.pages} صفحة</span>
                </div>
                <div class="book-tag">${book.genre}</div>
            </div>
        `).join('');

        // تفعيل lazy loading للصور الجديدة
        if (window.GlobalUtils && typeof window.GlobalUtils.setupLazyLoading === 'function') {
            GlobalUtils.setupLazyLoading();
        }
        this.updateLoadMoreButton();
    }

    // توليد النجوم للتقييم
    generateStars(rating) {
        if (window.GlobalUtils && typeof window.GlobalUtils.generateStars === 'function') {
            return GlobalUtils.generateStars(rating);
        }
        
        // Fallback manual stars generation
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

    // تحميل المزيد من الكتب
    async loadMoreBooks() {
        if (this.isLoading) return;

        this.isLoading = true;
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<div class="loading-spinner"></div>جاري التحميل...';
            loadMoreBtn.disabled = true;
        }

        try {
            // محاكاة جلب المزيد من البيانات
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.currentPage++;
            this.displayBooks();
            
        } catch (error) {
            console.error('Error loading more books:', error);
            if (window.GlobalUtils && typeof window.GlobalUtils.showNotification === 'function') {
                GlobalUtils.showNotification('حدث خطأ في تحميل الكتب', 'error');
            }
        } finally {
            this.isLoading = false;
            
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i>تحميل المزيد من الكتب';
                loadMoreBtn.disabled = false;
            }
        }
    }

    // مسح الفلاتر
    clearFilters() {
        this.currentFilters = {
            searchQuery: '',
            genre: '',
            minRating: 0,
            sortBy: 'rating'
        };

        // إعادة تعيين عناصر التحكم
        const searchInput = document.getElementById('search-input');
        const genreFilter = document.getElementById('genre-filter');
        const ratingFilter = document.getElementById('rating-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (searchInput) searchInput.value = '';
        if (genreFilter) genreFilter.value = '';
        if (ratingFilter) ratingFilter.value = '0';
        if (sortFilter) sortFilter.value = 'rating';

        this.applyFilters();
        if (window.GlobalUtils && typeof window.GlobalUtils.showNotification === 'function') {
            GlobalUtils.showNotification('تم مسح جميع الفلاتر', 'info');
        }
    }

    // تحديث عدد النتائج
    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const count = this.filteredBooks.length;
            resultsCount.textContent = `${count} كتاب${count !== 1 ? 'ات' : ''}`;
        }
    }

    // تحديث زر تحميل المزيد
    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            const remainingBooks = this.filteredBooks.length - (this.currentPage * this.booksPerPage);
            loadMoreBtn.style.display = remainingBooks > 0 ? 'block' : 'none';
        }
    }

    // فتح تفاصيل الكتاب
    openBookDetails(bookId) {
        const selectedBook = this.allBooks.find(b => b.id === bookId);
        if (selectedBook) {
            localStorage.setItem('tempSelectedBook', JSON.stringify(selectedBook));
        }
        
        window.location.href = `book-details.html?id=${encodeURIComponent(bookId)}`;
    }

    // إعداد البحث من URL
    setupSearchFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        const genre = urlParams.get('genre');

        if (searchQuery) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = searchQuery;
                this.currentFilters.searchQuery = searchQuery;
            }
        }

        if (genre) {
            const genreFilter = document.getElementById('genre-filter');
            if (genreFilter) {
                genreFilter.value = genre;
                this.currentFilters.genre = genre;
            }
        }
    }

    // تطبيق الفلاتر الأولية
    applyInitialFilters() {
        if (this.currentFilters.searchQuery || this.currentFilters.genre) {
            this.applyFilters();
        }
    }

    // حالة التحميل
    showLoadingState() {
        const container = document.getElementById('discover-books');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="loading-spinner" style="width: 50px; height: 50px; margin: 0 auto 1rem;"></div>
                    <p>جاري تحميل الكتب...</p>
                </div>
            `;
        }
    }

    // حالة عدم العثور على نتائج
    showNoResults() {
        const container = document.getElementById('discover-books');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>لم نعثر على كتب</h3>
                    <p>جرب تعديل كلمات البحث أو الفلاتر للحصول على نتائج أفضل</p>
                    <button class="btn btn-primary" onclick="discoverPage.clearFilters()">
                        مسح جميع الفلاتر
                    </button>
                </div>
            `;
        }

        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Debounce للبحث
    debouncedSearch = this.debounce(() => {
        this.applyFilters();
    }, 500);

    // دالة Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// إنشاء instance من صفحة الاكتشاف
const discoverPage = new DiscoverPage();

// جعل الدوال متاحة globally
window.discoverPage = discoverPage;
window.applyFilters = () => discoverPage.applyFilters();
window.clearFilters = () => discoverPage.clearFilters();
window.loadMoreBooks = () => discoverPage.loadMoreBooks();