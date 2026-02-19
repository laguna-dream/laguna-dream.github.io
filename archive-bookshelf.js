#!/usr/bin/env node

/**
 * Bookshelf Archiver for Seafoam Palace
 * Automatically archives bookshelf items from index.html to garden.html
 *
 * Run: node archive-bookshelf.js
 */

const fs = require('fs');

// Parse link items from bookshelf section
function parseBookshelfItems(indexHTML) {
    const items = [];

    // Find bookshelf section
    const bookshelfMatch = indexHTML.match(/<div class="links-section">([\s\S]*?)<\/div>\s*<div class="section">/);
    if (!bookshelfMatch) {
        console.log('⚠️  Could not find bookshelf section');
        return items;
    }

    const bookshelfHTML = bookshelfMatch[1];

    // Extract each link-item
    const linkItemRegex = /<div class="link-item">([\s\S]*?)<\/div>\s*(?=<div class="link-item">|$)/g;
    let match;

    while ((match = linkItemRegex.exec(bookshelfHTML)) !== null) {
        const itemHTML = match[1];

        // Extract URL
        const urlMatch = itemHTML.match(/<a href="([^"]+)"/);
        if (!urlMatch) continue;
        const url = urlMatch[1];

        // Extract title (text between <a> tags)
        const titleMatch = itemHTML.match(/<a[^>]*>([^<]+)<\/a>/);
        if (!titleMatch) continue;
        const title = titleMatch[1].trim();

        // Extract caption
        const captionMatch = itemHTML.match(/<div class="caption">([^<]+)<\/div>/);
        const caption = captionMatch ? captionMatch[1].trim() : '';

        // Extract tag from title (e.g., "music:", "blog:", "tv:")
        const tagMatch = title.match(/^(music|blog|tv|film|book|podcast):/i);
        const tag = tagMatch ? tagMatch[1].toLowerCase() : 'bookshelf';

        items.push({ url, title, caption, tag });
    }

    return items;
}

// Check if item already exists in garden
function itemExistsInGarden(gardenHTML, url) {
    return gardenHTML.includes(`href="${url}"`);
}

// Format date for archive
function getCurrentDate() {
    const now = new Date();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${month} ${year}`;
}

// Create link-item HTML for garden
function createGardenItem(item) {
    const date = getCurrentDate();

    return `
        <div class="link-item" data-tags="${item.tag}">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
            <div class="caption">${item.caption}${item.caption ? ' — ' : ''}archived ${date}</div>
        </div>`;
}

// Add items to garden.html
function addItemsToGarden(gardenHTML, newItems) {
    if (newItems.length === 0) {
        return gardenHTML;
    }

    // Find the last link-item in garden
    const lastItemRegex = /(<div class="link-item"[\s\S]*?<\/div>)\s*(<\/div>\s*<script>)/;
    const match = gardenHTML.match(lastItemRegex);

    if (!match) {
        console.log('⚠️  Could not find insertion point in garden.html');
        return gardenHTML;
    }

    // Build new items HTML
    const newItemsHTML = newItems.map(item => createGardenItem(item)).join('\n');

    // Insert after the last link-item, before the closing </div>
    const updatedHTML = gardenHTML.replace(
        lastItemRegex,
        `$1\n${newItemsHTML}\n$2`
    );

    return updatedHTML;
}

// Main
function main() {
    console.log('📚 Archiving bookshelf items...\n');

    // Read index.html
    const indexPath = 'index.html';
    if (!fs.existsSync(indexPath)) {
        console.log('❌ index.html not found');
        return;
    }
    const indexHTML = fs.readFileSync(indexPath, 'utf-8');

    // Read garden.html
    const gardenPath = 'pages/garden.html';
    if (!fs.existsSync(gardenPath)) {
        console.log('❌ pages/garden.html not found');
        return;
    }
    let gardenHTML = fs.readFileSync(gardenPath, 'utf-8');

    // Parse bookshelf items
    const bookshelfItems = parseBookshelfItems(indexHTML);
    console.log(`✓ Found ${bookshelfItems.length} items in bookshelf`);

    if (bookshelfItems.length === 0) {
        console.log('\n✨ No items to archive');
        return;
    }

    // Filter out items that already exist in garden
    const newItems = bookshelfItems.filter(item => !itemExistsInGarden(gardenHTML, item.url));

    if (newItems.length === 0) {
        console.log('✓ All bookshelf items already in garden\n');
        console.log('✨ Nothing to archive');
        return;
    }

    console.log(`✓ Found ${newItems.length} new items to archive`);

    // Add new items to garden
    gardenHTML = addItemsToGarden(gardenHTML, newItems);

    // Write updated garden.html
    fs.writeFileSync(gardenPath, gardenHTML, 'utf-8');

    console.log('\n✨ Archived to garden:');
    newItems.forEach(item => {
        console.log(`   • ${item.title}`);
    });
    console.log(`\n📝 Updated: pages/garden.html`);
}

main();
