// Pure display logic for the overview table rows. Intentionally free of gi:// imports.

const FLAT_TINT = 0.12
const MIN_TINT = 0.10
const TINT_RANGE = 0.22
const FULL_TINT_PERCENT = 6

const toNumber = value => {
  if (value === null || typeof value === 'undefined' || value === '') {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

const formatNumber = (number, decimals = 2) => number.toLocaleString(undefined, {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals
})

// Symbols like $ attach directly; alphabetic ones (CHF, GBp) need a space
export const currencyPrefix = symbol => !symbol ? '' : /[A-Za-z]$/.test(symbol) ? `${symbol} ` : symbol

const signOf = number => number > 0 ? '+' : number < 0 ? '−' : ''

export const pillTint = changePercent => {
  const percent = toNumber(changePercent)

  if (!percent) {
    return FLAT_TINT
  }

  const scaled = Math.min(Math.sqrt(Math.abs(percent) / FULL_TINT_PERCENT), 1)

  return Number((MIN_TINT + TINT_RANGE * scaled).toFixed(2))
}

export const buildRowModel = quote => {
  const model = {
    name: quote.FullName || quote.Symbol,
    symbol: quote.Symbol,
    error: quote.Error || null,
    price: '',
    change: '',
    percent: '',
    direction: 'flat',
    tint: FLAT_TINT,
    marketTag: quote.MarketState === 'PRE' ? 'PRE' : quote.MarketState === 'POST' ? 'POST' : null
  }

  if (model.error) {
    return model
  }

  const close = toNumber(quote.Close)
  const change = toNumber(quote.Change)
  const percent = toNumber(quote.ChangePercent)
  const currency = currencyPrefix(quote.CurrencySymbol)

  model.price = close === null ? '--' : `${currency}${formatNumber(close)}`

  if (change === null) {
    model.change = '--'
  } else {
    const decimals = change !== 0 && Math.abs(change) < 0.1 ? 4 : 2
    model.change = `${signOf(change)}${currency}${formatNumber(Math.abs(change), decimals)}`
  }

  if (percent === null) {
    model.percent = '--'
  } else {
    model.percent = `${signOf(percent)}${formatNumber(Math.abs(percent))}%`
  }

  const reference = percent !== null ? percent : change

  if (reference) {
    model.direction = reference > 0 ? 'up' : 'down'
  }

  model.tint = pillTint(percent)

  return model
}
