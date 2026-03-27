import { planetsData } from './planetsData.js';

// ---- 侧边悬停星球信息面板控制 ----
const infoPanel = document.getElementById('info-panel');

export const updateHoverUI = (data) => {
    document.getElementById('planet-name').textContent = data.zhName;
    document.getElementById('planet-desc').textContent = data.desc;
    document.getElementById('planet-mass').textContent = data.mass;
    document.getElementById('planet-gravity').textContent = data.gravity;
    
    infoPanel.classList.remove('hidden');
    
    if(window.gsap) {
        gsap.killTweensOf(infoPanel);
        gsap.fromTo(infoPanel, 
            { x: 100, opacity: 0, autoAlpha: 0 }, 
            { x: 0, opacity: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.2)' }
        );
    }
};

export const hideHoverUI = () => {
    if(window.gsap && !infoPanel.classList.contains('hidden')) {
        gsap.killTweensOf(infoPanel);
        gsap.to(infoPanel, {
            x: 50, 
            opacity: 0, 
            autoAlpha: 0, 
            duration: 0.4, 
            ease: 'power2.in',
            onComplete: () => infoPanel.classList.add('hidden')
        });
    }
};

// ---- SPA 单页应用模式：导航与图鉴管理 ----
export const initSPA_Navigation = (onPlanetSelect, onSPAStateChange) => {
    const navExplore = document.getElementById('nav-explore');
    const navGallery = document.getElementById('nav-gallery');
    const navAbout = document.getElementById('nav-about');
    const galleryPanel = document.getElementById('gallery-panel');
    const aboutPanel = document.getElementById('about-panel');
    const galleryGrid = document.getElementById('gallery-grid');
    let activeNav = navExplore;

    // 动态生成星系图鉴卡片
    const renderGallery = () => {
        galleryGrid.innerHTML = '';
        planetsData.forEach(data => {
            const card = document.createElement('div');
            card.className = 'planet-card';
            card.innerHTML = `
                <div class="planet-card-title">${data.name.toUpperCase()}</div>
                <div class="planet-card-sub">${data.zhName}</div>
                <div class="planet-card-info">${data.desc}</div>
            `;
            
            card.addEventListener('click', () => {
                switchTab('explore');
                onPlanetSelect(data.id);
            });
            galleryGrid.appendChild(card);
        });
    };
    renderGallery();

    const switchTab = (tabId) => {
        if(activeNav) activeNav.classList.remove('active');
        
        // 淡出当前面板
        if(!galleryPanel.classList.contains('hidden') && tabId !== 'gallery') {
            gsap.to(galleryPanel, {
                opacity: 0, autoAlpha: 0, duration: 0.4, ease: 'power2.in',
                onComplete: () => galleryPanel.classList.add('hidden')
            });
        }
        if(!aboutPanel.classList.contains('hidden') && tabId !== 'about') {
            gsap.to(aboutPanel, {
                opacity: 0, autoAlpha: 0, duration: 0.4, ease: 'power2.in',
                onComplete: () => aboutPanel.classList.add('hidden')
            });
        }

        if (tabId === 'explore') {
            navExplore.classList.add('active');
            activeNav = navExplore;
            onSPAStateChange(true); // enabled controls
        } else if (tabId === 'gallery') {
            navGallery.classList.add('active');
            activeNav = navGallery;
            onSPAStateChange(false); // disable controls
            galleryPanel.classList.remove('hidden');
            gsap.fromTo(galleryPanel, 
                { opacity: 0, autoAlpha: 0, y: 50 },
                { opacity: 1, autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }
            );
            gsap.fromTo('.planet-card', 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(1.5)', delay: 0.2 }
            );
        } else if (tabId === 'about') {
            navAbout.classList.add('active');
            activeNav = navAbout;
            onSPAStateChange(false);
            aboutPanel.classList.remove('hidden');
            gsap.fromTo(aboutPanel, 
                { opacity: 0, autoAlpha: 0, scale: 0.95 },
                { opacity: 1, autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
            );
        }
    };

    navExplore.addEventListener('click', (e) => { e.preventDefault(); switchTab('explore'); });
    navGallery.addEventListener('click', (e) => { e.preventDefault(); switchTab('gallery'); });
    navAbout.addEventListener('click', (e) => { e.preventDefault(); switchTab('about'); });

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab('explore'));
    });

    // 绑定坐标跃迁引擎
    document.querySelectorAll('.warp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            onPlanetSelect(targetId);
        });
    });
};
