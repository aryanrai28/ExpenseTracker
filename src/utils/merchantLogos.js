/**
 * merchantLogos.js — Merchant brand recognition & color extraction.
 *
 * Automatically detects top global merchants from transaction titles
 * and returns brand colors, icons, and ambient glow accents for high-end
 * FinTech visual presentation.
 */

const KNOWN_MERCHANTS = [
  // Streaming & Media
  { keywords: ['netflix'], name: 'Netflix', icon: 'film', brandColor: '#E50914', glowColor: 'rgba(229, 9, 20, 0.28)' },
  { keywords: ['spotify'], name: 'Spotify', icon: 'musical-notes', brandColor: '#1DB954', glowColor: 'rgba(29, 185, 84, 0.28)' },
  { keywords: ['apple music', 'apple.com/bill', 'itunes', 'apple store'], name: 'Apple', icon: 'logo-apple', brandColor: '#A2AAAD', glowColor: 'rgba(162, 170, 173, 0.25)' },
  { keywords: ['youtube', 'google play', 'google cloud', 'google one'], name: 'Google', icon: 'logo-google', brandColor: '#4285F4', glowColor: 'rgba(66, 133, 244, 0.28)' },
  { keywords: ['amazon', 'prime video', 'aws'], name: 'Amazon', icon: 'logo-amazon', brandColor: '#FF9900', glowColor: 'rgba(255, 153, 0, 0.28)' },
  { keywords: ['disney', 'disney+'], name: 'Disney+', icon: 'sparkles', brandColor: '#113CCF', glowColor: 'rgba(17, 60, 207, 0.3)' },
  { keywords: ['hbo', 'max.com'], name: 'Max / HBO', icon: 'tv', brandColor: '#9900FF', glowColor: 'rgba(153, 0, 255, 0.28)' },

  // Food & Coffee
  { keywords: ['starbucks'], name: 'Starbucks', icon: 'cafe', brandColor: '#00704A', glowColor: 'rgba(0, 112, 74, 0.3)' },
  { keywords: ['mcdonald'], name: "McDonald's", icon: 'fast-food', brandColor: '#FFC72C', glowColor: 'rgba(255, 199, 44, 0.28)' },
  { keywords: ['chipotle'], name: 'Chipotle', icon: 'restaurant', brandColor: '#AD343E', glowColor: 'rgba(173, 52, 62, 0.28)' },
  { keywords: ['subway'], name: 'Subway', icon: 'fast-food', brandColor: '#008C15', glowColor: 'rgba(0, 140, 21, 0.28)' },
  { keywords: ['dunkin'], name: "Dunkin'", icon: 'cafe', brandColor: '#FF671F', glowColor: 'rgba(255, 103, 31, 0.28)' },
  { keywords: ['uber eats'], name: 'Uber Eats', icon: 'bag-handle', brandColor: '#06C167', glowColor: 'rgba(6, 193, 103, 0.28)' },
  { keywords: ['doordash'], name: 'DoorDash', icon: 'bicycle', brandColor: '#FF3008', glowColor: 'rgba(255, 48, 8, 0.28)' },
  { keywords: ['grubhub', 'instacart'], name: 'Delivery', icon: 'basket', brandColor: '#F26101', glowColor: 'rgba(242, 97, 1, 0.28)' },

  // Transport & Travel
  { keywords: ['uber', 'uber trip'], name: 'Uber', icon: 'car-sport', brandColor: '#000000', glowColor: 'rgba(255, 255, 255, 0.2)' },
  { keywords: ['lyft'], name: 'Lyft', icon: 'car', brandColor: '#FF00BF', glowColor: 'rgba(255, 0, 191, 0.28)' },
  { keywords: ['airbnb'], name: 'Airbnb', icon: 'home', brandColor: '#FF5A5F', glowColor: 'rgba(255, 90, 95, 0.28)' },
  { keywords: ['delta', 'united', 'american airlines'], name: 'Airlines', icon: 'airplane', brandColor: '#002244', glowColor: 'rgba(0, 51, 102, 0.3)' },
  { keywords: ['shell', 'chevron', 'exxon', 'bp '], name: 'Gas Station', icon: 'speedometer', brandColor: '#FFCC00', glowColor: 'rgba(255, 204, 0, 0.25)' },

  // Shopping & Retail
  { keywords: ['target'], name: 'Target', icon: 'disc', brandColor: '#CC0000', glowColor: 'rgba(204, 0, 0, 0.28)' },
  { keywords: ['walmart'], name: 'Walmart', icon: 'cart', brandColor: '#0071DC', glowColor: 'rgba(0, 113, 220, 0.28)' },
  { keywords: ['costco'], name: 'Costco', icon: 'cube', brandColor: '#E31837', glowColor: 'rgba(227, 24, 55, 0.28)' },
  { keywords: ['nike'], name: 'Nike', icon: 'shirt', brandColor: '#111111', glowColor: 'rgba(255, 255, 255, 0.2)' },
  { keywords: ['zara', 'h&m', 'uniqlo'], name: 'Apparel', icon: 'shirt-outline', brandColor: '#2C3E50', glowColor: 'rgba(44, 62, 80, 0.28)' },
  { keywords: ['ikea'], name: 'IKEA', icon: 'bed', brandColor: '#0058A3', glowColor: 'rgba(0, 88, 163, 0.28)' },

  // Tech, AI & SaaS
  { keywords: ['chatgpt', 'openai'], name: 'OpenAI', icon: 'hardware-chip', brandColor: '#10A37F', glowColor: 'rgba(16, 163, 127, 0.3)' },
  { keywords: ['github'], name: 'GitHub', icon: 'logo-github', brandColor: '#24292E', glowColor: 'rgba(255, 255, 255, 0.2)' },
  { keywords: ['figma'], name: 'Figma', icon: 'color-palette', brandColor: '#F24E1E', glowColor: 'rgba(242, 78, 30, 0.28)' },
  { keywords: ['notion'], name: 'Notion', icon: 'document-text', brandColor: '#000000', glowColor: 'rgba(255, 255, 255, 0.2)' },
  { keywords: ['adobe', 'photoshop'], name: 'Adobe', icon: 'brush', brandColor: '#FF0000', glowColor: 'rgba(255, 0, 0, 0.28)' },
  { keywords: ['steam', 'playstation', 'xbox', 'nintendo'], name: 'Gaming', icon: 'game-controller', brandColor: '#1B2838', glowColor: 'rgba(102, 192, 244, 0.28)' },
];

/**
 * Extracts merchant brand metadata or generates a sleek monogram fallback.
 */
export function getMerchantMeta(title = '') {
  if (!title) {
    return {
      isBrand: false,
      displayName: 'Transaction',
      icon: 'receipt-outline',
      brandColor: '#6366F1',
      glowColor: 'rgba(99, 102, 241, 0.2)',
      monogram: 'TX',
    };
  }

  const lower = title.toLowerCase().trim();

  for (const merchant of KNOWN_MERCHANTS) {
    for (const kw of merchant.keywords) {
      if (lower.includes(kw)) {
        return {
          isBrand: true,
          displayName: merchant.name,
          icon: merchant.icon,
          brandColor: merchant.brandColor,
          glowColor: merchant.glowColor,
          monogram: merchant.name.slice(0, 2).toUpperCase(),
        };
      }
    }
  }

  // Fallback: Generate two-letter monogram and pseudo-unique harmonious color
  const words = title.trim().split(/\s+/);
  let monogram = words[0] ? words[0].slice(0, 1).toUpperCase() : 'T';
  if (words.length > 1 && words[1]) {
    monogram += words[1].slice(0, 1).toUpperCase();
  } else if (words[0] && words[0].length > 1) {
    monogram += words[0].slice(1, 2).toUpperCase();
  }

  return {
    isBrand: false,
    displayName: title,
    icon: null,
    brandColor: null,
    glowColor: null,
    monogram,
  };
}
