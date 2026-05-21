// script.js

// --- SYSTÈME DE TRADUCTION ---
let currentLang = localStorage.getItem('site_lang') || 'fr';

// --- DONNÉES DES FORMATIONS ---
const coursesData = [
    { id: 'img-c1', titleKey: 'c1_title', descKey: 'c1_desc', timeKey: 'c1_time', levelKey: 'c1_level', icon: 'fa-code', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', badge: 'badge_popular', infoTitle: 'info_c1_title', infoDesc: 'info_c1_desc' },
    { id: 'img-c2', titleKey: 'c2_title', descKey: 'c2_desc', timeKey: 'c2_time', levelKey: 'c2_level', icon: 'fa-terminal', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', infoTitle: 'info_c2_title', infoDesc: 'info_c2_desc' },
    { id: 'img-maintenance', titleKey: 'c3_title', descKey: 'c3_desc', timeKey: 'c3_time', levelKey: 'c3_level', icon: 'fa-screwdriver-wrench', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', infoTitle: 'info_c3_title', infoDesc: 'info_c3_desc' },
    { id: 'img-c4', titleKey: 'c4_title', descKey: 'c4_desc', timeKey: 'c4_time', levelKey: 'c4_level', icon: 'fa-file-word', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', infoTitle: 'info_c4_title', infoDesc: 'info_c4_desc' },
    { id: 'img-c5', titleKey: 'c5_title', descKey: 'c5_desc', timeKey: 'c5_time', levelKey: 'c5_level', icon: 'fa-computer-mouse', img: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', infoTitle: 'info_c5_title', infoDesc: 'info_c5_desc' },
    { id: 'img-c6', titleKey: 'c6_title', descKey: 'c6_desc', timeKey: 'c6_time', levelKey: 'c6_level', icon: 'fa-database', img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', infoTitle: 'info_c6_title', infoDesc: 'info_c6_desc' },
    { id: 'img-c7', titleKey: 'c7_title', descKey: 'c7_desc', timeKey: 'c7_time', levelKey: 'c7_level', icon: 'fa-server', img: 'bts_reseaux.png', infoTitle: 'info_c7_title', infoDesc: 'info_c7_desc' },
    { id: 'img-c8', titleKey: 'c8_title', descKey: 'c8_desc', timeKey: 'c8_time', levelKey: 'c8_level', icon: 'fa-bug', img: 'https://cdn.pixabay.com/photo/2017/01/06/17/49/honey-bee-1958464_1280.jpg', infoTitle: 'info_c8_title', infoDesc: 'info_c8_desc' },
    { id: 'img-c9', titleKey: 'c9_title', descKey: 'c9_desc', timeKey: 'c9_time', levelKey: 'c9_level', icon: 'fa-scissors', img: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', infoTitle: 'info_c9_title', infoDesc: 'info_c9_desc' },
    { id: 'img-c10', titleKey: 'c10_title', descKey: 'c10_desc', timeKey: 'c10_time', levelKey: 'c10_level', icon: 'fa-car-battery', img: 'auto_electricity_training.png', infoTitle: 'info_c10_title', infoDesc: 'info_c10_desc' },
    { id: 'img-c11', titleKey: 'c11_title', descKey: 'c11_desc', timeKey: 'c11_time', levelKey: 'c11_level', icon: 'fa-fire-burner', img: 'welding_training.png', infoTitle: 'info_c11_title', infoDesc: 'info_c11_desc' },
    { id: 'img-c12', titleKey: 'c12_title', descKey: 'c12_desc', timeKey: 'c12_time', levelKey: 'c12_level', icon: 'fa-faucet-drip', img: 'plumbing_gas_training.png', infoTitle: 'info_c12_title', infoDesc: 'info_c12_desc' },
    { id: 'img-c13', titleKey: 'c13_title', descKey: 'c13_desc', timeKey: 'c13_time', levelKey: 'c13_level', icon: 'fa-seedling', img: 'horticulture_training.png', infoTitle: 'info_c13_title', infoDesc: 'info_c13_desc' },
    { id: 'img-c14', titleKey: 'c14_title', descKey: 'c14_desc', timeKey: 'c14_time', levelKey: 'c14_level', icon: 'fa-tree', img: 'taillage_greffage_training.png', infoTitle: 'info_c14_title', infoDesc: 'info_c14_desc' },
    { id: 'img-c15', titleKey: 'c15_title', descKey: 'c15_desc', timeKey: 'c15_time', levelKey: 'c15_level', icon: 'fa-leaf', img: 'pepiniere_arboricole_training.png', infoTitle: 'info_c15_title', infoDesc: 'info_c15_desc' }
];

function setLanguage(lang) {
    if (!translations[lang]) return;
    
    currentLang = lang;
    localStorage.setItem('site_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    
    const langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.innerHTML = translations[lang][key];
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const [attrName, key] = el.getAttribute('data-i18n-attr').split('|');
        if (translations[lang][key]) el.setAttribute(attrName, translations[lang][key]);
    });
}

// --- RENDU DYNAMIQUE DES FORMATIONS ---
function renderCourses() {
    const container = document.getElementById('courses-container');
    if (!container) return;
    
    container.innerHTML = '';
    coursesData.forEach((course, index) => {
        const delayClass = index % 3 === 0 ? '' : `delay-${index % 3}`;
        const badgeHtml = course.badge ? `<span class="course-badge" data-i18n="${course.badge}">${translations[currentLang][course.badge] || 'Info'}</span>` : '';
        
        const card = document.createElement('div');
        card.className = `course-card reveal ${delayClass}`;
        card.innerHTML = `
            <div class="course-img">
                <img id="${course.id}" src="${course.img}" alt="${course.titleKey}" style="cursor: pointer;" title="Cliquez pour plus de détails">
                ${badgeHtml}
            </div>
            <div class="course-body">
                <div class="course-icon"><i class="fa-solid ${course.icon}"></i></div>
                <h3 data-i18n="${course.titleKey}">${translations[currentLang][course.titleKey]}</h3>
                <p data-i18n="${course.descKey}">${translations[currentLang][course.descKey]}</p>
                <ul class="course-features">
                    <li><i class="fa-regular fa-clock"></i> <span data-i18n="${course.timeKey}">${translations[currentLang][course.timeKey]}</span></li>
                    <li><i class="fa-solid fa-signal"></i> <span data-i18n="${course.levelKey}">${translations[currentLang][course.levelKey]}</span></li>
                </ul>
                <button class="btn btn-outline btn-block enroll-btn" data-i18n="btn_enroll">${translations[currentLang].btn_enroll}</button>
            </div>
        `;
        container.appendChild(card);

        // Event listener pour le modal info
        card.querySelector('img').addEventListener('click', () => openInfoModal(course));
        // Event listener pour l'inscription
        card.querySelector('.enroll-btn').addEventListener('click', () => openEnrollModal(course.titleKey));
    });
    
    // Ré-observer les nouveaux éléments créés
    observeNewElements();
}

// --- GESTION DU THÈME ---
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
}

// --- COMPTEURS ANIMÉS ---
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const startCounter = (counter) => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 10);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

// --- MODALS ---
const enrollModal = document.getElementById('enroll-modal');
const infoModal = document.getElementById('info-modal');

function openEnrollModal(courseKey = null) {
    if (!enrollModal) return;
    if (courseKey) {
        const select = document.getElementById('enroll-course');
        if (select) {
            // Chercher l'option qui correspond à la clé de traduction
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].getAttribute('data-i18n') === courseKey) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }
    }
    enrollModal.style.display = 'block';
    setTimeout(() => enrollModal.classList.add('show'), 10);
}

function openInfoModal(course) {
    if (!infoModal) return;
    const title = document.getElementById('info-modal-title');
    const desc = document.getElementById('info-modal-desc');
    const footer = document.getElementById('info-modal-footer');
    
    title.setAttribute('data-i18n', course.infoTitle);
    desc.setAttribute('data-i18n', course.infoDesc);
    title.innerHTML = translations[currentLang][course.infoTitle] || 'Détails';
    desc.innerHTML = translations[currentLang][course.infoDesc] || '';
    
    if (footer) footer.style.display = 'block';
    
    infoModal.style.display = 'block';
    setTimeout(() => infoModal.classList.add('show'), 10);
}

function openArticle(titleKey, descKey) {
    if (!infoModal) return;
    const title = document.getElementById('info-modal-title');
    const desc = document.getElementById('info-modal-desc');
    const footer = document.getElementById('info-modal-footer');
    
    title.setAttribute('data-i18n', titleKey);
    desc.setAttribute('data-i18n', descKey);
    title.innerHTML = translations[currentLang][titleKey] || 'Actualités';
    desc.innerHTML = translations[currentLang][descKey] || '';
    
    if (footer) footer.style.display = 'none';
    
    infoModal.style.display = 'block';
    setTimeout(() => infoModal.classList.add('show'), 10);
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// --- OBSERVATEUR DE REVEAL ---
function observeNewElements() {
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));
}

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    initTheme();
    renderCourses();
    initCounters();

    // Menu Mobile
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
    }

    // Fermer menu mobile au clic
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            }
        });
    });

    // Sticky Header & Active Link
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Événements Langue
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            renderCourses(); // Re-render pour traduire les cartes
        });
    }

    // Modal Close Events
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(enrollModal);
            closeModal(infoModal);
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === enrollModal) closeModal(enrollModal);
        if (e.target === infoModal) closeModal(infoModal);
    });

    // FAQ
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            q.classList.toggle('active');
            const ans = q.nextElementSibling;
            ans.style.maxHeight = ans.style.maxHeight ? null : ans.scrollHeight + "px";
        });
    });

    // Formulaires
    const emailActionUrl = 'https://formsubmit.co/ajax/cfpaderrag1826@gmail.com';
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            fetch(emailActionUrl, { method: 'POST', body: new FormData(contactForm) })
                .then(() => {
                    alert(currentLang === 'fr' ? "Message envoyé !" : "Message sent!");
                    contactForm.reset();
                })
                .finally(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        });
    }

    const enrollForm = document.getElementById('enroll-form');
    if (enrollForm) {
        enrollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = enrollForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            fetch(emailActionUrl, { method: 'POST', body: new FormData(enrollForm) })
                .then(() => {
                    window.location.href = 'https://takwin.dz/';
                })
                .catch(() => {
                    // Redirection même en cas d'erreur de l'API
                    window.location.href = 'https://takwin.dz/';
                });
        });
    }
});

