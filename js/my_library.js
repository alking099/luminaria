// ===== سكريبتات صفحة المكتبة الشخصية فقط =====

class MyLibraryManager {
    constructor() {
        this.myBooks = [];
        this.init();
    }

    init() {
        this.loadMyBooks();
        this.displayMyBooks();
        this.setupEventListeners();
    }

    // تحميل كتبي الخاصة
    loadMyBooks() {
        this.myBooks = [
            {
                id: 'book1',
                title: 'اكستانسي',
                author: 'عبدالهادي العمشان',
                cover: 'images/book_cover_1.jpg',
                description: 'تحميل وقراءة كتاب اكستاسي للكاتب عبدالهادي العمشان. في قسم علم النفس. يتكون من 276 صفحة. من فئة علم النفس المعرفي. بصيغة PDF. بشكل مجاني.',
                genre: 'علم النفس',
                file: 'pdfs/book1.pdf',
                fileSize: '2.3 MB'
            },
            {
                id: 'book2',
                title: 'ارسس',
                author: 'احمد ال حمدان',
                cover: 'images/book_cover_3.jpg',
                description: 'أتعرف ما هو أسوء من الموت ؟ إنها الحقيقة التي تنتظرك بالداخل. تدور أحداث الرواية عن جسم غريب يُكتشف في السماء.',
                genre: 'الأدب العربي',
                file: 'pdfs/book2.pdf',
                fileSize: '1.8 MB'
            },
            {
                id: 'book3', 
                title: 'ارسس2',
                author: 'احمد ال حمدان',
                cover: 'images/book_cover_5.jpg',
                description: 'أتعرف ماهو أسوأ من الموت ؟ إنها الحقيقة التي تنتظرك بالداخل.',
                genre: 'روايات اجتماعية',
                file: 'pdfs/book3.pdf',
                fileSize: '2.1 MB'
            }
        ];
    }

    // عرض كتبي
    displayMyBooks() {
        const container = document.getElementById('my-pdf-books');
        if (!container) return;

        container.innerHTML = this.myBooks.map(book => `
            <div class="pdf-book-card">
                <div class="pdf-book-cover-container">
                    <img src="${book.cover}" alt="${book.title}" class="pdf-book-cover" 
                         onerror="this.src='images/book_cover_placeholder.jpg'">
                </div>
                <div class="pdf-book-info">
                    <h3 class="pdf-book-title">${book.title}</h3>
                    <p class="pdf-book-author">المؤلف: ${book.author}</p>
                    <p class="pdf-book-description">${book.description}</p>
                    <div class="pdf-book-meta">
                        <span class="pdf-book-tag">${book.genre}</span>
                        <span class="pdf-book-size">
                            <i class="fas fa-download"></i> ${book.fileSize}
                        </span>
                    </div>
                </div>
                <div class="pdf-book-actions">
                    <button class="btn btn-primary read-now-btn" onclick="myLibrary.readBookNow('${book.id}')">
                        <i class="fas fa-book-reader"></i>
                        اقرأ الآن
                    </button>
                    <button class="btn btn-secondary download-btn" onclick="myLibrary.downloadBook('${book.id}')">
                        <i class="fas fa-download"></i>
                        تحميل PDF
                    </button>
                </div>
            </div>
        `).join('');
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // يمكن إضافة أي event listeners إضافية هنا
    }

    // قراءة الكتاب الآن
    readBookNow(bookId) {
        const book = this.myBooks.find(b => b.id === bookId);
        if (book && book.file) {
            // فتح ملف PDF في نافذة جديدة
            window.open(book.file, '_blank');
            this.showNotification(`جاري فتح: ${book.title}`, 'success');
        } else {
            this.showNotification('الكتاب غير متاح للقراءة حالياً', 'error');
        }
    }

    // تحميل الكتاب
    downloadBook(bookId) {
        const book = this.myBooks.find(b => b.id === bookId);
        if (book && book.file) {
            this.showNotification(`جاري تحميل: ${book.title}`, 'info');
            
            // إنشاء رابط تحميل
            const link = document.createElement('a');
            link.href = book.file;
            link.download = `${book.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification(`تم بدء تحميل: ${book.title}`, 'success');
        } else {
            this.showNotification('الكتاب غير متاح للتحميل حالياً', 'error');
        }
    }

    // عرض الإشعارات
    showNotification(message, type) {
        GlobalUtils.showNotification(message, type);
    }
}

// إنشاء instance من مكتبتي
const myLibrary = new MyLibraryManager();