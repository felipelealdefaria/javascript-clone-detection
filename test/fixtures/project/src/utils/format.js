export function formatPrice(amount, currency) {
  if (amount == null) return '-'
  const value = Math.round(amount * 100) / 100
  const formatted = value.toFixed(2).replace('.', ',')
  return `${currency} ${formatted}`
}

// Same as formatPrice, with an extra guard.
export function formatCost(total, symbol) {
  if (total == null) return '-'
  if (total < 0) return 'negative'
  const value = Math.round(total * 100) / 100
  const formatted = value.toFixed(2).replace('.', ',')
  return `${symbol} ${formatted}`
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
