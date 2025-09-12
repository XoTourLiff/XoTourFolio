 
        // Language switching
        let currentLang = 'fr';
        
        function switchLanguage(lang) {
            currentLang = lang;
            
            // Update language buttons
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });
            
            // Update content visibility
            document.querySelectorAll('.lang-content').forEach(content => {
                content.classList.toggle('active', content.dataset.lang === lang);
            });
            
            // Update navigation text
            const navLinks = document.querySelectorAll('.nav-link');
            if (lang === 'fr') {
                navLinks[0].textContent = 'Accueil';
                navLinks[1].textContent = 'Writeups';
                navLinks[2].textContent = 'Apprentissage';
                navLinks[3].textContent = 'Outils';
                navLinks[4].textContent = 'Contact';
            } else {
                navLinks[0].textContent = 'About Me';
                navLinks[1].textContent = 'Writeups';
                navLinks[2].textContent = 'Learning';
                navLinks[3].textContent = 'Tools';
                navLinks[4].textContent = 'Contact';
            }
        }

        // Language button handlers
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switchLanguage(btn.dataset.lang);
            });
        });

        // Navigation functionality
        const navLinks = document.querySelectorAll('.nav-link');
        const pages = document.querySelectorAll('.page');
        const portfolioLogo = document.querySelector('.portfolio-logo');

        // Handle all navigation (including portfolio logo)
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all nav links and pages
                navLinks.forEach(nav => nav.classList.remove('active'));
                pages.forEach(page => page.classList.remove('active'));
                
                // Add active class to clicked nav link
                const href = link.getAttribute('href');
                if (href === '#home') {
                    document.querySelector('.nav-link[href="#home"]').classList.add('active');
                    document.getElementById('home').classList.add('active');
                } else {
                    link.classList.add('active');
                    const targetPage = href.substring(1);
                    document.getElementById(targetPage).classList.add('active');
                }
            });
        });
        // Social links hover effects
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-5px) scale(1.05)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) scale(1)';
            });
        });

        //Remonter esthétiquement la page au changement de section
        document.getElementById("home-link").addEventListener("click", function(event){
            event.preventDefault(); // empêche l’ancre #
             window.scrollTo({ top: 0, behavior: 'smooth' }); // remonte doucement
        });
  