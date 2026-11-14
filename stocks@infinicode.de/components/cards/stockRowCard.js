import Clutter from 'gi://Clutter'
import GObject from 'gi://GObject'
import St from 'gi://St'
import Pango from 'gi://Pango'

import { getStockColorStyleClass } from '../../helpers/data.js'
import { buildRowModel } from '../../helpers/quoteRow.js'

const PILL_RGB = {
  up: '24, 160, 71',
  down: '244, 78, 63',
  flat: '128, 128, 128'
}

const COLOR_REFERENCE = { up: 1, down: -1, flat: 0 }

export const StockRowCard = GObject.registerClass({
  GTypeName: 'StockExtension_StockRowCard'
}, class StockRowCard extends St.Button {
  _init (quoteSummary) {
    super._init({
      style_class: 'stock-row',
      can_focus: true,
      x_expand: true
    })

    this.cardItem = quoteSummary

    const model = buildRowModel(quoteSummary)

    const row = new St.BoxLayout({
      style_class: 'stock-row-content',
      x_expand: true,
      y_align: Clutter.ActorAlign.CENTER
    })
    this.set_child(row)

    row.add_child(this._createNameBox(model))

    if (!model.error) {
      row.add_child(this._createLabel(model.price, 'stock-row-price'))
      row.add_child(this._createLabel(model.change, 'stock-row-change'))
      row.add_child(this._createPill(model))
    }
  }

  _createNameBox (model) {
    const nameBox = new St.BoxLayout({
      style_class: 'stock-row-name-box',
      x_expand: true,
      y_align: Clutter.ActorAlign.CENTER
    })

    const nameLabel = new St.Label({
      style_class: 'stock-row-name',
      text: model.name,
      y_align: Clutter.ActorAlign.CENTER
    })
    nameLabel.get_clutter_text().set_ellipsize(Pango.EllipsizeMode.END)
    nameBox.add_child(nameLabel)

    if (model.symbol) {
      const symbolLabel = this._createLabel(model.symbol, 'stock-row-symbol')
      symbolLabel.get_clutter_text().set_ellipsize(Pango.EllipsizeMode.NONE)
      nameBox.add_child(symbolLabel)
    }

    if (model.error) {
      // Provider errors can be a whole multi-line HTTP body: keep one ellipsized line so the name stays visible
      const errorLabel = this._createLabel(String(model.error).split('\n')[0], 'stock-row-error')
      errorLabel.get_clutter_text().set({ single_line_mode: true, ellipsize: Pango.EllipsizeMode.END })
      nameBox.add_child(errorLabel)
    }

    if (model.marketTag) {
      nameBox.add_child(this._createLabel(model.marketTag, 'stock-row-tag'))
    }

    return nameBox
  }

  _createPill (model) {
    const pill = new St.Bin({
      style_class: 'stock-row-pill',
      y_align: Clutter.ActorAlign.CENTER
    })

    pill.set_style(`background-color: rgba(${PILL_RGB[model.direction]}, ${model.tint});`)

    const colorClass = getStockColorStyleClass(COLOR_REFERENCE[model.direction])
    pill.set_child(new St.Label({
      style_class: `stock-row-pill-label ${colorClass}`,
      text: model.percent,
      x_align: Clutter.ActorAlign.CENTER
    }))

    return pill
  }

  _createLabel (text, styleClass) {
    return new St.Label({
      style_class: styleClass,
      text,
      y_align: Clutter.ActorAlign.CENTER
    })
  }
})
