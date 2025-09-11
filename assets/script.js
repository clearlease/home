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
            // The key here must match the 'identifier' in your Cal.com booking questions.
            // Based on the screenshot, 'Unternehmen' is the field name. Let's assume the identifier is 'unternehmen'.
            company: company,
            layout: 'month_view'
        };

        // Set the config attribute on the button
        calButton.setAttribute('data-cal-config', JSON.stringify(config));
    }

    if (nameInput && emailInput && companyInput && calButton) {
        // Update on any input change
        [nameInput, emailInput, companyInput].forEach(input => {
            input.addEventListener('input', updateCalConfig);
        });

        // Initial update in case of browser autofill
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

    // Lucide Icons
    lucide.createIcons();
});