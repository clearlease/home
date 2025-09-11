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

    // Lucide Icons
    lucide.createIcons();
});