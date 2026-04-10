// ===== STARFIELD =====
(function createStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];
    const NUM_STARS = 280;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < NUM_STARS; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.4 + 0.2,
                opacity: Math.random(),
                speed: Math.random() * 0.015 + 0.003,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const now = Date.now() / 1000;
        stars.forEach(star => {
            const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(now * star.speed * 6 + star.phase));
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 220, 255, ${twinkle * 0.85})`;
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    resize();
    initStars();
    draw();
    window.addEventListener('resize', () => { resize(); initStars(); });
})();

// ===== WRITEUP DATA =====
let writeups = [
    {
        id: 1,
        title: "Sidecar",
        platform: "htb",
        difficulty: "advanced",
        tags: ["Windows", ".lnk", "Bypass AV"],
        date: "2026-04-02",
        image: "images/sidecar.png",
        mediumUrl: "https://medium.com/@Xotourliff/sidecar-6f26507c703e",
        description: "Sidecar is a mini prolab by VulnLab involving .lnk abuse, AV bypass, WebDAV abuse, password spraying, and TcbPrivileges abuse."
    }
    ,
    {
        id: 2,
        title: "Puppet",
        platform: "htb",
        difficulty: "advanced",
        tags: ["Sliver C2", "UAC Bypass"],
        date: "2026-02-18",
        image: "images/puppet-logo.webp",
        mediumUrl: "https://medium.com/@Xotourliff/puppet-walkthrough-9da4cd1fbaf5",
        description: "Puppet is a mini prolab by VulnLab that provides hands-on experience with the Sliver command and control framework."
    }
    ,
    {
        id: 3,
        title: "Reflection",
        platform: "htb",
        difficulty: "advanced",
        tags: ["MSSQL coercion", "NTLM Relay", "RBCD"],
        date: "2026-03-30",
        image: "images/reflection-logo.webp",
        mediumUrl: "https://medium.com/@Xotourliff/reflection-walkthrough-8f2dbd4287cf",
        description: "Reflection is a mini prolab by VulnLab involving hard coded credentials discovering, NTLM Relay, RBCD and password spraying."
    }
];


// ===== WRITEUP RENDER =====
function renderWriteups() {
    const grid = document.getElementById('writeup-grid');
    const gridEn = document.getElementById('writeup-grid-en');

    const html = writeups.length === 0
        ? `<div class="no-writeups">Aucun writeup publié pour l'instant — bientôt disponible.</div>`
        : writeups.map(w => `
        <div class="writeup-card" onclick="openWriteup(${w.id})">
            <div class="writeup-card-img">
                <img src="${w.image}" alt="${w.title}" onerror="this.style.background='rgba(20,40,80,0.5)';this.style.display='block';this.style.minHeight='180px'">
            </div>
            <div class="writeup-card-body">
                <div class="writeup-card-header">
                    <div class="writeup-title">${w.title}</div>
                    <span class="writeup-platform platform-${w.platform}">${w.platform === 'htb' ? 'HackTheBox' : 'Other'}</span>
                </div>
                <div class="writeup-desc">${w.description}</div>
                <div class="writeup-tags">${w.tags.map(t => `<span class="writeup-tag">${t}</span>`).join('')}</div>
                <div class="writeup-meta">
                    <span class="writeup-difficulty diff-${w.difficulty.toLowerCase()}">${w.difficulty.charAt(0).toUpperCase() + w.difficulty.slice(1)}</span>
                    <span>${w.date}</span>
                </div>
            </div>
        </div>
    `).join('');

    if (grid) grid.innerHTML = html;
    if (gridEn) gridEn.innerHTML = html;
}

function openWriteup(id) {
    const w = writeups.find(x => x.id === id);
    if (!w) return;
    window.open(w.mediumUrl, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    renderWriteups();
});

// ===== LANGUAGE SWITCHING =====
let currentLang = 'fr';

function switchLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('.lang-content').forEach(content => {
        content.classList.toggle('active', content.dataset.lang === lang);
    });
    const navLinks = document.querySelectorAll('.nav-link');
    if (lang === 'fr') {
        navLinks[0].textContent = 'Accueil';
        navLinks[1].textContent = 'Write-Ups';
        navLinks[2].textContent = 'Certifications';
        navLinks[3].textContent = 'Contact';
    } else {
        navLinks[0].textContent = 'About Me';
        navLinks[1].textContent = 'Write-Ups';
        navLinks[2].textContent = 'Certifications';
        navLinks[3].textContent = 'Contact';
    }
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
});

// ===== NAVIGATION =====
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(nav => nav.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        const href = link.getAttribute('href');
        if (href === '#home') {
            document.querySelector('.nav-link[href="#home"]').classList.add('active');
            document.getElementById('home').classList.add('active');
        } else {
            link.classList.add('active');
            document.getElementById(href.substring(1)).classList.add('active');
        }
        if (href === '#writeups') renderWriteups();
    });
});

document.getElementById("home-link").addEventListener("click", function(event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', () => { link.style.transform = 'translateY(-5px) scale(1.05)'; });
    link.addEventListener('mouseleave', () => { link.style.transform = 'translateY(0) scale(1)'; });
});
