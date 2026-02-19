(function () {
    // inject shared header + nav HTML
    const el = document.getElementById('site-nav');
    if (!el) return;

    el.outerHTML = `
    <button class="dark-mode-toggle" id="dark-mode-toggle">☾</button>
    <header>
        <h1>seafoam palace</h1>
    </header>
    <nav>
        <a href="/index.html">home</a>
        <a href="/pages/writing.html">writing</a>
        <a href="/pages/notebook.html">notebook</a>
        <a href="/pages/curios.html">curios</a>
        <a href="/pages/garden.html">garden</a>
        <a href="/pages/about.html">about</a>
    </nav>`;

    // mark active nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a').forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (currentPath === linkPath ||
            (currentPath === '/' && linkPath === '/index.html') ||
            (currentPath.includes('/curios/') && linkPath === '/pages/curios.html') ||
            (currentPath.includes('/writing/') && linkPath === '/pages/writing.html')) {
            link.classList.add('active');
        }
    });

    // dark mode toggle
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        toggleBtn.textContent = '☀';
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const darkModeEnabled = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', darkModeEnabled);
        toggleBtn.textContent = darkModeEnabled ? '☀' : '☾';
    });
})();
