import { fetch } from '../helpers/fetch.js'
import { SettingsHandler } from '../helpers/settings.js'
import { createNewsListFromYahooData } from './dto/newsList.js'
import { createQuoteHistoricalFromYahooData } from './dto/quoteHistorical.js'
import { createQuoteSummaryFromYahooData, createQuoteSummaryFromYahooQuoteListData } from './dto/quoteSummary.js'
import { INTERVAL_MAPPINGS } from './meta/yahoo.js'

const COOKIE_URL = 'https://fc.yahoo.com/'
const CRUMB_URL = 'https://query2.finance.yahoo.com/v1/test/getcrumb'

const API_ENDPOINT = 'https://query2.finance.yahoo.com'
const API_VERSION_SUMMARY = 'v10/finance'
const API_VERSION_CHART = 'v8/finance'
const API_VERSION_QUOTE_LIST = 'v7/finance'
const RSS_NEWS_ENDPOINT = 'https://feeds.finance.yahoo.com/rss/2.0/headline?s={SYMBOL}&region=US&lang=en-US'

const defaultQueryParameters = {
  formatted: 'false',
  lang: 'en-US',
  region: 'US',
  crumb: '',
}

// const createQuoteSummaryFromYahooData = createQuoteSummaryFromYahooDataV6;

const ensurePrerequisites = async () => {
  const settings = new SettingsHandler()
  const cachedMeta = settings.yahoo_meta || {}
  let expiration = settings?.yahoo_meta?.expiration || 0
  const crumbStr = (cachedMeta.crumb || '').toString()

  // Old code cached 429 text
  if ((expiration > Date.now())  && (!crumbStr.toLowerCase().includes('too many requests'))) {
      return cachedMeta
  }

  const cookieResponse = await fetch({
    url: COOKIE_URL
  })

  const cookie = cookieResponse.headers.get_one('set-cookie')

  const crumbResponse = await fetch({
    url: CRUMB_URL,
    cookies: [cookie]
  })

  // log(`[YahooService] crumbResponse: ${JSON.stringify(crumbResponse)}`)

  const crumb = (crumbResponse?.ok && crumbResponse?.text()) ? crumbResponse?.text() : null
  const isValid = crumb != null && cookie != null && String(crumb).trim() !== '' && String(cookie).trim() !== '';
  expiration = isValid ? Date.now() + (30 * 24 * 60 * 60 * 1000) : 0

  const newMetaData = {
    cookie,
    crumb,
    expiration,
    isValid
  }

  settings.yahoo_meta = newMetaData

  if (!isValid) {
    log(`[YahooService] Failed to refresh yahoo_meta:  ${JSON.stringify(settings.yahoo_meta)}`)
  }

  // log(`[YahooService] settings.yahoo_meta before return: ${JSON.stringify(settings.yahoo_meta)}`)

  return newMetaData
}

export const getQuoteList = async ({ symbolsWithFallbackName }) => {
  const yahooMeta = await ensurePrerequisites()

  if (!yahooMeta.isValid) {
    log("[YahooService] Skipping get quote list: yahooMeta is invalid")
    return []
  }

  const queryParameters = {
    ...defaultQueryParameters,
    crumb: yahooMeta.crumb,
    fields: 'fields=currencySymbol,currency,fromCurrency,toCurrency,exchangeTimezoneName,exchangeTimezoneShortName,preMarketPrice,preMarketChange,preMarketChangePercent,gmtOffSetMilliseconds,regularMarketChange,regularMarketPreviousClose,regularMarketChangePercent,regularMarketVolume,regularMarketPrice,regularMarketTime,preMarketTime,postMarketTime,postMarketPrice,postMarketChange,postMarketChangePercent,exchangeName,longName,extendedMarketTime',
    symbols: symbolsWithFallbackName.map(item => item.symbol).join()
  }

  const url = `${API_ENDPOINT}/${API_VERSION_QUOTE_LIST}/quote`

  const response = await fetch({
    url,
    queryParameters,
    cookies: [yahooMeta.cookie]
  })

  const params = {
    symbolsWithFallbackName,
    quoteListData: response.json()
  }

  if (!response.ok) {
    params.error = `${response.statusText} - ${response.text()}`
  }

  return createQuoteSummaryFromYahooQuoteListData(params)
}

export const getQuoteSummary = async ({ symbol }) => {
  const yahooMeta = await ensurePrerequisites()
  if (!yahooMeta.isValid) {
    log("[YahooService] Skipping get quote summary: yahooMeta is invalid")
    return {}
  }

  const queryParameters = {
    ...defaultQueryParameters,
    crumb: yahooMeta.crumb,
    modules: 'price'
  }

  const url = `${API_ENDPOINT}/${API_VERSION_SUMMARY}/quoteSummary/${symbol}`

  const response = await fetch({
    url,
    queryParameters,
    cookies: [yahooMeta.cookie]
  })

  const params = {
    symbol,
    quoteData: response.json()
  }

  if (!response.ok) {
    params.error = `${response.statusText} - ${response.text()}`
  }

  return createQuoteSummaryFromYahooData(params)
}

export const getHistoricalQuotes = async ({ symbol, range = '1mo', includeTimestamps = true }) => {
  const yahooMeta = await ensurePrerequisites()
  if (!yahooMeta.isValid) {
    log("[YahooService] Skipping get historical quotes: yahooMeta is invalid")
    return {}
  }

  const queryParameters = {
    ...defaultQueryParameters,
    crumb: yahooMeta.crumb,
    range,
    includePrePost: false,
    interval: INTERVAL_MAPPINGS[range],
    includeTimestamps: includeTimestamps ? 'true' : 'false'
  }

  const url = `${API_ENDPOINT}/${API_VERSION_CHART}/chart/${symbol}`
  const response = await fetch({
    url,
    queryParameters,
    cookies: [yahooMeta.cookie]
  })

  if (response.ok) {
    return createQuoteHistoricalFromYahooData(response.json())
  } else {
    return createQuoteHistoricalFromYahooData(null, `${response.statusText} - ${response.text()}`)
  }
}

export const getNewsList = async ({ symbol }) => {
  const yahooMeta = await ensurePrerequisites()
  if (!yahooMeta.isValid) {
    log("[YahooService] Skipping get news list: yahooMeta is invalid")
    return {}
  }

  const queryParameters = {
    crumb: yahooMeta.crumb,
  }

  const url = RSS_NEWS_ENDPOINT.replace('{SYMBOL}', symbol)

  const response = await fetch({
    url,
    queryParameters,
    cookies: [yahooMeta.cookie]
  })

  if (response.ok) {
    return createNewsListFromYahooData(response.text())
  } else {
    return createNewsListFromYahooData(null, `${response.statusText} - ${response.text()}`)
  }
}
