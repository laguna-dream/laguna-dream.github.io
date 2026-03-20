#!/usr/bin/env node

/**
 * RSS Feed Generator for Seafoam Palace
 *
 * Additive only: reads existing rss.xml, preserves all current items,
 * and appends any new HTML files it hasn't seen before.
 *
 * Currently tracks: writing/
 * To add more directories, add them to TRACKED_DIRS.
 *
 * Run: node build-rss.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://laguna-dream.github.io';
const AUTHOR = 'simar';

// Directories to scan for new posts — add more here when needed
const TRACKED_DIRS = ['writing'];

// Files to skip (won't be added to RSS even if new)
const IGNORE_FILES = ['writing/new.html'];

// Parse existing rss.xml and return the raw XML parts
function parseExistingRSS(filePath) {
    if (!fs.existsSync(filePath)) return { guids: new Set(), items: '' };

    const xml = fs.readFileSync(filePath, 'utf-8');
    const guids = new Set();

    const guidRegex = /<guid[^>]*>([^<]+)<\/guid>/g;
    let m;
    while ((m = guidRegex.exec(xml)) !== null) {
        guids.add(m[1].trim());
    }

    // Extract all existing <item> blocks
    const itemBlocks = [];
    const itemRegex = /[ \t]*<item>[\s\S]*?<\/item>/g;
    while ((m = itemRegex.exec(xml)) !== null) {
        itemBlocks.push(m[0]);
    }

    return { guids, items: itemBlocks.join('\n') };
}

// Try to extract a title from an HTML file
function getTitleFromHTML(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Try <b> tag (used in writing posts)
    const bMatch = content.match(/<b>\s*([^<]+?)\s*<\/b>/);
    if (bMatch) return bMatch[1].trim();

    // Try first <h1> or <h2>
    const hMatch = content.match(/<h[12][^>]*>\s*([^<]+?)\s*<\/h[12]>/);
    if (hMatch) return hMatch[1].trim();

    // Try first <p> with text
    const pMatch = content.match(/<p[^>]*>\s*([A-Za-z][^<]{3,60})/);
    if (pMatch) return pMatch[1].trim().split('\n')[0];

    // Fallback: filename
    return path.basename(filePath, '.html').replace(/[-_]/g, ' ');
}

// Build an <item> block
function makeItem(title, url) {
    const pubDate = new Date().toUTCString();
    return `    <item>
      <title>${escapeXML(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${AUTHOR}</author>
    </item>`;
}

function escapeXML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function main() {
    const rssPath = 'rss.xml';
    const { guids, items: existingItems } = parseExistingRSS(rssPath);

    console.log(`Existing items: ${guids.size}`);

    // Find new posts
    const newItemBlocks = [];

    for (const dir of TRACKED_DIRS) {
        if (!fs.existsSync(dir)) continue;

        for (const file of fs.readdirSync(dir)) {
            if (!file.endsWith('.html') || file === 'template.html') continue;

            const filePath = path.join(dir, file);
            const url = `${SITE_URL}/${dir}/${file}`;
            if (guids.has(url)) continue;
            if (IGNORE_FILES.includes(filePath)) continue;

            const title = getTitleFromHTML(filePath);
            newItemBlocks.push(makeItem(title, url));
            console.log(`  + ${title}`);
        }
    }

    if (newItemBlocks.length === 0) {
        console.log('No new posts. RSS unchanged.');
        return;
    }

    // Build RSS: new items first, then existing
    const allItems = [...newItemBlocks, existingItems].filter(Boolean).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>seafoam palace</title>
    <link>${SITE_URL}</link>
${allItems}
  </channel>
</rss>
`;

    fs.writeFileSync(rssPath, xml, 'utf-8');
    console.log(`Added ${newItemBlocks.length} new item(s).`);
}

main();
