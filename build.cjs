const fs = require('fs');
const path = require('path');

// Read translations.js
const translations = require('./translations.js');
const afTranslations = translations.af;

// Read index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Replace lang attribute
html = html.replace(/<html lang="en">/i, '<html lang="af">');

// Replace Title
const titleTranslation = afTranslations.title;
if (titleTranslation) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleTranslation}</title>`);
}

// Replace Meta Description
const descTranslation = afTranslations.meta_desc;
if (descTranslation) {
  html = html.replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${descTranslation}"`);
}

// Replace Canonical Link
html = html.replace(/<link rel="canonical" href="index.html" \/>/i, '<link rel="canonical" href="index-af.html" />');

// Replace elements with data-i18n
// Group 1: full opening tag
// Group 2: tag name (e.g. span, a, li, etc)
// Group 3: data-i18n key
// Group 4: inner HTML content
// Group 5: closing tag
const i18nRegex = /(<([a-zA-Z0-9\-]+)[^>]*data-i18n=["']([^"']+)["'][^>]*>)([\s\S]*?)(<\/\2>)/gi;

html = html.replace(i18nRegex, (match, openTag, tagName, key, innerContent, closeTag) => {
  const translation = afTranslations[key];
  if (translation !== undefined) {
    return openTag + translation + closeTag;
  }
  return match;
});

// Replace input placeholders with data-i18n-placeholder
const placeholderRegex = /(<[a-zA-Z0-9\-]+[^>]*data-i18n-placeholder=["']([^"']+)["'][^>]*>)/gi;

html = html.replace(placeholderRegex, (match, tag, key) => {
  const translation = afTranslations[key];
  if (translation !== undefined) {
    if (/placeholder=["'][^"']*["']/i.test(tag)) {
      return tag.replace(/placeholder=["'][^"']*["']/i, `placeholder="${translation}"`);
    } else {
      // Insert placeholder attribute before the closing '>' of the opening tag
      return tag.replace(/>$/, ` placeholder="${translation}">`);
    }
  }
  return match;
});

// Write to index-af.html
fs.writeFileSync(path.join(__dirname, 'index-af.html'), html, 'utf8');
console.log('index-af.html compiled successfully!');
