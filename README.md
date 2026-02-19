# seafoam palace

personal website with writing, notebook, curios, and garden sections.

## Development

### Running locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000

### Building RSS feed
Whenever you add a new post to `writing/` or `curios/`:
```bash
npm run rss
```

This will:
- Scan all HTML files in `writing/` and `curios/`
- Extract titles, dates, and descriptions
- Generate `rss.xml` with the 20 most recent posts
- Sort by date (most recent first)

### Archiving bookshelf to garden
When you update the "bookshelf" section on the homepage with new links:
```bash
npm run archive
```

This will:
- Scan all links in the bookshelf section of `index.html`
- Check which items aren't already in `pages/garden.html`
- Automatically add new items to garden with timestamp
- Preserve tags (music, blog, tv, etc.) from link titles

**Workflow:**
1. Add/update items in bookshelf on homepage (recent consumption)
2. Run `npm run archive`
3. New items are automatically saved to garden as permanent archive
4. Remove old items from bookshelf, they stay in garden

### Dark mode
Click the ☾/☀ button in the top-right corner. Preference persists via localStorage.

## Structure

```
/
├── index.html              # homepage with castle stack
├── pages/
│   ├── about.html         # about page with me.gif
│   ├── writing.html       # writing index with tag filters
│   ├── notebook.html      # quick thoughts/notes
│   ├── curios.html        # 4chan-style grid catalog
│   └── garden.html        # curated links/influences
├── writing/               # individual writing posts
├── curios/                # individual curios posts
│   └── template.html      # template for new curios posts
├── assets/                # images, gifs, media
├── css/
│   └── shared.css         # shared styles (dark mode, nav, etc)
└── js/
    └── nav.js             # shared navigation + dark mode toggle
```

## Adding content

### Writing post
1. Create `writing/your-post.html` using existing posts as template
2. Add entry to `pages/writing.html` with appropriate tag
3. Run `npm run rss` to update RSS feed
4. Commit and push

### Curios post
1. Copy `curios/template.html` to `curios/your-album.html`
2. Edit content (mix text and images as needed)
3. Add card to `pages/curios.html` grid
4. Run `npm run rss` to update RSS feed
5. Commit and push

### Notebook entry
Just add a new `.notebook-entry` div to `pages/notebook.html` at the top.

### Bookshelf (homepage)
1. Add links to the bookshelf section on `index.html`
2. Run `npm run archive` to auto-archive to garden
3. Update/remove bookshelf items as needed (archives remain in garden)

### Garden link (manual)
Add a new `.link-item` to `pages/garden.html` with appropriate `data-tags`.
Or use `npm run archive` to auto-archive bookshelf items (recommended).

## Features

- ✅ Dark mode (localStorage persistence)
- ✅ Mobile responsive
- ✅ RSS feed
- ✅ Print-friendly styles
- ✅ Active navigation state
- ✅ Tag filtering (writing, garden, curios)
- ✅ Shared CSS architecture
- ✅ No build tools or frameworks (pure HTML/CSS/JS)

## Credits

ASCII art: Fairy Queen by H P Barmario (Morfina) · Castle on Rock by Volker Hellmich · Northern Lights by D Rice
