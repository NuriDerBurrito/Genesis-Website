document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Preloader ---
    const loader = document.getElementById('page-loader');
    if (loader) {
        window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 500));
    }

    // --- 2. Discord ---
    document.querySelectorAll('.discord-link').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); alert("Discord Community Coming Soon!"); });
    });

    // --- 3. Load Posts ---
    if (document.querySelector('.hero-section') || document.getElementById('posts-container')) {
        fetch('data/posts.json')
            .then(response => response.json())
            .then(posts => {
                posts.sort((a, b) => b.id.localeCompare(a.id));
                if (document.querySelector('.hero-section')) initSlider(posts.slice(0, 5));
                if (document.getElementById('posts-container')) loadPostsPage(posts);
            })
            .catch(err => console.error("Error loading posts:", err));
    }
});

// --- Name Mapping (UPDATED) ---
const authorNameMap = {
    'nuri': 'NuriDerBurrito',
    'adriana': 'Adriana Audrie', // FIXED KEY & NAME
    'nightmelody': 'Nightmelody'
};

// --- GLOBAL TIMER VARIABLE ---
let autoPlayInterval;

// --- GLOBAL RESET FUNCTION (FIXED SCOPE) ---
function resetTimer() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => changeSlide(1), 7000);
}

// --- Slider Logic (New Layout) ---
function initSlider(posts) {
    const sliderContainer = document.querySelector('.hero-section');
    
    sliderContainer.innerHTML = '';

    const barLeft = document.createElement('div');
    barLeft.className = 'slider-bar-left';

    const stage = document.createElement('div');
    stage.className = 'slider-stage';

    const barRight = document.createElement('div');
    barRight.className = 'slider-bar-right';

    const leftArrowSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    const rightArrowSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'slider-btn prev-btn';
    prevBtn.setAttribute('aria-label', 'Previous Slide');
    prevBtn.innerHTML = leftArrowSvg;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'slider-btn next-btn';
    nextBtn.setAttribute('aria-label', 'Next Slide');
    nextBtn.innerHTML = rightArrowSvg;

    barLeft.appendChild(prevBtn);
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'slider-pagination';
    barRight.appendChild(paginationContainer);
    barRight.appendChild(nextBtn);

    sliderContainer.appendChild(barLeft);
    sliderContainer.appendChild(stage);
    sliderContainer.appendChild(barRight);

    const slidePromises = posts.map((post, index) => {
        return new Promise((resolve) => {
            const slide = document.createElement('div');
            slide.className = index === 0 ? 'slide active' : 'slide';
            slide.dataset.theme = post.author_talent;
            slide.dataset.index = index;
            
            slide.innerHTML = `
                <div class="slide-split-left">
                    <img src="${post.image}" class="slide-image" alt="${post.title}">
                    <div class="blade-fade"></div> 
                </div>
                <div class="slide-split-right">
                    <div class="slide-content">
                        <div class="slide-date">${post.date}</div>
                        <h2 class="slide-title">${post.title}</h2>
                        <p class="slide-desc">${post.description}</p>
                        <a href="posts/${post.id}.html" class="read-more">Read More &rarr;</a>
                    </div>
                </div>
            `;
            
            stage.appendChild(slide);

            const diamond = document.createElement('div');
            diamond.className = `paginate-diamond ${index === 0 ? 'active' : ''}`;
            diamond.dataset.targetIndex = index;
            
            diamond.addEventListener('click', () => {
                const current = parseInt(document.querySelector('.slide.active').dataset.index);
                const target = parseInt(diamond.dataset.targetIndex);
                const diff = target - current;
                changeSlide(diff);
                resetTimer(); // Reset timer when user clicks a diamond
            });

            paginationContainer.appendChild(diamond);

            const img = slide.querySelector('.slide-image');
            if(img.complete) { resolve(); } else { img.onload = () => resolve(); }
        });
    });

    Promise.all(slidePromises).then(() => {
        updateThemeSmoothly(posts[0].author_talent);
        
        prevBtn.addEventListener('click', () => { changeSlide(-1); resetTimer(); });
        nextBtn.addEventListener('click', () => { changeSlide(1); resetTimer(); });

        startSlideShow();
    });
}

function startSlideShow() {
    const slides = document.querySelectorAll('.slide');
    const pagers = document.querySelectorAll('.paginate-diamond');
    if (slides.length === 0) return;
    
    let currentSlide = 0;

    window.changeSlide = (direction) => {
        slides[currentSlide].classList.remove('active');
        pagers[currentSlide].classList.remove('active');

        currentSlide = (currentSlide + direction + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        pagers[currentSlide].classList.add('active');

        updateThemeSmoothly(slides[currentSlide].dataset.theme);
    };

    resetTimer();
}

// --- SMOOTH THEME UPDATE SYSTEM ---
let nextLayerShouldBeLayer1 = true; 

function updateThemeSmoothly(talent) {
    const layer1 = document.getElementById('bg-layer-1');
    const layer2 = document.getElementById('bg-layer-2');
    
    const currentVisibleLayer = (layer1.classList.contains('active')) ? layer1 : layer2;
    const nextLayer = nextLayerShouldBeLayer1 ? layer1 : layer2;

    nextLayer.className = 'bg-layer'; 
    if (talent) nextLayer.classList.add(`theme-${talent}`);
    
    document.body.className = ''; 
    if (talent) document.body.classList.add(`theme-${talent}`);

    nextLayer.classList.add('active');
    currentVisibleLayer.classList.remove('active');

    nextLayerShouldBeLayer1 = !nextLayerShouldBeLayer1;
}

// --- Posts Page List Logic ---
function loadPostsPage(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = ''; 
    posts.forEach(post => {
        const a = document.createElement('a'); 
        a.href = `posts/${post.id}.html`;
        a.className = 'post-item';
        a.setAttribute('data-author', post.author_talent); 
        
        const displayName = authorNameMap[post.author_talent] || post.author_talent;
        
        a.innerHTML = `
            <img src="${post.image}" class="post-thumb" alt="${post.title}">
            <div class="post-info">
                <div class="post-date">${post.date} | ${displayName.toUpperCase()}</div>
                <h3>${post.title}</h3>
                <p>${post.description}</p>
            </div>
        `;
        container.appendChild(a);
    });
}

// --- Talent Modal Logic (UPDATED NAMES & SPRITE PATHS) ---
function openTalentModal(talentKey) {
    const modal = document.getElementById('talent-modal');
    const modalImg = document.getElementById('modal-sprite');
    const modalName = document.getElementById('modal-name');
    const modalBio = document.getElementById('modal-bio');
    const modalLinks = document.getElementById('modal-links');
    const modalContent = document.querySelector('.modal-content');

    const talentData = {
        'nuri': { 
            name: 'NuriDerBurrito', 
            bio: 'The Origin. Founder of Genesis Iterations. And the talent behind model creation and creative outlook, retired 3d modeler and animator.', 
            sprite: 'assets/images/nuri_sprite.png', 
            links: [
                { name: 'HuggingFace', url: 'https://huggingface.co/NuriDerBurrito', icon: 'assets/logos/huggingface.png' }, 
                { name: 'Github', url: 'https://github.com/elder-plinius/L1B3RT4S', icon: 'assets/logos/github.png' },
                { name: 'Civitai', url: 'https://civitai.com/user/NuriDerBurrito', icon: 'assets/logos/civitai.png' },
                { name: 'Youtube', url: 'https://www.youtube.com/@nurimations', icon: 'assets/logos/youtube.png' }
            ] 
        },
        'adriana': { 
            name: 'Adriana Audrie', 
            bio: 'The AI Artistry Specialist & Prompt engineer. Curating generative art and digital aesthetics.', 
            sprite: 'assets/images/adriana_sprite.png', 
            links: [
                { name: 'Pixiv', url: 'https://www.pixiv.net/en/users/88271604', icon: 'assets/logos/Pixiv.png' }, 
                { name: 'X / Twitter', url: 'https://x.com/AdrianaAudrie', icon: 'assets/logos/xitter.png' },
                { name: 'Patreon', url: 'https://www.patreon.com/c/AUDRIEAI', icon: 'assets/logos/patreon.png' }
            ] 
        },
        'nightmelody': { 
            name: 'Nightmelody', 
            bio: 'Inactive , AI music creator.', 
            sprite: 'assets/images/placeholder_sprite.png',
            links: [
                { name: 'YouTube', url: 'https://www.youtube.com/@JustNightmelody', icon: 'assets/logos/youtube.png' }
            ] 
        }
    };

    const data = talentData[talentKey];
    if (!data) return;

    modalImg.src = data.sprite;
    modalName.innerText = data.name;
    modalBio.innerText = data.bio;
    modalLinks.innerHTML = '';
    data.links.forEach(link => {
        const btn = document.createElement('a');
        btn.href = link.url; 
        btn.target = '_blank';
        btn.className = 'social-btn';
        
        if(link.icon) {
            btn.innerHTML = `<img src="${link.icon}" class="btn-icon"> <span>${link.name}</span>`;
        } else {
            btn.innerText = link.name;
        }
        
        modalLinks.appendChild(btn);
    });

    modal.style.display = 'flex';
    modalContent.classList.remove('closing');
}

function closeTalentModal() {
    const modal = document.getElementById('talent-modal');
    const modalContent = document.querySelector('.modal-content');
    
    modalContent.classList.add('closing');

    setTimeout(() => {
        modal.style.display = 'none';
        modalContent.classList.remove('closing');
    }, 300); 
}