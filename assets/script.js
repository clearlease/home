document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Smooth scrolling for navigation links (robust: ignore empty/hash-only anchors and missing targets)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // If no href or just a hash, scroll to top instead of querying a selector
            if (!href || href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            // If target exists, smooth-scroll to it; otherwise do nothing
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Form submission logic
    const form = document.getElementById('demo-form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.innerHTML : null;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Sende...';
            }

            // Basic validation
            const name = form.querySelector('#name').value;
            const email = form.querySelector('#email').value;
            const company = form.querySelector('#company').value;
            const hp = form.querySelector('#hp_phone').value; // honeypot

            if (!name || !email) {
                alert('Bitte füllen Sie alle erforderlichen Felder aus.');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                return;
            }

            // If honeypot filled, treat as bot and abort silently
            if (hp && hp.trim() !== '') {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                return;
            }

            try {
                // Local development bypass: if running on localhost allow a dummy token so you can test without a configured reCAPTCHA key.
                let token;
                try {
                    if (window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                        token = 'LOCALHOST_BYPASS_TOKEN';
                        console.info('Using localhost reCAPTCHA bypass token.');
                    } else {
                        token = await new Promise((resolve, reject) => {
                            grecaptcha.enterprise.ready(async function() {
                                try {
                                    const t = await grecaptcha.enterprise.execute('6Lf9ZcYrAAAAAFxtek4rvHis08KQbC6Wzo49AjO5', { action: 'homepage_form_submission' });
                                    resolve(t);
                                } catch (err) {
                                    reject(err);
                                }
                            });
                        });
                    }
                    console.debug('[ContactForm] reCAPTCHA token:', token);
                } catch (rcErr) {
                    console.warn('reCAPTCHA error, proceeding without token on localhost if applicable:', rcErr);
                    if (!token && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                        token = 'LOCALHOST_BYPASS_TOKEN';
                    } else {
                        console.error('[ContactForm] reCAPTCHA error (not localhost):', rcErr);
                        throw rcErr;
                    }
                }
    
                const payload = {
                    name,
                    email,
                    company,
                    'g-recaptcha-response': token,
                    schema_version: "1.0"
                };
                console.debug('[ContactForm] Payload to be sent:', payload);
    
                let response;
                try {
                    response = await fetch('https://n8n.clearlea.se/webhook/homepage-form-submission', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });
                } catch (fetchErr) {
                    console.error('[ContactForm] Fetch/network error:', fetchErr);
                    throw fetchErr;
                }
    
                if (response && response.ok) {
                    alert('Vielen Dank für Ihre Anfrage! Wir werden uns in Kürze bei Ihnen melden.');
                    form.reset();
                } else {
                    let msg = 'Bitte versuchen Sie es später erneut.';
                    try {
                        const data = response ? await response.json() : null;
                        if (data && data.message) msg = data.message;
                        console.error('[ContactForm] Server error response:', data);
                    } catch (err) {
                        console.error('[ContactForm] Error parsing error response JSON:', err);
                    }
                    alert(`Fehler beim Senden des Formulars: ${msg}`);
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            }
        });
    }

    // Card animation on scroll
    const animatedCards = document.querySelectorAll('.animated-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedCards.forEach(card => {
        observer.observe(card);
    });
});
    (function () {
        // Init dotLottie players when DOM is ready — robust and idempotent.
        function initPlayers() {
            const players = document.querySelectorAll("dotlottie-player");
            players.forEach(player => {
                player.addEventListener("ready", () => {
                    // Play the animation when the player is ready
                    try { player.play(); } catch (e) { /* non-fatal */ }
                });
            });
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPlayers);
        } else {
            initPlayers();
        }
    })();
function carousel() {
    return {
        currentIndex: 1,
        items: [],
        slider: null,
        itemWidth: 0,
        timer: null,
        totalClones: 2,

        init() {
            this.slider = this.$refs.slider;
            this.items = Array.from(this.slider.children);
            this.itemWidth = this.items[0].offsetWidth;

            // Clone first and last items for seamless looping
            const clonesStart = this.items.slice(0, this.totalClones).map(item => item.cloneNode(true));
            const clonesEnd = this.items.slice(-this.totalClones).map(item => item.cloneNode(true));

            clonesStart.forEach(clone => this.slider.appendChild(clone));
            clonesEnd.reverse().forEach(clone => this.slider.insertBefore(clone, this.slider.firstChild));
            
            this.items = Array.from(this.slider.children);
            this.update(false); // Initial position without transition
            this.start();
        },

        next() {
            this.currentIndex++;
            this.update();
            if (this.currentIndex >= this.items.length - this.totalClones) {
                setTimeout(() => {
                    this.currentIndex = this.totalClones;
                    this.update(false);
                }, 500);
            }
        },

        prev() {
            this.currentIndex--;
            this.update();
            if (this.currentIndex < this.totalClones) {
                setTimeout(() => {
                    this.currentIndex = this.items.length - this.totalClones * 2;
                    this.update(false);
                }, 500);
            }
        },

        update(transition = true) {
            if (!transition) {
                this.slider.style.transition = 'none';
            } else {
                this.slider.style.transition = 'transform 0.5s ease-in-out';
            }
            this.slider.style.transform = `translateX(-${this.currentIndex * this.itemWidth}px)`;
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
    }
}
// Simple Markdown loader (lightweight, dependency-free).
// Usage: Add an element with data-md="path/to/file.md" and it will be loaded and rendered.
// Example in HTML: <div id="legal" data-md="resources/content/20250911 - clearlease - inprint.md"></div>

(function () {
    // Escape HTML to avoid XSS from markdown files (they should be trusted, but still escape)
    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
        });
    }

    // Very small markdown -> HTML converter that supports headings, paragraphs, bold, italic, links and lists.
    function simpleMarkdownToHTML(md) {
        if (!md) return '';
        // Normalize line endings
        md = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Code blocks (```lang\n...\n```)
        md = md.replace(/```([\s\S]*?)```/g, function (m, code) {
            return '<pre><code>' + escapeHtml(code) + '</code></pre>';
        });

        // Inline code `code`
        md = md.replace(/`([^`]+)`/g, function (m, c) {
            return '<code>' + escapeHtml(c) + '</code>';
        });

        // Headings ######..#
        md = md.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
        md = md.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
        md = md.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
        md = md.replace(/^### (.*)$/gm, '<h3>$1</h3>');
        md = md.replace(/^## (.*)$/gm, '<h2>$1</h2>');
        md = md.replace(/^# (.*)$/gm, '<h1>$1</h1>');

        // Links [text](url)
        md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, text, url) {
            return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
        });

        // Bold **text** or __text__
        md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        md = md.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // Italic *text* or _text_
        md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        md = md.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Unordered lists - lines starting with -, *, +
        md = md.split('\n').reduce(function (acc, line, i, arr) {
            // detect list start
            if (/^\s*([-*+])\s+/.test(line)) {
                if (!acc._inList) {
                    acc._inList = true;
                    acc.html += '<ul>';
                }
                // Escape list item content to avoid accidental HTML injection from markdown files
                acc.html += '<li>' + escapeHtml(line.replace(/^\s*([-*+])\s+/, '')) + '</li>';
            } else {
                if (acc._inList) {
                    acc.html += '</ul>';
                    acc._inList = false;
                }
                acc.html += '\n' + line;
            }
            return acc;
        }, { html: '', _inList: false }).html;

        // Convert remaining double newlines into paragraphs
        // First split on two or more newlines
        const blocks = md.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
        const htmlBlocks = blocks.map(block => {
            // If block already looks like a block-level tag (h1,h2,ul,pre,blockquote), keep as-is
            if (/^<(h[1-6]|ul|ol|pre|blockquote)/i.test(block.trim())) {
                return block;
            }
            // Otherwise wrap in <p>
            return '<p>' + block + '</p>';
        });

        return htmlBlocks.join('\n');
    }

    async function loadMarkdownToElement(el, mdPath) {
        try {
            const res = await fetch(mdPath, { cache: 'no-cache' });
            if (!res.ok) {
                el.innerHTML = '<p class="text-red-600">Fehler beim Laden der Seite. Bitte versuchen Sie es später erneut.</p>';
                console.error('Failed to fetch markdown:', mdPath, res.status);
                return;
            }
            const text = await res.text();
            el.innerHTML = simpleMarkdownToHTML(text);
        } catch (err) {
            el.innerHTML = '<p class="text-red-600">Fehler beim Laden der Seite. Bitte versuchen Sie es später erneut.</p>';
            console.error('Error fetching markdown', mdPath, err);
        }
    }

    // On DOM ready, find elements with data-md attribute and load their markdown.
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-md]').forEach(el => {
            const path = el.getAttribute('data-md');
            if (path) loadMarkdownToElement(el, path);
        });
    });

})();
// Enhance markdown rendering using markdown-it + highlight.js (Tailwind Typography friendly).
// This runs after the simple loader and upgrades rendering to CommonMark/GFM + syntax highlighting.
// It is idempotent and loads required libraries from CDNs at runtime.
(function () {
    function loadScript(src, id) {
        return new Promise((resolve, reject) => {
            if (id && document.getElementById(id)) return resolve();
            const s = document.createElement('script');
            if (id) s.id = id;
            s.src = src;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Failed to load ' + src));
            document.head.appendChild(s);
        });
    }

    function loadCss(href, id) {
        if (id && document.getElementById(id)) return;
        const l = document.createElement('link');
        if (id) l.id = id;
        l.rel = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
        });
    }

    async function enhanceMarkdownRender() {
        // Quick exit if no markdown targets
        const targets = Array.from(document.querySelectorAll('[data-md]'));
        if (targets.length === 0) return;

        try {
            // Load markdown-it and highlight.js (idempotent)
            if (!window.markdownit) {
                await loadScript('https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js', 'markdownit-cdn');
            }
            if (!window.hljs) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js', 'hljs-cdn');
                loadCss('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css', 'hljs-css');
            }

            const md = window.markdownit({
                html: false,
                linkify: true,
                typographer: true
            });

            md.options.highlight = function (str, lang) {
                try {
                    if (window.hljs && lang && window.hljs.getLanguage && window.hljs.getLanguage(lang)) {
                        return '<pre><code class="hljs ' + escapeHtml(lang) + '">' +
                            window.hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                            '</code></pre>';
                    }
                } catch (e) {
                    console.warn('Highlight error', e);
                }
                return '<pre><code class="hljs">' + escapeHtml(str) + '</code></pre>';
            };

            // Render each element
            for (const el of targets) {
                const path = el.getAttribute('data-md');
                if (!path) continue;
                try {
                    const res = await fetch(path, { cache: 'no-cache' });
                    if (!res.ok) {
                        el.innerHTML = '<p class="text-red-600">Fehler beim Laden der Seite. Bitte versuchen Sie es später erneut.</p>';
                        console.error('Failed to fetch markdown:', path, res.status);
                        continue;
                    }
                    const text = await res.text();
                    const html = md.render(text);

                    // Wrap in Tailwind Typography 'prose' and fallback GitHub markdown style
                    el.innerHTML = '<div class="prose md:prose-lg markdown-body">' + html + '</div>';

                    if (window.hljs && window.hljs.highlightAll) {
                        window.hljs.highlightAll();
                    }
                } catch (err) {
                    el.innerHTML = '<p class="text-red-600">Fehler beim Laden der Seite. Bitte versuchen Sie es später erneut.</p>';
                    console.error('Error rendering markdown', path, err);
                }
            }
        } catch (err) {
            console.error('Enhancer error:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceMarkdownRender);
    } else {
        enhanceMarkdownRender();
    }
})();