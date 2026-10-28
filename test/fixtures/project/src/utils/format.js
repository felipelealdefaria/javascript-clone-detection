export function formatPrice(amount, currency, locale = 'pt-BR') {
  if (amount == null || Number.isNaN(amount)) return '-'
  const value = Math.round(amount * 100) / 100
  const formatted = new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(value)
  const symbol = currency === 'BRL' ? 'R$' : currency
  return `${symbol} ${formatted}`
}

// Same as formatPrice, with an extra guard.
export function formatCost(total, code, locale = 'pt-BR') {
  if (total == null || Number.isNaN(total)) return '-'
  if (total < 0) return 'negative'
  const value = Math.round(total * 100) / 100
  const formatted = new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(value)
  const symbol = code === 'BRL' ? 'R$' : code
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
