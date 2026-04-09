document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initHeroSlider();
    initCategoryFilters();
    initMobileMenu();
    initSmoothScroll();
    initAnimations();
});

function initHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length === 0) return;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startAutoplay() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        clearInterval(slideInterval);
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoplay();
            startAutoplay();
        });

        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoplay();
            startAutoplay();
        });
    }

    startAutoplay();

    const sliderContainer = document.querySelector('.hero-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoplay);
        sliderContainer.addEventListener('mouseleave', startAutoplay);
    }
}

function initCategoryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const contentCards = document.querySelectorAll('.content-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;

            contentCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.querySelector('i').classList.add('fa-bars');
                menuToggle.querySelector('i').classList.remove('fa-times');
            });
        });
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.channel-card, .content-card, .pricing-card, .program-card').forEach(card => {
        observer.observe(card);
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
            animation: fadeIn 0.6s ease forwards;
        }
    `;
    document.head.appendChild(style);
}

function searchContent() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                console.log('Searching for:', query);
                alert(`Búsqueda: ${query}`);
            }
        }
    });
}

searchContent();

const channelsData = [
    { id: 1, name: 'Gaama News', number: 'Canal 1', live: true, icon: 'fa-tv' },
    { id: 2, name: 'Gaama Cine', number: 'Canal 2', live: false, icon: 'fa-film' },
    { id: 3, name: 'Gaama Sports', number: 'Canal 3', live: true, icon: 'fa-futbol' },
    { id: 4, name: 'Gaama Music', number: 'Canal 4', live: false, icon: 'fa-music' },
    { id: 5, name: 'Gaama Kids', number: 'Canal 5', live: false, icon: 'fa-child' },
    { id: 6, name: 'Gaama Docs', number: 'Canal 6', live: false, icon: 'fa-book' }
];

function renderChannels() {
    const grid = document.getElementById('channelsGrid');
    if (!grid) return;

    grid.innerHTML = channelsData.map(channel => `
        <div class="channel-card" data-id="${channel.id}">
            <div class="channel-image" style="background: linear-gradient(135deg, var(--gaama-${getRandomColor()}) 0%, var(--gaama-${getRandomColor()}) 100%);">
                <i class="fas ${channel.icon}"></i>
            </div>
            <div class="channel-info">
                <h3>${channel.name}</h3>
                <span class="channel-number">${channel.number}</span>
                ${channel.live ? '<span class="live-badge">EN VIVO</span>' : ''}
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.channel-card').forEach(card => {
        card.addEventListener('click', () => {
            const channelId = card.dataset.id;
            playChannel(channelId);
        });
    });
}

function getRandomColor() {
    const colors = ['secondary', 'tertiary', 'accent', 'primary', 'dark', 'green'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function playChannel(channelId) {
    const channel = channelsData.find(c => c.id === parseInt(channelId));
    if (channel) {
        console.log('Playing channel:', channel.name);
    }
}

const programmingData = [
    { time: '08:00', title: 'Noticias Matutinas', channel: 'Gaama News' },
    { time: '10:00', title: 'Documental Nature', channel: 'Gaama Docs' },
    { time: '12:00', title: 'Película Clásica', channel: 'Gaama Cine' },
    { time: '14:00', title: 'Fútbol en Vivo', channel: 'Gaama Sports' },
    { time: '16:00', title: 'Serie Infantil', channel: 'Gaama Kids' },
    { time: '18:00', title: 'Concierto en Vivo', channel: 'Gaama Music' },
    { time: '20:00', title: 'Película Estreno', channel: 'Gaama Cine' },
    { time: '22:00', title: 'Serie Popular', channel: 'Gaama News' }
];

function renderProgramming() {
    const timeline = document.querySelector('.programming-timeline');
    if (!timeline) return;

    timeline.innerHTML = programmingData.map(program => `
        <div class="time-slot">
            <span class="time">${program.time}</span>
            <div class="program-card">
                <div class="program-image" style="background: var(--gaama-${getRandomColor()});"></div>
                <div class="program-info">
                    <h4>${program.title}</h4>
                    <span>${program.channel}</span>
                </div>
            </div>
        </div>
    `).join('');
}

const pricingPlans = [
    {
        name: 'Básico',
        price: '9.99',
        features: [
            'Acceso a canales básicos',
            'Calidad SD',
            '1 dispositivo',
            'Sin commercials'
        ],
        featured: false
    },
    {
        name: 'Premium',
        price: '19.99',
        features: [
            'Todos los canales',
            'Calidad HD/4K',
            '4 dispositivos',
            'Contenido exclusivo',
            'Descargas offline'
        ],
        featured: true
    },
    {
        name: 'Familia',
        price: '29.99',
        features: [
            'Todos los canales',
            'Calidad 4K HDR',
            'Dispositivos ilimitados',
            'Control parental',
            'Perfiles múltiples'
        ],
        featured: false
    }
];

function handleLogin() {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('Open login modal');
        });
    }

    const registerBtn = document.querySelector('.btn-register');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            console.log('Open register modal');
        });
    }
}

handleLogin();

function initPlayButtons() {
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.content-card');
            const title = card.querySelector('h4').textContent;
            console.log('Playing:', title);
        });
    });
}

initPlayButtons();

const appSection = document.querySelector('.app-section');
if (appSection) {
    appSection.addEventListener('click', (e) => {
        if (e.target.closest('.app-btn')) {
            console.log('Open app store');
        }
    });
}
