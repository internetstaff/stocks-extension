import Clutter from 'gi://Clutter'
import GObject from 'gi://GObject'
import St from 'gi://St'
import Pango from 'gi://Pango'

import { getStockColorStyleClass, roundOrDefault } from '../../helpers/data.js'
import { MARKET_STATES } from '../../services/meta/generic.js'

export const StockTileCard = GObject.registerClass({
  GTypeName: 'StockExtension_StockTileCard'
}, class StockTileCard extends St.Button {
  _init (quoteSummary, settings) {
    super._init({
      style_class: 'card message stock-tile-card',
      can_focus: true,
      x_expand: true
    })

    this.cardItem = quoteSummary
    this._settings = settings

    const { symbol, price, change, changePercent, currencySymbol, isOffMarket } = this._getInfo()
    const colorClass = getStockColorStyleClass(change)
    const sign = change >= 0 ? '+' : ''
    const arrow = change >= 0 ? '▲' : '▼'

    const contentBox = new St.BoxLayout({
      vertical: true,
      x_expand: true,
      style_class: 'stock-tile-content'
    })
    this.set_child(contentBox)

    const topRow = new St.BoxLayout({
      x_expand: true,
      style_class: 'stock-tile-top-row'
    })

    const arrowLabel = new St.Label({
      style_class: `stock-tile-arrow ${colorClass}`
    })
    arrowLabel.set_text(arrow)

    const symbolLabel = new St.Label({
      style_class: 'stock-tile-symbol',
      text: ` ${symbol}`,
      x_expand: true
    })
    symbolLabel.get_clutter_text().set_ellipsize(Pango.EllipsizeMode.NONE)

    const pctLabel = new St.Label({
      style_class: `stock-tile-pct ${colorClass}`,
      text: `${sign}${roundOrDefault(changePercent)}%`,
      x_align: Clutter.ActorAlign.END
    })
    pctLabel.get_clutter_text().set_ellipsize(Pango.EllipsizeMode.NONE)

    topRow.add_child(arrowLabel)
    topRow.add_child(symbolLabel)
    topRow.add_child(pctLabel)

    const bottomRow = new St.BoxLayout({
      x_expand: true,
      style_class: 'stock-tile-bottom-row'
    })

    const priceText = `${roundOrDefault(price)}${currencySymbol ? ` ${currencySymbol}` : ''}${isOffMarket ? '*' : ''}`
    const priceLabel = new St.Label({
      style_class: 'stock-tile-price',
      text: priceText,
      x_expand: true
    })
    priceLabel.get_clutter_text().set_ellipsize(Pango.EllipsizeMode.NONE)

    const changeLabel = new St.Label({
      style_class: `stock-tile-change ${colorClass}`,
      text: `${sign}${roundOrDefault(change)}`,
      x_align: Clutter.ActorAlign.END
    })
    changeLabel.get_clutter_text().set_ellipsize(Pango.EllipsizeMode.NONE)

    bottomRow.add_child(priceLabel)
    bottomRow.add_child(changeLabel)

    contentBox.add_child(topRow)
    contentBox.add_child(bottomRow)
  }

  _getInfo () {
    const q = this.cardItem
    let price = q.Close
    let change = q.Change
    let changePercent = q.ChangePercent
    let isOffMarket = false

    if (this._settings.show_ticker_off_market_prices) {
      if (q.MarketState === MARKET_STATES.PRE) {
        price = q.PreMarketPrice
        change = q.PreMarketChange
        changePercent = q.PreMarketChangePercent
        isOffMarket = true
      } else if (q.MarketState === MARKET_STATES.POST) {
        price = q.PostMarketPrice
        change = q.PostMarketChange
        changePercent = q.PostMarketChangePercent
        isOffMarket = true
      }
    }

    return {
      symbol: q.Symbol,
      price,
      change: change || 0,
      changePercent: changePercent || 0,
      currencySymbol: q.CurrencySymbol,
      isOffMarket
    }
  }
})
