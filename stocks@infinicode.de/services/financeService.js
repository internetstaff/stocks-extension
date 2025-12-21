import { cacheOrDefault } from '../helpers/data.js'

import { FINANCE_PROVIDER } from './meta/generic.js'
import { QuoteSummary } from './dto/quoteSummary.js'

import * as yahooService from '../services/yahooService.js'
import * as eastMoneyService from '../services/eastMoneyService.js'

const services = {
  [FINANCE_PROVIDER.YAHOO]: yahooService,
  [FINANCE_PROVIDER.EAST_MONEY]: eastMoneyService
}

export const getQuoteSummaryList = async ({ symbolsWithFallbackName, provider, settings = null }) => {
  // Settings parameter is optional - defaults to using provider instrument names if not provided
  return cacheOrDefault(`summary_list_${symbolsWithFallbackName.map(item => item.symbol).sort().join('-')}_${provider}`, async () => {
    const service = services[provider]

    if (!service) {
      return symbolsWithFallbackName.map(({ symbol, fallbackName }) => new QuoteSummary(symbol, provider, fallbackName, 'Invalid Provider'))
    }

    let resultList = []

    symbolsWithFallbackName = symbolsWithFallbackName.map(item => ({
      ...item,
      forceFallbackName: settings ? !settings.use_provider_instrument_names : false
    }))

    if (symbolsWithFallbackName?.length > 0) {
      resultList = await service.getQuoteList({ symbolsWithFallbackName, settings })
    }

    return resultList
  })
}

export const getQuoteSummary = async ({ symbol, provider, fallbackName, settings = null }) => {
  return cacheOrDefault(`summary_${symbol}_${provider}`, async () => {
    const service = services[provider]

    if (!service) {
      return new QuoteSummary(symbol, provider, fallbackName, 'Invalid Provider')
    }

    let summary = {}

    if (symbol) {
      summary = await service.getQuoteSummary({ symbol, settings })
    }

    if (!summary.Symbol) {
      summary.Symbol = symbol
    }

    if (!summary.FullName || (settings && !settings.use_provider_instrument_names)) {
      summary.FullName = fallbackName
    }

    return summary
  })
}

export const getHistoricalQuotes = async ({ symbol, provider, range = '1y', includeTimestamps = true, settings = null }) => {
  return cacheOrDefault(`chart_${symbol}_${provider}_${range}`, () => {
    const service = services[provider]

    if (symbol && service) {
      return service.getHistoricalQuotes({ symbol, range, includeTimestamps, settings })
    }
  })
}

export const getNewsList = async ({ symbol, provider, settings = null }) => {
  return cacheOrDefault(`news_${provider}_${symbol}`, () => {
    const service = services[provider]

    if (symbol && service) {
      return service.getNewsList({ symbol, settings })
    }
  }, 15 * 60 * 1000)
}
