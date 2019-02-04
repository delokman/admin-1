/*!
 * Copyright 2018 E-Com Club
 */

(function () {
  'use strict'

  // current tab ID
  var tabId = window.tabId
  var Tab = window.Tabs[tabId]
  // edit JSON document
  // var commit = Tab.commit
  var Data = function () {
    // current data from global variable
    return Tab.data
  }

  // setup basic order data
  var data = Data()
  var $orderBase = $('#t' + tabId + '-order-base')

  // watch amount values
  var $amount = $orderBase.find('#t' + tabId + '-order-amount')
  var $total = $amount.find('input[name="amount.total"]')
  $amount.find('input:not([name="amount.total"])').change(function () {
    setTimeout(function () {
      // recalculate order total value
      var amount = Data().amount
      var total = (amount.subtotal || 0) + (amount.freight || 0) - (amount.discount || 0)
      if (amount.tax) {
        total += amount.tax
      }
      if (amount.extra) {
        total += amount.extra
      }
      $total.val(formatMoney(total)).trigger('change')
    }, 150)
  })

  // handle amount extra fields collapse
  var $amountExtra = $amount.find('#t' + tabId + '-extra-amount')
  var toggleAmountExtra = function () {
    $amountExtra.children('div').slideToggle()
  }
  $amountExtra.children('a').click(toggleAmountExtra)
  if (data.amount) {
    if (data.amount.tax || data.amount.extra) {
      toggleAmountExtra()
    }
  }
}())
