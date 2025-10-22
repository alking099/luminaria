// ===== سكريبتات قارئ الكتب فقط =====

class BookReader {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 10;
        this.bookContent = [];
        this.settings = {
            fontSize: 18,
            lineHeight: 1.8,
            nightMode: false,
            fontFamily: 'Tajawal'
        };
        this.bookmarks = [];
        this.bookData = null;
        this.init();
    }

    async init() {
        await this.loadBookData();
        await this.loadBookContent();
        this.loadSettings();
        this.applySettings();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.loadBookmarks();
        this.loadProgress();
        this.displayCurrentPage();
    }

    // تحميل بيانات الكتاب - محدثة
    async loadBookData() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get("id");

        console.log("Book ID from URL:", bookId);

        // أولاً: محاولة جلب البيانات من localStorage
        const savedBook = localStorage.getItem('selectedBookForReader');
        if (savedBook) {
            try {
                this.bookData = JSON.parse(savedBook);
                console.log("Loaded book from storage:", this.bookData);
            } catch (error) {
                console.error("Error parsing saved book:", error);
            }
        }

        // إذا لم توجد بيانات محفوظة، استخدام البيانات الافتراضية حسب ID
        if (!this.bookData) {
            const booksData = {
                'OL1': {
                    title: 'ثلاثية غرناطة',
                    author: 'رضوى عاشور',
                    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388337995i/19414312.jpg',
                    totalPages: 12
                },
                'OL2': {
                    title: 'أرض زيكولا',
                    author: 'عمرو عبد الحميد',
                    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1564602497i/53140733.jpg',
                    totalPages: 10
                },
                'OL3': {
                    title: 'الأسود يليق بك',
                    author: 'أحلام مستغانمي',
                    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1385733851i/733257.jpg',
                    totalPages: 8
                },
                'OL4': {
                    title: 'يوتوبيا',
                    author: 'أحمد خالد توفيق',
                    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348262322i/6562121.jpg',
                    totalPages: 10
                },
                'OL5': {
                    title: 'ساق البامبو',
                    author: 'سعود السنعوسي',
                    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1361568348i/17253236.jpg',
                    totalPages: 9
                },
                'OL6': {
                    title: 'عزازيل',
                    author: 'يوسف زيدان',
                    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388338863i/6399127.jpg',
                    totalPages: 11
                },
                // إضافة كتب من API
                'wrOQLV6xB-wC': {
                    title: 'ثلاثية غرناطة',
                    author: 'رضوى عاشور',
                    cover: 'https://covers.openlibrary.org/b/id/10502091-M.jpg',
                    totalPages: 12
                },
                'zyTCAlFPjgYC': {
                    title: 'الأسود يليق بك',
                    author: 'أحلام مستغانمي',
                    cover: 'https://covers.openlibrary.org/b/id/10502093-M.jpg',
                    totalPages: 8
                },
                '1q_xAwAAQBAJ': {
                    title: 'يوتوبيا',
                    author: 'أحمد خالد توفيق',
                    cover: 'https://covers.openlibrary.org/b/id/10502094-M.jpg',
                    totalPages: 10
                }
            };

            this.bookData = booksData[bookId] || booksData['OL1'];
            this.totalPages = this.bookData.totalPages;
        }

        // تحديث واجهة الكتاب
        this.updateBookUI();
    }

    // تحديث واجهة الكتاب
    updateBookUI() {
        if (!this.bookData) return;

        const bookTitle = document.getElementById('book-title');
        const bookAuthor = document.getElementById('book-author');
        const bookCover = document.getElementById('book-cover');

        if (bookTitle) bookTitle.textContent = this.bookData.title;
        if (bookAuthor) bookAuthor.textContent = `المؤلف: ${this.bookData.author}`;
        
        if (bookCover) {
            bookCover.src = this.bookData.cover;
            bookCover.alt = this.bookData.title;
            bookCover.onerror = function() {
                this.src = 'images/book_cover_placeholder.jpg';
            };
        }
    }

    // تحميل محتوى الكتاب الحقيقي
    async loadBookContent() {
        try {
            this.bookContent = this.generateRealBookContent();
            this.totalPages = this.bookContent.length;
            console.log("Book content loaded:", this.bookContent.length, "pages");
        } catch (error) {
            console.error("Error loading book content:", error);
            this.bookContent = this.getDefaultContent();
            this.totalPages = this.bookContent.length;
        }
    }

    // إنشاء محتوى حقيقي للكتب حسب ID
    generateRealBookContent() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get("id");

        console.log("Generating content for book ID:", bookId);

        const bookContents = {
            'OL1': this.getGranadaTrilogyContent(),
            'OL2': this.getZikolaLandContent(),
            'OL3': this.getBlackSuitsYouContent(),
            'OL4': this.getUtopiaContent(),
            'OL5': this.getBambooStalkContent(),
            'OL6': this.getAzazeelContent(),
            // محتوى للكتب من API
            'wrOQLV6xB-wC': this.getGranadaTrilogyContent(),
            'zyTCAlFPjgYC': this.getBlackSuitsYouContent(),
            '1q_xAwAAQBAJ': this.getUtopiaContent()
        };

        return bookContents[bookId] || this.getDefaultContent();
    }

    // محتوى افتراضي إذا لم يتم العثور على الكتاب
    getDefaultContent() {
        console.log("Using default content");
        return [
            {
                title: 'الفصل الأول',
                content: `
                    <h2>بداية الرحلة</h2>
                    <p class="chapter-start">بدأت القصة في يوم مشمس من أيام الربيع...</p>
                    <p>كان البطل واقفاً على شرفة منزله يتأمل الأفق البعيد. في قلبه أحلام كبيرة، وفي عينيه أمل لا ينضب.</p>
                    <p>"اليوم سأبدأ رحلتي" همس لنفسه وهو يعدل حقيبته.</p>
                    <p>كان يعرف أن الطريق لن يكون مفروشاً بالورود، لكن إيمانه بقدراته كان أقوى من أي خوف.</p>
                    <p>سمع صوت أمه من الداخل: "لا تنس أن تأكل جيداً قبل أن تذهب!"</p>
                    <p>ابتسم وهو يتذكر دائماً حرصها عليه. "لا تقلقي يا أمي، سأعود إليك منتصراً."</p>
                `,
                readingTime: 4
            },
            {
                title: 'لقاء القدر',
                content: `
                    <h2>لقاء القدر</h2>
                    <p class="chapter-start">في الطريق، التقى بشخص غريب سيغير حياته إلى الأبد...</p>
                    <p>كان الرجل العجوز جالساً تحت شجرة كبيرة، يقرأ في كتاب قديم. نظراته تحمل حكمة القرون.</p>
                    <p>"أتعرف لماذا تتجه إلى هناك؟" سأله الرجل دون أن يرفع عينيه عن الكتاب.</p>
                    <p>تفاجأ البطل من السؤال. "كيف عرفت أن لي وجهة محددة؟"</p>
                    <p>"أرى في عينيك ذلك البريق الخاص. بريق الباحث عن الحقيقة."</p>
                    <p>أخرج الرجل من جيبه قلادة غريبة وأعطاها للبطل. "هذه ستساعدك في رحلتك."</p>
                    <p>قبل أن يسأله عن معنى ذلك، اختفى الرجل العجوز كما لو كان سراباً.</p>
                `,
                readingTime: 5
            },
            {
                title: 'المغامرة تبدأ',
                content: `
                    <h2>المغامرة تبدأ</h2>
                    <p class="chapter-start">مع كل خطوة كان البطل يشعر بقوة غريبة تتدفق في جسده...</p>
                    <p>القلادة التي أعطاها إياه الرجل العجوز كانت تتوهج بضوء خافت. كان يشعر أنها تربطه بشيء أكبر من نفسه.</p>
                    <p>"ما هذا السر العظيم الذي أبحث عنه؟" تساءل وهو يمشي في الطريق الترابي.</p>
                    <p>فجأة، سمع صوتاً يأتي من الغابة. كان صوتاً جميلاً، كأنه أغنية قديمة تروي قصة منسية.</p>
                    <p>اتبع الصوت ليجد نفسه أمام شجرة عملاقة، في جذعها باب صغير من الخشب المنحوت.</p>
                    <p>"هل هذا هو الباب الذي كنت أبحث عنه؟" همس وهو يمد يده نحو المقبض الخشبي.</p>
                `,
                readingTime: 4
            }
        ];
    }

    // محتوى ثلاثية غرناطة (12 صفحة)
    getGranadaTrilogyContent() {
        return [
            {
                title: 'الجزء الأول: غرناطة',
                content: `
                    <h2>غرناطة</h2>
                    <p class="chapter-start">في تلك الأيام الأخيرة من غرناطة، كانت المدينة تتنفس هواءً ثقيلاً...</p>
                    <p>كان أبو جعفر الوراق يجلس في دكانه الصغير بالقرب من باب الإرادة، ينسخ مخطوطة قديمة بينما كانت أصوات الباعة تملأ السوق. كانت يداه ترتعشان قليلاً وهو يمسك بالقلم، ليس من الشيخوخة فقط، بل من ثقل ما يكتب.</p>
                    <p>"يا أبا جعفر، أتسمع الأخبار؟" دخل عليه الشاب علي بن محمد، وجهه شاحب وعيناه تحملان نظرة القلق.</p>
                    <p>"أي أخبار تعني يا بني؟ الأخبار هذه الأيام كلها مرّة كالعلقم."</p>
                    <p>"يقال أن الملك أبو عبد الله يسلم المدينة للإفرنج! يقال أن المفاوضات على أشدها!"</p>
                    <p>سكت أبو جعفر لحظة، ثم وضع القلم جانباً. عيناه الزرقاوتان تحدقان في الفراغ وكأنه يرى مستقبلاً أسود يقترب.</p>
                    <p>"الزمن يدور دورته يا بني. كنا هنا قبل ثمانية قرون، وبقينا. ولكن هذه المرة... هذه المرة أشعر أن النهاية مختلفة."</p>
                `,
                readingTime: 5
            },
            {
                title: 'حكاية عائلة',
                content: `
                    <h2>حكاية عائلة</h2>
                    <p class="chapter-start">كانت فاطمة تعد الطعام في البيت القديم الذي ورثته عن أبيها...</p>
                    <p>كان البيت يطل على حديقة البرتقال، وتنبعث رائحة الياسمين من النافذة المفتوحة. كانت تسمع أصوات الأطفال يلعبون في الحارة، ولكن قلبها كان ثقيلاً.</p>
                    <p>"يا أم حسن، سمعتِ الخبر؟" دخلت الجارة سلمى وهي تحمل سلة خبز.</p>
                    <p>"أي خبر يا سلمى؟ الأخبار هذه الأيام كثرت وأصبحت لا أعرف أيها أصدق."</p>
                    <p>"يقال أننا سنضطر لترك بيوتنا! يقال أن الإفرنج لن يسمحوا لنا بالبقاء!"</p>
                    <p>ارتجفت يد فاطمة وهي تمسك بالملعقة الخشبية. نظرت إلى أولادها الأربعة يلعبون في الفناء، وتساءلت في نفسها: إلى أين سنذهب؟ وماذا سيكون مصيرنا؟</p>
                `,
                readingTime: 6
            },
            {
                title: 'ليلة الوداع',
                content: `
                    <h2>ليلة الوداع</h2>
                    <p class="chapter-start">في تلك الليلة، اجتمع أهالي الحارة في بيت أبي جعفر...</p>
                    <p>كان الجو ثقيلاً داخل البيت، والوجوه شاحبة، والعيون تحمل نظرات مختلطة بين الخوف والحزن والغضب.</p>
                    <p>"سمعت من ابن عمي الذي يعمل في القصر أن الاتفاقية تمت. سنسلم المدينة في الثاني من يناير."</p>
                    <p>صمت مطبق ساد الغرفة. ثم انفجرت إحدى النساء بالبكاء.</p>
                    <p>"بيتي... حديقتى... قبور أجدادي... كيف نترك كل هذا؟"</p>
                    <p>نهض أبو جعفر ببطء، متكئاً على عصاه. "اسمعوا يا جيراني وأحبابي. غرناطة ليست حجارة وشوارع، غرناطة في قلوبنا. طالما نحن أحياء، ستظل غرناطة حية."</p>
                `,
                readingTime: 7
            }
        ];
    }

    // محتوى أرض زيكولا
    getZikolaLandContent() {
        return [
            {
                title: 'اكتشاف الأرض الغامضة',
                content: `
                    <h2>اكتشاف الأرض الغامضة</h2>
                    <p class="chapter-start">كان العالم الدكتور ناصر يقف في مختبره المتقدم، يحدق في الشاشة التي تعرض بيانات غريبة...</p>
                    <p>"هذا مستحيل!" همس لنفسه وهو يعدل النظارات على عينيه. "الطاقة المنبعثة من هذه البقعة تتجاوز كل ما نعرفه!"</p>
                    <p>كان يدرس منطقة نائية في صحراء الربع الخالي، حيث رصدت الأقمار الصناعية نشاطاً طاقوياً غريباً.</p>
                    <p>"دكتور ناصر، الرئيس يطلبك على الخط الأحمر." دخل المساعد الشاب مازن وهو يحمل جهاز اتصال.</p>
                    <p>أخذ ناصر الجهاز بيد مرتعشة. "نعم سيادة الرئيس..."</p>
                    <p>"دكتور، ما هذا الذي اكتشفته؟ التقارير تقول أنك وجدت مصدر طاقة غير مسبوق!"</p>
                    <p>"نعم سيادة الرئيس، لكني أخشى أن هذا الاكتشاف قد يكون أخطر مما نتصور..."</p>
                `,
                readingTime: 4
            }
        ];
    }

    // محتوى الأسود يليق بك
    getBlackSuitsYouContent() {
        return [
            {
                title: 'لقاء القدر',
                content: `
                    <h2>لقاء القدر</h2>
                    <p class="chapter-start">كانت ليلى تقف في مرسمها، تخلط الألوان بيد مرتعشة...</p>
                    <p>كانت الشمس تغرب خلف جبال الأطلس، تاركة خلفها لوحة من الألوان الذهبية والحمراء. كانت تحاول التقاط هذا الجمال في لوحتها، لكن شيئاً ما كان ينقصها.</p>
                    <p>"لماذا أشعر أن حياتي ناقصة؟" همست لنفسها وهي تنظف فرشاتها.</p>
                    <p>كان الهاتف يرن في الغرفة المجاورة. ترددت قليلاً قبل أن ترفع السماعة.</p>
                    <p>"ليلى؟ إنه كريم. عدت إلى الجزائر."</p>
                    <p>ارتجفت يدها وكادت تسقط السماعة. كريم... الحب الأول، الثوري المثالي الذي تركها منذ عشر سنوات ليلتحق بالثورة.</p>
                `,
                readingTime: 5
            }
        ];
    }

    // محتوى يوتوبيا
    getUtopiaContent() {
        return [
            {
                title: 'المدينة الفاضلة',
                content: `
                    <h2>المدينة الفاضلة</h2>
                    <p class="chapter-start">كان عام 2023، وكانت مصر قد انقسمت إلى عالمين منفصلين تماماً...</p>
                    <p>من ناحية، كانت "يوتوبيا" - المدينة المحصنة حيث يعيش الأغنياء في ترف لا يصدق. ومن ناحية أخرى، كانت "المنطقة" - حيث يعيش باقي الشعب في فقر وبؤس.</p>
                    <p>"لماذا نعيش في هذه الفقاعة؟" سأل أحمد صديقه خالد بينما كانا يتجولان في المركز التجاري الفاخر.</p>
                    <p>"لأن هذا هو الثمن الذي ندفعه للأمان، يا صديقي. هناك في الخارج، العالم أصبح غابة."</p>
                `,
                readingTime: 6
            }
        ];
    }

    displayCurrentPage() {
        console.log("Displaying page:", this.currentPage, "Total pages:", this.totalPages);
        
        if (this.bookContent.length === 0) {
            console.log("No content available, loading default content");
            this.bookContent = this.getDefaultContent();
            this.totalPages = this.bookContent.length;
        }

        const page = this.bookContent[this.currentPage - 1];
        if (!page) {
            console.error("Page not found:", this.currentPage - 1);
            this.showReaderNotification("الصفحة غير موجودة", "error");
            return;
        }

        const pageContent = document.getElementById('page-content');
        const pageCounter = document.getElementById('page-counter');
        const readingTime = document.getElementById('reading-time');

        if (pageContent) {
            pageContent.innerHTML = page.content;
            console.log("Content set for page:", this.currentPage);
        } else {
            console.error("Page content element not found");
        }

        if (pageCounter) {
            pageCounter.textContent = `الصفحة ${this.currentPage} من ${this.totalPages}`;
        }

        if (readingTime) {
            readingTime.textContent = `وقت القراءة المتوقع: ${page.readingTime} دقائق`;
        }

        this.applyPageTurnAnimation();
        this.updateProgress();
        this.updateNavigationButtons();
        this.updateBookmarkButton();
    }

    // تأثير تحويل الصفحة
    applyPageTurnAnimation() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.classList.remove('page-turn');
        void content.offsetWidth; // إعادة التدفق
        content.classList.add('page-turn');
    }

    // تحديث التقدم
    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = (this.currentPage / this.totalPages) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    // تحديث أزرار التنقل
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.style.opacity = this.currentPage === 1 ? '0.5' : '1';
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === this.totalPages;
            nextBtn.style.opacity = this.currentPage === this.totalPages ? '0.5' : '1';
        }
    }

    // تحديث زر الإشارة المرجعية
    updateBookmarkButton() {
        const bookmarkBtn = document.querySelector('.control-btn:nth-child(1)');
        if (bookmarkBtn) {
            const hasBookmark = this.bookmarks.some(b => b.page === this.currentPage);
            bookmarkBtn.classList.toggle('active', hasBookmark);
            bookmarkBtn.innerHTML = hasBookmark ? 
                '<i class="fas fa-bookmark"></i>' : 
                '<i class="far fa-bookmark"></i>';
        }
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // أزرار التنقل
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        // زر العودة
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => this.goBack());
        }

        // زر الإعدادات
        const settingsButton = document.querySelector('.settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => this.toggleSettings());
        }

        this.setupControlButtons();
        this.setupReaderSettings();
    }

    // إعداد أزرار التحكم
    setupControlButtons() {
        const controls = document.querySelectorAll('.control-btn');
        controls.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                switch(index) {
                    case 0: this.toggleBookmark(); break;
                    case 1: this.toggleNightMode(); break;
                    case 2: this.shareBook(); break;
                }
            });
        });
    }

    // إعداد إعدادات القارئ
    setupReaderSettings() {
        const fontSizeInput = document.getElementById('font-size');
        const lineHeightInput = document.getElementById('line-height');

        if (fontSizeInput) {
            fontSizeInput.value = this.settings.fontSize;
            fontSizeInput.addEventListener('input', (e) => {
                this.changeFontSize(e.target.value);
            });
        }

        if (lineHeightInput) {
            lineHeightInput.value = this.settings.lineHeight;
            lineHeightInput.addEventListener('input', (e) => {
                this.changeLineHeight(e.target.value);
            });
        }
    }

    // إعداد التنقل باللوحة المفاتيح
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousPage();
                    break;
                case 'Escape':
                    this.toggleSettings();
                    break;
                case 'b':
                case 'B':
                    e.preventDefault();
                    this.toggleBookmark();
                    break;
                case 'n':
                case 'N':
                    e.preventDefault();
                    this.toggleNightMode();
                    break;
            }
        });
    }

    // الصفحة التالية
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.displayCurrentPage();
            this.saveProgress();
        } else {
            this.showReaderNotification("آخر صفحة في الكتاب", "info");
        }
    }

    // الصفحة السابقة
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayCurrentPage();
            this.saveProgress();
        } else {
            this.showReaderNotification("أنت في الصفحة الأولى", "info");
        }
    }

    // تبديل الإعدادات
    toggleSettings() {
        const settings = document.getElementById('reader-settings');
        if (settings) {
            settings.classList.toggle('show');
        }
    }

    // تغيير حجم الخط
    changeFontSize(size) {
        this.settings.fontSize = parseInt(size);
        const content = document.getElementById('page-content');
        if (content) {
            content.style.fontSize = size + 'px';
        }
        
        const fontSizeValue = document.getElementById('font-size-value');
        if (fontSizeValue) {
            fontSizeValue.textContent = size + 'px';
        }
        
        this.saveSettings();
    }

    // تغيير تباعد الأسطر
    changeLineHeight(height) {
        this.settings.lineHeight = parseFloat(height);
        const content = document.getElementById('page-content');
        if (content) {
            content.style.lineHeight = height;
        }
        
        const lineHeightValue = document.getElementById('line-height-value');
        if (lineHeightValue) {
            lineHeightValue.textContent = height;
        }
        
        this.saveSettings();
    }

    // تبديل الوضع الليلي
    toggleNightMode() {
        this.settings.nightMode = !this.settings.nightMode;
        document.body.classList.toggle('reader-night-mode', this.settings.nightMode);
        
        const nightModeBtn = document.querySelector('.control-btn:nth-child(2)');
        if (nightModeBtn) {
            nightModeBtn.classList.toggle('active', this.settings.nightMode);
            nightModeBtn.innerHTML = this.settings.nightMode ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        }
        
        this.showReaderNotification(`تم ${this.settings.nightMode ? 'تفعيل' : 'إلغاء'} الوضع الليلي`);
        this.saveSettings();
    }

    // تبديل الإشارة المرجعية
    toggleBookmark() {
        const existingBookmarkIndex = this.bookmarks.findIndex(b => b.page === this.currentPage);
        
        if (existingBookmarkIndex > -1) {
            this.removeBookmark(this.currentPage);
        } else {
            this.addBookmark();
        }
    }

    // إضافة إشارة مرجعية
    addBookmark() {
        const page = this.bookContent[this.currentPage - 1];
        if (!page) return;

        this.bookmarks.push({
            page: this.currentPage,
            title: page.title,
            timestamp: new Date().toISOString()
        });

        this.saveBookmarks();
        this.updateBookmarkButton();
        this.showReaderNotification('تم إضافة إشارة مرجعية للصفحة الحالية ✓');
    }

    // إزالة إشارة مرجعية
    removeBookmark(pageNumber) {
        this.bookmarks = this.bookmarks.filter(b => b.page !== pageNumber);
        this.saveBookmarks();
        this.updateBookmarkButton();
        this.showReaderNotification('تم إزالة الإشارة المرجعية');
    }

    // مشاركة الكتاب
    shareBook() {
        if (navigator.share) {
            navigator.share({
                title: 'أقرأ على لوميناريا',
                text: `أقرأ حالياً: ${this.bookData?.title || 'كتاب رائع'}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showReaderNotification('تم نسخ الرابط إلى الحافظة ✓');
            });
        }
    }

    // العودة
    goBack() {
        // مسح البيانات المؤقتة عند العودة
        localStorage.removeItem('selectedBookForReader');
        
        if (document.referrer && document.referrer.includes(window.location.hostname)) {
            window.history.back();
        } else {
            window.location.href = 'book-details.html?id=' + (new URLSearchParams(window.location.search).get('id') || '');
        }
    }

    // تحميل الإعدادات
    loadSettings() {
        const saved = localStorage.getItem('readerSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            console.log("Loaded settings:", this.settings);
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        }
    }

    // حفظ الإعدادات
    saveSettings() {
        localStorage.setItem('readerSettings', JSON.stringify(this.settings));
    }

    // تحميل الإشارات المرجعية
    loadBookmarks() {
        const saved = localStorage.getItem('readerBookmarks');
        if (saved) {
            try {
                this.bookmarks = JSON.parse(saved);
                console.log("Loaded bookmarks:", this.bookmarks.length);
            } catch (error) {
                console.error("Error loading bookmarks:", error);
            }
        }
    }

    // حفظ الإشارات المرجعية
    saveBookmarks() {
        localStorage.setItem('readerBookmarks', JSON.stringify(this.bookmarks));
    }

    // حفظ التقدم
    saveProgress() {
        const bookId = new URLSearchParams(window.location.search).get('id');
        const progress = {
            currentPage: this.currentPage,
            lastRead: new Date().toISOString(),
            bookId: bookId
        };
        localStorage.setItem('readingProgress_' + bookId, JSON.stringify(progress));
    }

    // تحميل التقدم
    loadProgress() {
        const bookId = new URLSearchParams(window.location.search).get('id');
        const saved = localStorage.getItem('readingProgress_' + bookId);
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                if (progress.bookId === bookId && progress.currentPage) {
                    this.currentPage = Math.min(progress.currentPage, this.totalPages);
                    console.log("Loaded progress:", this.currentPage);
                }
            } catch (error) {
                console.error("Error loading progress:", error);
            }
        }
    }

    // تطبيق الإعدادات
    applySettings() {
        const content = document.getElementById('page-content');
        if (content) {
            content.style.fontSize = this.settings.fontSize + 'px';
            content.style.lineHeight = this.settings.lineHeight;
        }
        
        if (this.settings.nightMode) {
            document.body.classList.add('reader-night-mode');
        }

        // تحديث قيم الإعدادات في الواجهة
        const fontSizeValue = document.getElementById('font-size-value');
        const lineHeightValue = document.getElementById('line-height-value');
        
        if (fontSizeValue) fontSizeValue.textContent = this.settings.fontSize + 'px';
        if (lineHeightValue) lineHeightValue.textContent = this.settings.lineHeight;
    }

    // عرض إشعارات القارئ
    showReaderNotification(message, type = 'info') {
        // إزالة أي إشعارات سابقة
        const existingNotification = document.querySelector('.reader-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };

        const notification = document.createElement('div');
        notification.className = 'reader-notification';
        notification.innerHTML = `
            <div class="reader-notification-content">
                <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// إضافة أنماط CSS للقارئ
const readerStyles = document.createElement('style');
readerStyles.textContent = `
    .reader-notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 1rem 1.5rem;
        color: white;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        backdrop-filter: blur(20px);
        min-width: 300px;
    }
    
    .reader-notification.show {
        transform: translateX(0);
    }
    
    .reader-notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .reader-notification .fa-check-circle {
        color: #10b981;
    }
    
    .reader-notification .fa-exclamation-circle {
        color: #ef4444;
    }
    
    .reader-notification .fa-info-circle {
        color: #3b82f6;
    }
    
    .page-turn {
        animation: pageTurn 0.3s ease;
    }
    
    @keyframes pageTurn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .control-btn.active {
        color: var(--primary-gold);
    }
    
    .reader-settings.show {
        display: block;
    }
`;

document.head.appendChild(readerStyles);

// تهيئة القارئ عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Book Reader...");
    const reader = new BookReader();
    
    // جعل الدوال متاحة globally للاستخدام في HTML
    window.reader = reader;
    window.toggleSettings = () => reader.toggleSettings();
    window.previousPage = () => reader.previousPage();
    window.nextPage = () => reader.nextPage();
    window.toggleBookmark = () => reader.toggleBookmark();
    window.toggleNightMode = () => reader.toggleNightMode();
    window.shareBook = () => reader.shareBook();
});