// ===== STARFIELD =====
// Le champ d'étoiles est dessiné une seule fois sur un calque statique.
// Seules quelques étoiles (MOVING_STARS) sont réellement animées par-dessus.
(function createStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const NUM_STARS = 280;
    const MOVING_STARS = 14;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const staticLayer = document.createElement('canvas');
    const staticCtx = staticLayer.getContext('2d');
    let movers = [];
    let rafId = null;

    function drawStar(context, x, y, radius, alpha) {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(200, 220, 255, ' + alpha + ')';
        context.fill();
    }

    function buildStaticLayer() {
        staticLayer.width = canvas.width;
        staticLayer.height = canvas.height;
        staticCtx.clearRect(0, 0, staticLayer.width, staticLayer.height);
        for (let i = 0; i < NUM_STARS; i++) {
            drawStar(staticCtx, Math.random() * staticLayer.width, Math.random() * staticLayer.height, Math.random() * 1.3 + 0.2, Math.random() * 0.5 + 0.15);
        }
    }

    function buildMovers() {
        movers = [];
        for (let i = 0; i < MOVING_STARS; i++) {
            movers.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 0.9 + 0.7,
                drift: (Math.random() * 0.10 + 0.03) * (Math.random() < 0.5 ? -1 : 1),
                sink: (Math.random() * 0.05 + 0.01) * (Math.random() < 0.5 ? -1 : 1),
                speed: Math.random() * 0.5 + 0.25,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        buildStaticLayer();
        buildMovers();
    }

    function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(staticLayer, 0, 0);
        const now = Date.now() / 1000;
        movers.forEach(star => {
            star.x += star.drift;
            star.y += star.sink;
            if (star.x < -5) star.x = canvas.width + 5;
            if (star.x > canvas.width + 5) star.x = -5;
            if (star.y < -5) star.y = canvas.height + 5;
            if (star.y > canvas.height + 5) star.y = -5;
            const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(now * star.speed + star.phase));
            drawStar(ctx, star.x, star.y, star.radius, twinkle * 0.9);
        });
        rafId = requestAnimationFrame(frame);
    }

    resize();
    if (reduceMotion) {
        ctx.drawImage(staticLayer, 0, 0);
    } else {
        frame();
    }

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            if (reduceMotion) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(staticLayer, 0, 0); }
        }, 150);
    });

    document.addEventListener('visibilitychange', () => {
        if (reduceMotion) return;
        if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
        else if (rafId === null) { frame(); }
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
        title: "Retex CAPE",
        titleEn: "CAPE debrief (French only)",
        source: "HackTheBox",
        level: "medium",
        tags: ["Active Directory", "Evasion", "C2"],
        date: "",
        image: "images/CAPE_magic.png",
        url: "",
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
    fr: { all: "Tout", draft: "en cours", empty: "Aucun article publié pour le moment.", count: n => n + (n > 1 ? " articles" : " article") },
    en: { all: "All", draft: "draft", empty: "No article published yet.", count: n => n + (n > 1 ? " articles" : " article") }
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
    box.innerHTML = values.map(v => `<button type="button" class="filter-btn${v === currentFilter ? ' active' : ''}" data-filter="${esc(v)}">${v === 'all' ? I18N[lang].all : esc(v)}</button>`).join('');
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

document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (filterBtn) {
        currentFilter = filterBtn.dataset.filter;
        renderAllArticles();
        return;
    }
    const row = e.target.closest('.article-row');
    if (row) openArticle(Number(row.dataset.id));
});

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const row = e.target.closest && e.target.closest('.article-row');
    if (row) { e.preventDefault(); openArticle(Number(row.dataset.id)); }
});

// ===== LANGUAGE SWITCHING =====
function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    document.querySelectorAll('.lang-content').forEach(content => content.classList.toggle('active', content.dataset.lang === lang));

    const navLinks = document.querySelectorAll('.nav-link');
    const labels = lang === 'fr' ? ['Accueil', 'Articles', 'Certifications', 'Contact'] : ['About Me', 'Articles', 'Certifications', 'Contact'];
    navLinks.forEach((link, i) => { if (labels[i]) link.textContent = labels[i]; });

    renderArticles(lang);
}

document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => switchLanguage(btn.dataset.lang)));

// ===== NAVIGATION =====
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = document.getElementById(href.substring(1));
        if (!target) return;
        navLinks.forEach(nav => nav.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        document.querySelector('.nav-link[href="' + href + '"]').classList.add('active');
        target.classList.add('active');
        if (href === '#articles') renderArticles(currentLang);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', () => { link.style.transform = 'translateY(-5px) scale(1.05)'; });
    link.addEventListener('mouseleave', () => { link.style.transform = 'translateY(0) scale(1)'; });
});

document.addEventListener('DOMContentLoaded', renderAllArticles);
