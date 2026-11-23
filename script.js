const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== STARFIELD =====
// Fond statique dessiné une fois (net sur écrans Retina), quelques étoiles animées
// par-dessus, et une étoile filante de temps en temps.
(function createStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const BASE_STARS = 320;
    const MOVING_STARS = 16;
    const TINTS = ['200, 220, 255', '222, 234, 255', '255, 243, 224', '172, 202, 255'];

    const staticLayer = document.createElement('canvas');
    const staticCtx = staticLayer.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let movers = [];
    let shooting = null;
    let nextShootAt = 0;
    let rafId = null;

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    function drawStar(context, x, y, r, alpha, tint, glow) {
        if (glow) {
            const g = context.createRadialGradient(x, y, 0, x, y, r * 5);
            g.addColorStop(0, 'rgba(' + tint + ', ' + (alpha * 0.35) + ')');
            g.addColorStop(1, 'rgba(' + tint + ', 0)');
            context.fillStyle = g;
            context.beginPath();
            context.arc(x, y, r * 5, 0, Math.PI * 2);
            context.fill();
        }
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2);
        context.fillStyle = 'rgba(' + tint + ', ' + alpha + ')';
        context.fill();
    }

    function buildStaticLayer() {
        staticLayer.width = width * dpr;
        staticLayer.height = height * dpr;
        staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        staticCtx.clearRect(0, 0, width, height);
        const density = Math.min(1.4, Math.max(0.45, (width * height) / (1440 * 900)));
        const count = Math.round(BASE_STARS * density);
        for (let i = 0; i < count; i++) {
            const r = Math.pow(Math.random(), 3) * 1.4 + 0.25;
            drawStar(staticCtx, Math.random() * width, Math.random() * height, r, Math.random() * 0.5 + 0.15, pick(TINTS), r > 1.15);
        }
    }

    function buildMovers() {
        movers = [];
        for (let i = 0; i < MOVING_STARS; i++) {
            movers.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 0.9 + 0.7,
                drift: (Math.random() * 0.1 + 0.03) * (Math.random() < 0.5 ? -1 : 1),
                sink: (Math.random() * 0.05 + 0.01) * (Math.random() < 0.5 ? -1 : 1),
                speed: Math.random() * 0.5 + 0.25,
                phase: Math.random() * Math.PI * 2,
                tint: pick(TINTS)
            });
        }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStaticLayer();
        buildMovers();
    }

    function drawStatic() {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(staticLayer, 0, 0, width, height);
    }

    function spawnShootingStar() {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const angle = (Math.random() * 15 + 18) * Math.PI / 180;
        const speed = Math.random() * 4 + 10;
        shooting = {
            x: width * (0.15 + Math.random() * 0.7),
            y: height * Math.random() * 0.35,
            vx: Math.cos(angle) * speed * dir,
            vy: Math.sin(angle) * speed,
            len: 110 + Math.random() * 90,
            life: 0,
            maxLife: 50
        };
    }

    function drawShootingStar(now) {
        const s = shooting;
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const p = s.life / s.maxLife;
        const alpha = p < 0.2 ? p / 0.2 : Math.max(0, 1 - (p - 0.2) / 0.8);
        const speed = Math.hypot(s.vx, s.vy);
        const tx = s.x - (s.vx / speed) * s.len;
        const ty = s.y - (s.vy / speed) * s.len;
        const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
        g.addColorStop(0, 'rgba(236, 245, 255, ' + (alpha * 0.9) + ')');
        g.addColorStop(1, 'rgba(236, 245, 255, 0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        if (s.life >= s.maxLife) {
            shooting = null;
            nextShootAt = now + 7000 + Math.random() * 9000;
        }
    }

    function frame(now) {
        drawStatic();
        const t = now / 1000;
        movers.forEach(star => {
            star.x += star.drift;
            star.y += star.sink;
            if (star.x < -5) star.x = width + 5;
            if (star.x > width + 5) star.x = -5;
            if (star.y < -5) star.y = height + 5;
            if (star.y > height + 5) star.y = -5;
            const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t * star.speed + star.phase));
            drawStar(ctx, star.x, star.y, star.radius, twinkle * 0.9, star.tint, twinkle > 0.85);
        });
        if (shooting) drawShootingStar(now);
        else if (now >= nextShootAt) spawnShootingStar();
        rafId = requestAnimationFrame(frame);
    }

    resize();
    if (reduceMotion) {
        drawStatic();
    } else {
        nextShootAt = performance.now() + 3500;
        rafId = requestAnimationFrame(frame);
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            if (reduceMotion) drawStatic();
        }, 150);
    });

    document.addEventListener('visibilitychange', () => {
        if (reduceMotion) return;
        if (document.hidden) {
            cancelAnimationFrame(rafId);
            rafId = null;
        } else if (rafId === null) {
            rafId = requestAnimationFrame(frame);
        }
    });
})();

// ===== ARTICLES DATA =====
// source : nom affiché à droite de la ligne, sert aussi de filtre
// level   : easy | medium | hard | advanced
// url     : laisser vide pour marquer l'article comme en cours de rédaction
const articles = [
    {
        id: 1,
        title: "AdaptixC2 & Domain Trusts",
        source: "HomeLab",
        level: "advanced",
        tags: ["AdaptixC2", "AD Trusts"],
        date: "2026-07-24",
        image: "images/AD_trust.png",
        url: "https://medium.com/@Xotourliff/adaptixc2-domain-trusts-chained-compromise-of-a-multi-forest-active-directory-environment-8e9f9dfa2ff7",
        description: "Compromission chaînée d'un environnement Active Directory multi-forêts, avec AdaptixC2 comme framework de Command & Control.",
        descriptionEn: "Chained compromise of a multi-forest Active Directory environment, using AdaptixC2 as the Command & Control framework."
    },
    {
        id: 2,
        title: "I passed CAPE, here is my honest review 🧙‍♂️(In French)",
        titleEn: "I passed CAPE, here is my honest review 🧙‍♂️(In French)",
        source: "HackTheBox",
        level: "easy",
        tags: ["Active Directory", "Evasion", "C2"],
        date: "",
        image: "images/CAPE_magic.png",
        url: "https://medium.com/@Xotourliff/i-passed-cape-here-is-my-honest-review-%EF%B8%8F-in-french-3dbd39118226?postPublishedType=initial",
        description: "Retour d'expérience sur la certification CAPE de Hack The Box : préparation, examen et rapport.",
        descriptionEn: "Debrief on the CAPE certification by Hack The Box: preparation, exam and report."
    },
    {
        id: 3,
        title: "Retex CPTS",
        titleEn: "CPTS debrief (French only)",
        source: "HackTheBox",
        level: "medium",
        tags: ["Web App Pentesting", "Active Directory"],
        date: "",
        image: "images/CPTS_war.png",
        url: "",
        description: "Retour d'expérience sur la certification CPTS de Hack The Box : préparation, examen et rapport.",
        descriptionEn: "Debrief on the CPTS certification by Hack The Box: preparation, exam and report."
    },
    {
        id: 4,
        title: "Puppet",
        source: "VulnLab",
        level: "advanced",
        tags: ["Sliver C2", "UAC Bypass"],
        date: "2026-02-18",
        image: "images/Puppet.webp",
        url: "https://medium.com/@Xotourliff/puppet-walkthrough-9da4cd1fbaf5",
        description: "Mini prolab VulnLab centré sur la prise en main du framework de Command & Control Sliver.",
        descriptionEn: "VulnLab mini prolab focused on hands-on use of the Sliver command and control framework."
    },
    {
        id: 5,
        title: "Reflection",
        source: "VulnLab",
        level: "advanced",
        tags: ["MSSQL coercion", "NTLM Relay", "RBCD"],
        date: "2026-02-18",
        image: "images/Reflection.webp",
        url: "https://medium.com/@Xotourliff/reflection-walkthrough-8f2dbd4287cf",
        description: "Mini prolab VulnLab : credentials en dur, relais NTLM, RBCD et password spraying.",
        descriptionEn: "VulnLab mini prolab: hardcoded credentials, NTLM relay, RBCD and password spraying."
    },
    {
        id: 6,
        title: "Sidecar",
        source: "VulnLab",
        level: "advanced",
        tags: ["Windows", ".lnk", "AV Bypass"],
        date: "2026-04-02",
        image: "images/SideCar.webp",
        url: "https://medium.com/@Xotourliff/sidecar-6f26507c703e",
        description: "Mini prolab VulnLab : abus de fichiers .lnk, contournement d'AV, WebDAV, password spraying et TcbPrivileges.",
        descriptionEn: "VulnLab mini prolab: .lnk abuse, AV bypass, WebDAV abuse, password spraying and TcbPrivileges abuse."
    }
];

const LEVEL_SCALE = { easy: 1, medium: 2, hard: 3, advanced: 4 };

const I18N = {
    fr: { all: "Tout", draft: "en cours de rédaction", empty: "Aucun article dans cette catégorie pour le moment.", count: n => n + (n > 1 ? " articles" : " article"), close: "Fermer" },
    en: { all: "All", draft: "draft", empty: "No article in this category yet.", count: n => n + (n > 1 ? " articles" : " article"), close: "Close" }
};

let currentLang = 'fr';
let currentFilter = 'all';

function esc(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(iso, lang) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

function sortedArticles() {
    return articles.slice().sort((a, b) => {
        if (!a.date && !b.date) return a.id - b.id;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
    });
}

function articleRow(a, lang) {
    const t = I18N[lang];
    const title = lang === 'en' && a.titleEn ? a.titleEn : a.title;
    const desc = lang === 'en' && a.descriptionEn ? a.descriptionEn : a.description;
    const filled = LEVEL_SCALE[a.level] || 0;
    const bars = [1, 2, 3, 4].map(i => `<i class="${i <= filled ? 'on' : ''}"></i>`).join('');
    const draft = a.url ? '' : `<span class="article-draft">${t.draft}</span>`;
    const tags = a.tags.map(x => '#' + x.toLowerCase().replace(/\s+/g, '-')).join(' ');

    return `
    <article class="article-row" data-id="${a.id}" data-source="${esc(a.source)}" tabindex="0" role="link" aria-label="${esc(title)}">
        <div class="article-thumb"><img src="${esc(a.image)}" alt="" loading="lazy" onerror="this.remove()"></div>
        <div class="article-main">
            <h3 class="article-title">${esc(title)}${draft}</h3>
            <p class="article-desc">${esc(desc)}</p>
            <p class="article-tags">${esc(tags)}</p>
        </div>
        <div class="article-side">
            <span class="article-source">${esc(a.source)}</span>
            <span class="article-date">${esc(formatDate(a.date, lang))}</span>
            <span class="article-level lvl-${esc(a.level)}"><span class="level-bars">${bars}</span>${esc(a.level)}</span>
        </div>
    </article>`;
}

function renderFilters(lang) {
    const box = document.getElementById('articles-filters-' + lang);
    if (!box) return;
    const sources = [...new Set(articles.map(a => a.source))];
    const values = ['all', ...sources];
    box.innerHTML = values.map(v => `<button type="button" class="filter-btn${v === currentFilter ? ' active' : ''}" data-filter="${esc(v)}" aria-pressed="${v === currentFilter}">${v === 'all' ? I18N[lang].all : esc(v)}</button>`).join('');
}

function renderArticles(lang) {
    const list = document.getElementById('article-list-' + lang);
    const counter = document.getElementById('articles-count-' + lang);
    if (!list) return;

    const items = sortedArticles().filter(a => currentFilter === 'all' || a.source === currentFilter);
    list.innerHTML = items.length ? items.map(a => articleRow(a, lang)).join('') : `<div class="article-empty">${I18N[lang].empty}</div>`;
    if (counter) counter.textContent = I18N[lang].count(items.length);
    renderFilters(lang);
}

function renderAllArticles() {
    renderArticles('fr');
    renderArticles('en');
}

function openArticle(id) {
    const a = articles.find(x => x.id === id);
    if (!a || !a.url) return;
    window.open(a.url, '_blank', 'noopener');
}

// ===== LIGHTBOX (certifications) =====
const lightbox = document.getElementById('lightbox');

function openLightbox(img) {
    if (!lightbox || typeof lightbox.showModal !== 'function') {
        window.open(img.currentSrc || img.src, '_blank', 'noopener');
        return;
    }
    const target = lightbox.querySelector('img');
    target.src = img.currentSrc || img.src;
    target.alt = img.alt;
    lightbox.querySelector('.lightbox-close').setAttribute('aria-label', I18N[currentLang].close);
    lightbox.showModal();
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.closest('.lightbox-close')) lightbox.close();
    });
}

// ===== CLICS =====
document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (filterBtn) {
        currentFilter = filterBtn.dataset.filter;
        renderAllArticles();
        return;
    }
    const certBtn = e.target.closest('button.cert-media');
    if (certBtn) {
        const img = certBtn.querySelector('img');
        if (img) openLightbox(img);
        return;
    }
    const row = e.target.closest('.article-row');
    if (row) openArticle(Number(row.dataset.id));
});

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const row = e.target.closest && e.target.closest('.article-row');
    if (row) {
        e.preventDefault();
        openArticle(Number(row.dataset.id));
    }
});

// ===== LANGUE =====
function switchLanguage(lang) {
    if (!I18N[lang]) lang = 'fr';
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const on = btn.dataset.lang === lang;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.lang-content').forEach(content => content.classList.toggle('active', content.dataset.lang === lang));
    document.querySelectorAll('.nav-link').forEach(link => {
        const label = link.dataset[lang];
        if (label) link.textContent = label;
    });
    try { localStorage.setItem('xotourfolio-lang', lang); } catch (err) { /* stockage indisponible */ }
    renderArticles(lang);
}

document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => switchLanguage(btn.dataset.lang)));

// ===== NAVIGATION =====
// Chaque page a sa propre ancre (#articles, #certifs...) : les liens sont partageables
// et le bouton retour du navigateur fonctionne.
const PAGE_IDS = ['home', 'articles', 'certifs', 'contact'];

function showPage(id) {
    if (!PAGE_IDS.includes(id)) id = 'home';
    document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === id));
    document.querySelectorAll('.nav-link').forEach(link => {
        const on = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', on);
        if (on) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    if (id === 'articles') renderArticles(currentLang);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}

document.querySelectorAll('.site-nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
        showPage(id);
    });
});

window.addEventListener('popstate', () => showPage(location.hash.slice(1)));

// ===== INIT =====
document.querySelectorAll('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });

(function init() {
    let saved = null;
    try { saved = localStorage.getItem('xotourfolio-lang'); } catch (err) { /* stockage indisponible */ }
    switchLanguage(saved || 'fr');
    renderAllArticles();
    showPage(location.hash.slice(1));
})();
