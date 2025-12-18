document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const month = today.getMonth(); // 0-11, 11 is December
    const day = today.getDate();

    // Check if it is December (11) and the day is before the 26th (<= 25)
    const isChristmasSeason = (month === 11) && (day < 26);

    if (isChristmasSeason) {
        document.body.classList.add('christmas-theme');
        createSnowflakes();
    }
});

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
