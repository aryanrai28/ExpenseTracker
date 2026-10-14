/**
 * merchantMap.js — Smart auto-categorization mapping.
 *
 * Maps common merchant name keywords to expense/income categories.
 * Used by AddEditTransactionModal to auto-select category when user types a title.
 */

const MERCHANT_TO_CATEGORY = [
  // Food & Dining
  { keywords: ['starbucks', 'mcdonald', 'burger king', 'wendy', 'chipotle', 'subway', 'dunkin', 'taco bell', 'pizza hut', 'domino', 'kfc', 'chick-fil-a', 'panera', 'whole foods', 'trader joe', 'safeway', 'kroger', 'walmart grocery', 'instacart', 'doordash', 'grubhub', 'uber eats', 'postmates', 'restaurant', 'cafe', 'bakery', 'diner', 'sushi', 'brunch', 'lunch', 'dinner', 'grocery', 'aldi', 'costco food'], category: 'food' },

  // Transport
  { keywords: ['uber', 'lyft', 'taxi', 'cab', 'gas station', 'shell', 'exxon', 'chevron', 'bp ', 'parking', 'toll', 'metro', 'transit', 'bus pass', 'train', 'amtrak', 'airline', 'flight', 'delta', 'united', 'american airlines', 'southwest', 'jetblue'], category: 'transport' },

  // Housing
  { keywords: ['rent', 'mortgage', 'landlord', 'lease', 'property tax', 'hoa', 'home insurance', 'apartment'], category: 'housing' },

  // Utilities
  { keywords: ['electric', 'water bill', 'gas bill', 'internet', 'comcast', 'verizon', 'at&t', 't-mobile', 'sprint', 'phone bill', 'utility', 'sewage', 'trash'], category: 'utilities' },

  // Entertainment
  { keywords: ['movie', 'cinema', 'theater', 'concert', 'ticket', 'amc', 'regal', 'bowling', 'arcade', 'gaming', 'playstation', 'xbox', 'steam', 'nintendo', 'twitch'], category: 'entertainment' },

  // Shopping
  { keywords: ['amazon', 'target', 'walmart', 'costco', 'best buy', 'apple store', 'nike', 'adidas', 'zara', 'h&m', 'uniqlo', 'nordstrom', 'macy', 'ebay', 'etsy', 'ikea', 'home depot', 'lowes'], category: 'shopping' },

  // Health & Fitness
  { keywords: ['gym', 'fitness', 'crossfit', 'yoga', 'peloton', 'planet fitness', 'equinox', 'doctor', 'hospital', 'pharmacy', 'cvs', 'walgreens', 'dentist', 'therapy', 'medical', 'health'], category: 'health' },

  // Education
  { keywords: ['tuition', 'university', 'college', 'school', 'course', 'udemy', 'coursera', 'masterclass', 'textbook', 'skillshare', 'education'], category: 'education' },

  // Subscriptions
  { keywords: ['netflix', 'spotify', 'hulu', 'disney+', 'hbo', 'apple music', 'youtube premium', 'amazon prime', 'audible', 'notion', 'figma', 'adobe', 'microsoft 365', 'google one', 'icloud', 'dropbox', 'github', 'chatgpt', 'openai', 'subscription'], category: 'subscriptions' },

  // Income categories
  { keywords: ['salary', 'paycheck', 'payroll', 'direct deposit', 'wages'], category: 'salary' },
  { keywords: ['freelance', 'contract', 'consulting', 'gig', 'side hustle', 'client payment'], category: 'freelance' },
  { keywords: ['dividend', 'interest', 'capital gain', 'stock', 'etf', 'crypto gain', 'investment return'], category: 'investments' },
  { keywords: ['bonus', 'gift', 'birthday money', 'cash gift', 'reward'], category: 'bonus' },
];

/**
 * Suggest a category based on transaction title.
 * Returns { categoryId, confidence } or null if no match.
 */
export function suggestCategory(title) {
  if (!title || title.length < 3) return null;

  const lower = title.toLowerCase().trim();

  for (const mapping of MERCHANT_TO_CATEGORY) {
    for (const keyword of mapping.keywords) {
      if (lower.includes(keyword)) {
        return {
          categoryId: mapping.category,
          confidence: keyword.length >= 5 ? 'high' : 'medium',
        };
      }
    }
  }

  return null;
}
