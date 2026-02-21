document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
});

function updateGreeting() {
    const greetingElement = document.getElementById('greetingTime');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greetingText = 'Hello,';

    if (hour >= 5 && hour < 12) {
        greetingText = 'Good Morning,';
    } else if (hour >= 12 && hour < 18) {
        greetingText = 'Good Afternoon,';
    } else {
        greetingText = 'Good Evening,';
    }

    greetingElement.textContent = greetingText;
}
