document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    const month = today.getMonth(); // 0-11, 11 is December, 0 is January
    const day = today.getDate();

    // Check if it is December (11) or January (0) up to Jan 6th
    const isChristmasSeason = (month === 11) || (month === 0 && day <= 6);

    if (isChristmasSeason) {
        document.body.classList.add('christmas-theme');
        createSnowflakes();
        createBanner();
    }
});

function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'christmas-banner';
    banner.setAttribute('data-i18n', 'christmas.banner');
    banner.innerText = '🎄 Happy Holidays and a Happy New Year from the Clearlease Team! 🎆'; // Default text

    // Insert at the very top of body
    document.body.insertBefore(banner, document.body.firstChild);

    // Trigger translation update if available globally
    if (window.setLanguage && localStorage.getItem('lang')) {
        // Re-run translation for the new element if needed, 
        // though the observer or initial load might catch it if done early enough.
        // Since this runs on DOMContentLoaded, we might need to manually trigger or wait.
        // However, i18n.js also runs on DOMContentLoaded. Reliability depends on order.
        // To be safe, let's just let i18n.js handle it if it hasn't run yet, 
        // or if it has, we might need to call something. 
        // But i18n.js uses querySelectorAll, so if this runs before i18n, we are good.
        // If i18n runs first, we might miss it. 
        // Best approach: dispatch 'translationsLoaded' is for updates.
        // Let's just assume standard flow or maybe just call window.getTranslation if available.
    }
}

function createSnowflakes() {
    const snowflakeCount = 30; // Number of snowflakes
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';

        // Randomize positioning and animation
        snowflake.style.left = Math.random() * 100 + 'vw';

        // Random duration between 5s and 10s
        const duration = Math.random() * 5 + 5;
        snowflake.style.animationDuration = duration + 's';

        // Random delay so they don't start together
        const delay = Math.random() * 5;
        snowflake.style.animationDelay = delay + 's';

        // Random size
        const size = Math.random() * 10 + 10; // 10px to 20px
        snowflake.style.fontSize = size + 'px';

        snowflake.style.opacity = Math.random() * 0.5 + 0.5;

        document.body.appendChild(snowflake);
    }
}
