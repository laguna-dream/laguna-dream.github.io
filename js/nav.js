(function () {
    // inject shared header/nav styles
    const style = document.createElement('style');
    style.textContent = [
        'header { text-align: center; padding: 20px; }',
        'nav { text-align: center; padding: 10px; }',
        'nav a { margin: 0 15px; text-decoration: none; color: blue; }'
    ].join('\n');
    document.head.appendChild(style);

    // inject shared header + nav HTML
    const el = document.getElementById('site-nav');
    if (!el) return;
    el.outerHTML = `
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
})();
