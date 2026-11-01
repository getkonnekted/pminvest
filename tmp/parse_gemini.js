const fs = require('fs');
const html = fs.readFileSync('/tmp/gemini_share.html', 'utf8');

// Find all URLs in the HTML
const urlRegex = /https?:\\\/\\\/[^\s"'\\]+|https?:\/\/[^\s"',<>\\]+/g;
const allUrls = html.match(urlRegex) || [];
const unescaped = allUrls.map(u => u.replace(/\\\//g, '/'));

console.log('Total URLs found:', unescaped.length);

const interesting = unescaped.filter(u => 
  (u.includes('googleusercontent') || u.includes('blob') || u.includes('image') || u.includes('download') || u.includes('media') || u.includes('gemini')) &&
  !u.includes('gstatic.com') &&
  !u.includes('google.com/intl') &&
  !u.includes('support.google')
);

console.log('Interesting URLs:', Array.from(new Set(interesting)));

// Also look for data:image/ base64
const base64Matches = html.match(/data:image\/[a-zA-Z]+;base64,[^"'\s\\]+/g) || [];
console.log('Base64 images count:', base64Matches.length);
if (base64Matches.length > 0) {
  console.log('First base64 length:', base64Matches[0].length);
}

// Let's also search for conversation text or image metadata in WIZ data:
const wizMatch = html.match(/AF_initDataCallback\(([\s\S]*?)\);/g) || [];
console.log('AF_initDataCallback count:', wizMatch.length);
for (let i = 0; i < wizMatch.length; i++) {
  const item = wizMatch[i];
  if (item.includes('http') || item.length > 1000) {
    const urls = (item.match(/https?:\/\/[^"',\s\\]+/g) || []).filter(u => !u.includes('gstatic'));
    console.log(`WIZ [${i}] length:`, item.length, 'URLs:', urls);
  }
}
