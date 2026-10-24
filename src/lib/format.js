// src/lib/format.js — Shared formatting utilities for Fancy Atelier Parfums

/**
 * Format a number as Nigerian Naira.
 * @param {number} amount
 * @returns {string} e.g. "₦65,000"
 */
export function formatNaira(amount) {
  return '₦' + (amount || 0).toLocaleString('en-NG')
}

/**
 * Format an ISO date string into a human-readable Nigerian locale date.
 * @param {string} dateStr
 * @returns {string} e.g. "01 Nov 2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
