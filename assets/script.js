// Make carousel function global for Alpine.js
window.carousel = function() {
    return {
        currentIndex: 0,
        items: [],
        timer: null,
        init() {
            this.items = this.$refs.slider.children;
            this.cloneItems();
            this.start();
        },
        cloneItems() {
            // Clone first few items to create a seamless loop
            const itemsToClone = Math.ceil(this.$el.offsetWidth / this.items[0].offsetWidth);
            for (let i = 0; i < itemsToClone; i++) {
                const clone = this.items[i].cloneNode(true);
                this.$refs.slider.appendChild(clone);
            }
        },
        next() {
            this.currentIndex++;
            if (this.currentIndex >= this.items.length) {
                this.currentIndex = 0;
                this.$refs.slider.style.transition = 'none'; // Disable transition for the jump
                this.$refs.slider.style.transform = `translateX(0)`;
                // Use a timeout to re-enable transition after the jump
                setTimeout(() => {
                    this.currentIndex++;
                    this.$refs.slider.style.transition = 'transform 0.5s ease-in-out';
                    this.update();
                }, 50);
            } else {
                this.update();
            }
        },
        prev() {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.items.length - 1;
                this.$refs.slider.style.transition = 'none';
                this.$refs.slider.style.transform = `translateX(-${this.currentIndex * this.items[0].offsetWidth}px)`;
                setTimeout(() => {
                    this.currentIndex--;
                    this.$refs.slider.style.transition = 'transform 0.5s ease-in-out';
                    this.update();
                }, 50);
            } else {
                this.update();
            }
        },
        update() {
            this.$refs.slider.style.transform = `translateX(-${this.currentIndex * this.items[0].offsetWidth}px)`;
        },
        start() {
            this.timer = setInterval(() => {
                this.next();
            }, 3000);
        },
        pause() {
            clearInterval(this.timer);
        },
        resume() {
            this.start();
        }
    };
};

document.addEventListener('DOMContentLoaded', function() {
    // Handle Cal.com Prefill Logic
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const companyInput = document.getElementById('company');
    const calButton = document.getElementById('cal-book-button');

    function updateCalConfig() {
        if (!nameInput || !emailInput || !companyInput || !calButton) {
            return;
        }

        const name = nameInput.value;
        const email = emailInput.value;
        const company = companyInput.value;

        const config = {
            name: name,
            email: email,
            company: company,
            layout: 'month_view'
        };

        // Set the config attribute on the button
        calButton.setAttribute('data-cal-config', JSON.stringify(config));
    }

    if (nameInput && emailInput && companyInput && calButton) {
        [nameInput, emailInput, companyInput].forEach(input => {
            input.addEventListener('input', updateCalConfig);
        });
        updateCalConfig();
    }

    // Reveal animated cards on scroll (fixes sections that look empty due to CSS .animated-card starting hidden)
    (function revealAnimatedCards() {
        const animatedCards = document.querySelectorAll('.animated-card');
        if (!animatedCards || animatedCards.length === 0) return;

        // Honor reduced-motion preference by revealing immediately
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            animatedCards.forEach(el => el.classList.add('is-visible'));
            return;
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            animatedCards.forEach(el => observer.observe(el));
        } else {
            // Fallback for older browsers
            animatedCards.forEach(el => el.classList.add('is-visible'));
        }
    })();

    // Markdown rendering for pages using data-md attributes
    // Finds any element with a data-md attribute, fetches the referenced markdown file,
    // loads the marked parser dynamically if needed, converts markdown to HTML and injects it.
    // Uses encodeURI to handle spaces in filenames.
    async function renderDataMdElements() {
        const elems = document.querySelectorAll('[data-md]');
        if (!elems || elems.length === 0) return;

        // helper to actually render using marked
        const doRender = async () => {
            elems.forEach(async (el) => {
                const mdPath = el.getAttribute('data-md');
                if (!mdPath) return;
                try {
                    const res = await fetch(encodeURI(mdPath));
                    if (!res.ok) {
                        el.innerHTML = '<p class="text-red-600">Fehler beim Laden des Inhalts.</p>';
                        return;
                    }
                    const md = await res.text();
                    // marked.parse is the current API
                    const html = window.marked && typeof window.marked.parse === 'function'
                        ? window.marked.parse(md)
                        : (window.marked ? window.marked(md) : md);
                    el.innerHTML = html;
                } catch (err) {
                    console.error('Error loading markdown:', err);
                    el.innerHTML = '<p class="text-red-600">Fehler beim Laden des Inhalts.</p>';
                }
            });
        };

        if (window.marked && typeof window.marked.parse === 'function') {
            await doRender();
            return;
        }

        // Dynamically load marked from CDN then render
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
                script.defer = true;
                script.onload = resolve;
                script.onerror = (e) => { console.error('Failed to load marked.js', e); reject(e); };
                document.head.appendChild(script);
            });
            await doRender();
        } catch (err) {
            // As fallback, inject raw markdown inside a <pre>
            elems.forEach(async (el) => {
                try {
                    const res = await fetch(encodeURI(el.getAttribute('data-md')));
                    const md = await res.text();
                    el.innerHTML = '<pre>' + escapeHtml(md) + '</pre>';
                } catch {
                    el.innerHTML = '<p class="text-red-600">Fehler beim Laden des Inhalts.</p>';
                }
            });
        }

        // small helper to escape HTML for fallback
        function escapeHtml(str) {
            // Use DOM textContent to safely escape without manual mapping
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    }

    // Kick off markdown rendering (do this after other DOM initialization)
    renderDataMdElements();

    // Lucide Icons (guarded — some pages don't load lucide)
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
});