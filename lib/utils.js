// lib/utils.js - Shared utility functions for TechYatri

export function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export function formatNumber(num) {
  if (typeof num === 'string') {
    if (num.toLowerCase().includes('k') || num.toLowerCase().includes('m')) return num;
    num = parseFloat(num) || 0;
  }
  if (!num) return '0';
  return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
}

export function formatDate(timestamp) {
  if (!timestamp) return 'Recently';
  if (typeof timestamp === 'string') return timestamp;
  if (typeof timestamp === 'number') {
    const diffDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return 'Recently';
}
