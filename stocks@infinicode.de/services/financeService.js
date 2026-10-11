import { cacheOrDefault } from '../helpers/data.js'
import { Translations } from '../helpers/translations.js'

import { FINANCE_PROVIDER } from './meta/generic.js'
import { QuoteSummary } from './dto/quoteSummary.js'
import { QuoteHistorical } from './dto/quoteHistorical.js'
import { NewsList } from './dto/newsList.js'

import * as yahooService from '../services/yahooService.js'

const services = {
  [FINANCE_PROVIDER.YAHOO]: yahooService
}

export const getQuoteSummaryList = async ({ symbolsWithFallbackName, provider, settings = null, cancellable = null }) => {
  // Settings parameter is optional - defaults to using provider instrument names if not provided
  return cacheOrDefault(`summary_list_${symbolsWithFallbackName.map(item => item.symbol).sort().join('-')}_${provider}`, async () => {
    const service = services[provider]

    if (!service) {
      return symbolsWithFallbackName.map(({ symbol, fallbackName }) => new QuoteSummary(symbol, provider, fallbackName, Translations.INVALID_PROVIDER))
    }

    let resultList = []

    symbolsWithFallbackName = symbolsWithFallbackName.map(item => ({
      ...item,
      forceFallbackName: settings ? !settings.use_provider_instrument_names : false
    }))

    if (symbolsWithFallbackName?.length > 0) {
      resultList = await service.getQuoteList({ symbolsWithFallbackName, settings, cancellable })
    }

    return resultList
  })
}

export const getQuoteSummary = async ({ symbol, provider, fallbackName, settings = null, cancellable = null }) => {
  return cacheOrDefault(`summary_${symbol}_${provider}`, async () => {
    const service = services[provider]

    if (!service) {
      return new QuoteSummary(symbol, provider, fallbackName, Translations.INVALID_PROVIDER)
    }

    let summary = {}

    if (symbol) {
      summary = await service.getQuoteSummary({ symbol, settings, cancellable })
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

export const getHistoricalQuotes = async ({ symbol, provider, range = '1y', includeTimestamps = true, settings = null, cancellable = null }) => {
  return cacheOrDefault(`chart_${symbol}_${provider}_${range}`, () => {
    const service = services[provider]

    if (symbol && service) {
      return service.getHistoricalQuotes({ symbol, range, includeTimestamps, settings, cancellable })
    }

    const empty = new QuoteHistorical()
    empty.Error = service ? null : Translations.INVALID_PROVIDER
    return empty
  })
}

export const getNewsList = async ({ symbol, provider, settings = null, cancellable = null }) => {
  return cacheOrDefault(`news_${provider}_${symbol}`, () => {
    const service = services[provider]

    if (symbol && service) {
      return service.getNewsList({ symbol, settings, cancellable })
    }

    const empty = new NewsList()
    empty.Error = service ? null : Translations.INVALID_PROVIDER
    return empty
  }, 15 * 60 * 1000)
}
