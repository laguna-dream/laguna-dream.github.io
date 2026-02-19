#!/usr/bin/env node

/**
 * RSS Feed Generator for Seafoam Palace
 * Automatically generates rss.xml from writing and curios pages
 *
 * Run: node build-rss.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://laguna-dream.github.io';
const SITE_TITLE = 'seafoam palace';
const SITE_DESCRIPTION = 'writing, thoughts, and curios';

// Parse HTML file to extract metadata
function parseHTMLFile(filePath, type) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract title from <title> tag or h1/h2
    let title = '';
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
        title = titleMatch[1].replace(' - seafoam palace', '').trim();
    } else {
        const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const h2Match = content.match(/<h2[^>]*>([^<]+)<\/h2>/);
        title = (h1Match || h2Match)?.[1]?.trim() || path.basename(filePath, '.html');
    }

    // Extract date from entry-meta or use file modification time
    let date = new Date();
    const dateMatch = content.match(/<div class="entry-meta">\s*([^<]+)<\/div>/);
    if (dateMatch) {
        const dateStr = dateMatch[1].trim();
        // Parse dates like "7 feb 2026 · 12:51 am · ucassaim goa"
        const parts = dateStr.split('·')[0].trim();
        const parsed = new Date(parts);
        if (!isNaN(parsed)) {
            date = parsed;
        }
    } else {
        // Fall back to file stats
        const stats = fs.statSync(filePath);
        date = stats.mtime;
    }

    // Extract description from first paragraph
    let description = '';
    const pMatch = content.match(/<p[^>]*>\s*([^<]+)<\/p>/);
    if (pMatch) {
        description = pMatch[1].trim().substring(0, 200);
        if (pMatch[1].length > 200) description += '...';
    }

    // Build URL
    const relativePath = filePath.replace(process.cwd() + '/', '');
    const url = `${SITE_URL}/${relativePath}`;

    return {
        title,
        description,
        url,
        date,
        type
    };
}

// Scan directory for HTML files
function scanDirectory(dir, type) {
    const items = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (file.endsWith('.html') && file !== 'template.html') {
            const filePath = path.join(dir, file);
            try {
                const item = parseHTMLFile(filePath, type);
                items.push(item);
            } catch (err) {
                console.warn(`Warning: Could not parse ${filePath}:`, err.message);
            }
        }
    }

    return items;
}

// Generate RSS XML
function generateRSS(items) {
    // Sort by date, most recent first
    items.sort((a, b) => b.date - a.date);

    // Limit to 20 most recent items
    items = items.slice(0, 20);

    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
`;

    for (const item of items) {
        const pubDate = item.date.toUTCString();
        const category = item.type === 'writing' ? 'writing' : 'curios';

        xml += `
    <item>
      <title>${escapeXML(item.title)}</title>
      <link>${item.url}</link>
      <guid>${item.url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${category}</category>
      <description>${escapeXML(item.description)}</description>
    </item>`;
    }

    xml += `
  </channel>
</rss>`;

    return xml;
}

// Escape XML special characters
function escapeXML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Main
function main() {
    console.log('🔨 Building RSS feed...\n');

    const items = [];

    // Scan writing directory
    if (fs.existsSync('writing')) {
        const writingItems = scanDirectory('writing', 'writing');
        console.log(`✓ Found ${writingItems.length} writing posts`);
        items.push(...writingItems);
    }

    // Scan curios directory
    if (fs.existsSync('curios')) {
        const curiosItems = scanDirectory('curios', 'curios');
        console.log(`✓ Found ${curiosItems.length} curios posts`);
        items.push(...curiosItems);
    }

    // Generate RSS
    const rssXML = generateRSS(items);

    // Write to file
    fs.writeFileSync('rss.xml', rssXML, 'utf-8');

    console.log(`\n✨ RSS feed generated with ${items.length > 20 ? 20 : items.length} items`);
    console.log(`📝 Saved to: rss.xml`);
}

main();
