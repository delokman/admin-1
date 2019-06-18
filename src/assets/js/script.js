/*!
 * Copyright 2018 E-Com Club
 */

'use strict'


app.config({
  /*
  |--------------------------------------------------------------------------
  | Autoload
  |--------------------------------------------------------------------------
  |
  | By default, the app will load all the required plugins from /assets/vendor/
  | directory. If you need to disable this functionality, simply change the
  | following variable to false. In that case, you need to take care of loading
  | the required CSS and JS files into your page.
  |
  */
  autoload: true,

  /*
  |--------------------------------------------------------------------------
  | Provide
  |--------------------------------------------------------------------------
  |
  | Specify an array of the name of vendors that should be load in all pages.
  | Visit following URL to see a list of available vendors.
  |
  | https://thetheme.io/theadmin/help/article-dependency-injection.html#provider-list
  |
  */
  provide: [
    'jsgrid',
    'summernote',
    'dropzone',
    'typeahead',
    'tagsinput',
    'selectpicker',
    'colorpicker',
    'datepicker',
    'chartjs'
  ],

  /*
  |--------------------------------------------------------------------------
  | Google API Key
  |--------------------------------------------------------------------------
  |
  | Here you may specify your Google API key if you need to use Google Maps
  | in your application
  |
  | Warning: You should replace the following value with your own Api Key.
  | Since this is our own API Key, we can't guarantee that this value always
  | works for you.
  |
  | https://developers.google.com/maps/documentation/javascript/get-api-key
  |
  */
  googleApiKey: '',

  /*
  |--------------------------------------------------------------------------
  | Google Analytics Tracking
  |--------------------------------------------------------------------------
  |
  | If you want to use Google Analytics, you can specify your Tracking ID in
  | this option. Your key would be a value like: UA-XXXXXXXX-Y
  |
  */
  googleAnalyticsId: '',

  /*
  |--------------------------------------------------------------------------
  | Smooth Scroll
  |--------------------------------------------------------------------------
  |
  | By changing the value of this option to true, the browser's scrollbar
  | moves smoothly on scroll.
  |
  */
  smoothScroll: false,

  /*
  |--------------------------------------------------------------------------
  | Save States
  |--------------------------------------------------------------------------
  |
  | If you turn on this option, we save the state of your application to load
  | them on the next visit (e.g. make topbar fixed).
  |
  | Supported states: Topbar fix, Sidebar fold
  |
  */
  saveState: false,

  /*
  |--------------------------------------------------------------------------
  | Cache Bust String
  |--------------------------------------------------------------------------
  |
  | Adds a cache-busting string to the end of a script URL. We automatically
  | add a question mark (?) before the string. Possible values are: '1.2.3',
  | 'v1.2.3', or '123456789'
  |
  */
  cacheBust: ''
});


(function () {
  'use strict'

  window.startMony = function (store, user, session) {
    // https://github.com/ecomclub/mony
    var params = {
      storeId: store.store_id,
      name: user.name,
      gender: null,
      email: user.email,
      language: window.lang === 'pt_br' ? 'Português' : 'English',
      // authentication
      myId: user._id
    }

    // setup client
    window.Mony.init(params, session.access_token, function (err, html) {
      // response callback
      if (!err) {
        writeMsg(html)
      } else {
        // @TODO
        console.error(err)
      }
    })

    var writeMsg = function (msg, reverse) {
      if (msg && msg !== '') {
        var classes = 'media media-chat '
        if (reverse) {
          classes += 'media-chat-reverse'
        } else {
          classes += 'media-chat-default'
        }
        // mount chat message HTML block
        var html = '<div class="' + classes + '">' +
                     '<div class="media-body">' +
                       '<p>' + msg + '</p>' +
                     '</div>' +
                   '</div>'
        $('#mony').append(html).scrollTop(9999)
      }
    }

    var sendQuestion = function () {
      var el = $('#dock-chat .publisher-input')
      var text = el.val()
      if (text !== '') {
        writeMsg(text, true)
        // send question to chatbot API
        window.Mony.sendMessage(text)
        // clear input
        el.val('')
      }
    }

    // button click
    $('#dock-chat .publisher-btn').click(sendQuestion)
    // keyboard enter
    $('#dock-chat .publisher-input').keypress(function (e) {
      if (e.which === 13) {
        sendQuestion()
      }
    })
  }

  // auxiliary local only variables
  var decimalPoint

  window.appReady = function () {
    // console.log('Setup JS plugins')
    // plugins localization
    if (window.lang === 'pt_br') {
      $.getScript('/assets/vendor/jsgrid/i18n/jsgrid-pt-br.js', function () {
        jsGrid.locale('pt-br')
      })
      $.getScript('/assets/vendor/summernote/lang/summernote-pt-BR.js', function () {
        $.summernote.options.lang = 'pt-BR'
      })
      $.getScript('/assets/vendor/bootstrap-datepicker/locales/bootstrap-datepicker.pt-BR.min.js', function () {
        $.fn.datepicker.defaults.language = 'pt-BR'
      })
      decimalPoint = ','
    } else {
      // default en-US
      decimalPoint = '.'
    }

    // setup general preloaded plugins
    $('select').selectpicker({
      style: 'btn-light',
      noneSelectedText: '--',
      windowPadding: 70
    })

    // handle manual action topbar toggle
    $('#topbar-action-toggle').click(function () {
      var $topbar = $('#topbar-action')
      if (!$topbar.hasClass('h-auto')) {
        // hide
        $topbar.slideUp(200, function () {
          $(this).find('#topbar-action-body').addClass('hidden')
          $(this).addClass('h-auto').fadeIn()
        })
      } else {
        // show
        $topbar.hide().removeClass('h-auto').slideDown(200, function () {
          $(this).find('#topbar-action-body').hide().removeClass('hidden').fadeIn()
        })
      }
    })

    /* jQuery addons */

    // https://gist.github.com/beiyuu/2029907
    // Source here: http://plugins.jquery.com/project/selectRange
    $.fn.selectRange = function (start, end) {
      var e = $(this)[0]
      if (e) {
        if (e.setSelectionRange) {
          /* WebKit */
          e.focus()
          e.setSelectionRange(start, end)
        } else if (e.createTextRange) {
          /* IE */
          var range = e.createTextRange()
          range.collapse(true)
          range.moveEnd('character', end)
          range.moveStart('character', start)
          range.select()
        } else if (e.selectionStart) {
          e.selectionStart = start
          e.selectionEnd = end
        }
      }
    }

    // https://github.com/plentz/jquery-maskmoney
    $.fn.inputMoney = function (skipPlaceholder) {
      // mask inputs with currency pattern
      var money = formatMoney(0)
      if (!skipPlaceholder) {
        $(this).attr('placeholder', money)
      }

      // currency symbol as prefix
      var maskOptions = {
        prefix: money.replace(/0.*/, ''),
        allowNegative: true,
        decimal: decimalPoint
      }
      if (decimalPoint === '.') {
        maskOptions.thousands = ','
      } else {
        maskOptions.thousands = '.'
      }
      $(this).maskMoney(maskOptions)
    }
  }

  /* utilities */

  var parseLang = function (lang) {
    if (!lang) {
      // try to get global lang variable
      lang = window.lang
    }
    if (lang) {
      // format pt-BR, en-US
      lang = lang.replace('_', '-')
    } else {
      // default lang
      lang = 'pt-BR'
    }
    return lang
  }

  window.keyIsNumber = function (e) {
    if (e.which !== 13 && e.which !== 8) {
      var charCode = (e.which) ? e.which : e.keyCode
      if (charCode > 95 && charCode < 106) {
        // numeric keyboard
        charCode -= 48
      }
      if (isNaN(String.fromCharCode(charCode))) {
        e.preventDefault()
        return false
      } else {
        return true
      }
    }
  }

  window.fixScrollbars = function ($el) {
    // handle scrollbars inside loaded container
    $el.find('.scrollable').each(function () {
      if ($(this).hasClass('scrollable-x')) {
        $(this).hover(function () {
          // force scroll to show scrollbar
          if (!$(this).find('.ps-scrollbar-x-rail').is(':visible')) {
            $(this).scrollLeft(1)
          }
        })
      }
    }).perfectScrollbar({
      wheelPropagation: false,
      wheelSpeed: 0.5
    })
  }

  window.formatMoney = function (price, currency, lang) {
    if (!currency) {
      // default currency, Reais
      currency = 'BRL'
    }
    lang = parseLang(lang)
    var priceString
    try {
      priceString = price.toLocaleString(lang, { style: 'currency', currency: currency })
    } catch (e) {
      // fallback
      priceString = price
    }
    return priceString
  }

  window.formatDate = function (dateString, list, format, lang) {
    lang = parseLang(lang)
    var date = new Date(dateString)
    if (date && !isNaN(date.getTime())) {
      try {
        if (!list) {
          // returns date without time by default
          list = [ 'day', 'month', 'year' ]
        }
        if (!format) {
          // resumed by default with 2-digit format instead of numeric
          format = '2-digit'
        }
        var options = {}
        for (var i = 0; i < list.length; i++) {
          options[list[i]] = format
        }
        return date.toLocaleDateString(lang, options)
      } catch (e) {
        // ignore
      }
    }
    // fallback
    return dateString
  }

  window.formatPhone = function (phoneObj, lang) {
    if (phoneObj.country_code) {
      // international phone number
      return '+' + phoneObj.country_code + ' ' + phoneObj.number
    }

    // try to format by current lang
    var phoneStr = phoneObj.number
    if ((lang || window.lang) === 'pt_br') {
      var ln = phoneStr.length
      // 8888-9999 ~ (31) 8888-9999 ~ (31) 9 8888-9999
      if (ln >= 8 && ln <= 11) {
        // parse to BR phone number formats
        var phoneBr = ''
        if (ln > 9) {
          // first two digits make up the region code
          phoneBr = '(' + phoneStr.slice(0, 2) + ') '
        }
        // split phone string into two parts
        var start = ln - 8
        var middle = start + 4
        if (ln === 9 || ln === 11) {
          // cellphone ninth digit
          phoneBr += phoneStr.slice(start - 1, start) + ' '
        }
        return phoneBr + phoneStr.substring(start, middle) + '-' + phoneStr.substring(middle)
      }
    }
    return phoneStr
  }

  window.stringToNumber = function (str) {
    // parse value to number
    if (decimalPoint !== '.') {
      str = str.replace(/\./g, '').replace(decimalPoint, '.')
    }
    // remove prefix, suffix and invalid chars
    str = str.replace(/[^0-9-.]/g, '')
    if (str.indexOf('.') === -1) {
      // no decimals
      return parseInt(str, 10)
    } else {
      return parseFloat(str)
    }
  }

  window.numberToString = function (num, decimals, forceDecimalScale) {
    // parse value to string
    var str
    if (decimals) {
      str = num.toString()
      var thousandsDelimiter
      if (decimalPoint !== '.') {
        str = str.replace('.', decimalPoint)
        thousandsDelimiter = '.'
      } else {
        thousandsDelimiter = ','
      }
      // format with thousands separator
      str = str.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsDelimiter)
      if (forceDecimalScale && str.indexOf(decimalPoint) === -1) {
        // default decimal scale
        str += decimalPoint + '00'
      }
    } else {
      // integer
      str = parseInt(num, 10).toString()
    }
    return str
  }

  window.newTabLink = function (link) {
    var win = window.open(link, '_blank')
    if (win) {
      win.focus()
    }
  }

  window.cutString = function (str, maxLength, suffix) {
    if (maxLength < str.length) {
      // trim the string to the maximum length plus one char (space)
      var trimmed = str.substr(0, maxLength + 1)
      // re-trim if we are in the middle of a word
      var space = trimmed.lastIndexOf(' ')
      if (space > -1) {
        trimmed = trimmed.substr(0, space)
      }
      if (suffix) {
        return trimmed + suffix
      } else {
        return trimmed
      }
    } else {
      return str
    }
  }

  window.getFromDotNotation = function (obj, prop) {
    var parts = prop.split('.')
    if (parts.length <= 1) {
      // no dot notation
      return obj[prop]
    } else {
      for (var i = 0; i < parts.length; i++) {
        if (typeof obj !== 'object' || obj === null) {
          // property does not exists on the object
          return undefined
        }
        obj = obj[parts[i]]
      }
      return obj
    }
  }

  window.getProperties = function (obj, propsList) {
    // return new object only with listed properties
    var props = propsList.split(',')
    var newObj = {}
    for (var i = 0; i < props.length; i++) {
      var prop = props[i]
      newObj[prop] = obj[prop]
    }
    return newObj
  }

  window.clearAccents = function (str, removeSpaces) {
    // replace common accents
    str = str
      .replace(/[çć]/g, 'c')
      .replace(/[ÇĆ]/g, 'C')
      .replace(/[áâãà]/g, 'a')
      .replace(/[ÁÂÃÀ]/g, 'A')
      .replace(/[éêẽ]/g, 'e')
      .replace(/[ÉÊẼ]/g, 'E')
      .replace(/[íîĩ]/g, 'i')
      .replace(/[ÍÎĨ]/g, 'I')
      .replace(/[óôõ]/g, 'o')
      .replace(/[ÓÔÕ]/g, 'O')
      .replace(/[úûõ]/g, 'u')
      .replace(/[ÚÛŨ]/g, 'U')
    if (removeSpaces) {
      if (typeof removeSpaces !== 'string') {
        // just clear
        removeSpaces = ''
      }
      // replace spaces and new lines
      str = str.replace(/[\s\n]/g, removeSpaces)
    }
    return str
  }

  window.normalizeString = function (str) {
    // generate normalize ID from string
    return clearAccents(str.toLowerCase(), '_')
  }

  window.randomInt = function (min, max) {
    // generate random arbitrary number
    return Math.floor(Math.random() * (max - min)) + min
  }

  window.objectIdPad = function (id, index) {
    // mix and return base ID with index
    return id.substring(0, 24 - index.length) + index
  }

  window.randomObjectId = function () {
    // generate 24 chars hexadecimal string
    // return unique and valid MongoDB ObjectId pattern
    var objectId = randomInt(10000, 99999) + '0' + Date.now()
    // pad zeros
    while (objectId.length < 24) {
      objectId += '0'
    }
    return objectId
  }

  window.substringMatcher = function (data) {
    // Ref.: http://twitter.github.io/typeahead.js/examples/
    return function findMatches (q, cb) {
      var strs
      if (typeof data === 'function') {
        // keep it reactive
        strs = data()
      } else {
        strs = data
      }

      var matches, substrRegex
      // an array that will be populated with substring matches
      matches = []
      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i')
      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function (i, str) {
        if (substrRegex.test(str)) {
          matches.push(str)
        }
      })
      cb(matches)
    }
  }

  var toggleBlocksByValue = function ($form, $ref, updateInputs) {
    // show or hide blocks based on selected value
    var currentValue = $ref.val()
    $form.find('div[data-update="' + $ref.attr('name') + '"] > *').each(function () {
      var refValue = $(this).data('value')
      if (!refValue || refValue === currentValue) {
        $(this).slideDown()
      } else {
        // hide block
        $(this).slideUp()
        /* clear nested inputs
        if (updateInputs) {
          $(this).find('input,select,textarea').each(function () {
            $(this).val($(this).data('default') || '')
          }).trigger('change')
        }
        */

        if (!refValue) {
          // default block
          // show when no block matched current value
          var $default = $(this)
          setTimeout(function () {
            if (!$default.siblings(':visible').length) {
              $default.slideDown()
            }
          }, 500)
        }
      }
    })
  }

  window.handleInputs = function ($form, toData) {
    /*
      default form setup
      handle custom data attributes and callback on change
    */

    $form.find('input[type="checkbox"]').change(function () {
      // true for checkbox type
      toData($(this), true)
    })

    $form.find('input[type="radio"]').change(function () {
      var $checked = $form.find('input[name="' + $(this).attr('name') + '"]:checked')
      toData($checked)

      // check if other elements are controled by this options
      var disable = $checked.data('disable')
      if (disable) {
        $form.find('[name="' + disable + '"]').each(function () {
          if ($(this).data('enable-value') === $checked.val()) {
            $(this).removeAttr('disabled').focus()
          } else {
            $(this).attr('disabled', true).val('').trigger('change')
          }
        })
      }
    })

    $form.find('input[type="text"],input[type="email"],select,textarea').change(function () {
      toData($(this))

      // check if other input field is filled based on this
      var fillField = $(this).data('fill-field')
      if (fillField) {
        var $input = $form.find('[name="' + fillField + '"]')
        var val = $(this).val()

        // prepare string value before set on input
        var replaceAccents = $input.data('fill-clear-accents')
        if (replaceAccents) {
          val = clearAccents(val, replaceAccents)
        }
        if ($input.data('fill-case') === 'lower') {
          val = val.toLowerCase()
        }
        var regex = $input.data('fill-pattern')
        if (regex) {
          // RegExp to remove invalid chars
          val = val.replace(new RegExp(regex, 'g'), '')
        }
        var maxLength = $input.attr('maxlength')
        if (maxLength) {
          val = val.substr(0, parseInt(maxLength, 10))
        }
        $input.val(val).trigger('change')
      }

      // toggle related blocks based on current value
      if ($(this).data('toggle-update')) {
        // updateInputs = true
        toggleBlocksByValue($form, $(this), true)
      }
    })

    $form.find('input[type="tel"],input[type="number"]').change(function () {
      if ($(this).data('numeric-string')) {
        $(this).data('value', $(this).val().replace(/\D/g, ''))
      }
      toData($(this))
    })

    /* input masking */

    // mask currency
    $form.find('input[data-money]').inputMoney()

    // custom masks with inputmask plugin
    // https://github.com/RobinHerbots/Inputmask
    $form.find('input[data-mask]').each(function () {
      switch ($(this).data('mask')) {
        case 'tel':
          $(this).inputmask([
            // array of phone number formats
            '(99) 9999-9999',
            '(99) 9 9999-9999',
            // generic for international phone numbers
            '99999[9{1,10}]'
          ])
          break

        case 'zip':
          if (window.lang === 'pt_br') {
            // brazilian CEP format
            $(this).inputmask('99999-999')
          }
          break

        case 'date':
          if (window.lang === 'pt_br') {
            // brazilian birth date
            $(this).inputmask('99/99/9999')
          } else {
            // american birth date
            $(this).inputmask('9999-99-99')
          }
          break
      }
    })

    $form.find('input[type="number"]').keydown(function (e) {
      // allow: backspace, delete, tab, escape, enter
      var allowed = [46, 8, 9, 27, 13]
      var scale = $(this).attr('step')
      if (scale && (scale === 'any' || scale.indexOf('.') !== -1)) {
        // not only integer
        // allow: comma and dot
        allowed.push(110, 188, 190)
      }
      var min = $(this).attr('min')
      if (!min || parseInt(min, 10) < 0) {
        // not only positive
        // allow: substract and dash
        allowed.push(109, 173, 189)
      }

      if ($.inArray(e.keyCode, allowed) !== -1 ||
      // allow: Ctrl(Command)+(A,C,V,X)
      ($.inArray(e.keyCode, [65, 67, 86, 88]) !== -1 && (e.ctrlKey === true || e.metaKey === true)) ||
      // allow: home, end, left, right, down, up
      (e.keyCode >= 35 && e.keyCode <= 40)) {
        // let it happen, don't do anything
        return
      }
      // ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault()
      }
    })

    /* minor additional effects */

    $('input[readonly]').click(function () {
      $(this).select()
    })
  }

  var nestedForm = function ($form, obj, prop) {
    // setup input values with current nested object from list
    var objectId = obj._id
    // reset input values
    $form.find('input,select,textarea').data('object-id', objectId).val('')
    setupInputValues($form, obj, prop + '.')
    // fix select fields
    $form.find('select').selectpicker('refresh')
  }

  // setup blocks for array of nested objects
  window.handleNestedObjects = function (Data, commit, $block, $add, $remove, $next, prop, handleObj) {
    var index
    var isFormHidden = true
    var toggleHidden = function (list) {
      if (list && list.length) {
        if (isFormHidden) {
          // show the form and hide empty message
          $block.slideDown().prev().slideUp()
          isFormHidden = false
        }
      } else if (!isFormHidden) {
        // empty list
        // hide the form and show empty message
        $block.slideUp().prev().slideDown()
        isFormHidden = true
      }
    }

    var toggleForm = function (list) {
      // set form up with current object from list
      if (list && list.length) {
        if (typeof index !== 'number' || index < 0 || list.length <= index) {
          // first object
          index = 0
        }
        nestedForm($block, list[index], prop)
      }
    }

    var toggleButtons = function (list) {
      // toggle next and remove buttons based on list length
      if (list && list.length) {
        $remove.removeAttr('disabled')
        if (list.length > 1) {
          $next.removeAttr('disabled')
          return
        }
      } else {
        // empty list
        $remove.attr('disabled', true)
      }
      $next.attr('disabled', true)
    }

    var toggleAll = function (list) {
      if (!list) {
        list = Data()[prop]
      }
      // toggle form visibility if needed
      toggleHidden(list)
      // setup form fields
      toggleForm(list)
      // enable or disable control buttons
      toggleButtons(list)
    }
    toggleAll()

    var add = function () {
      var data = Data()
      if (!data[prop]) {
        data[prop] = []
      }
      var list = data[prop]
      // create new object
      var obj = { _id: randomObjectId() }
      if (typeof handleObj === 'function') {
        handleObj(obj)
      }

      // add object to list
      list.push(obj)
      index = list.length - 1
      // fix input names before handling form
      $block.find('input[data-name]').each(function () {
        $(this).attr('name', $(this).data('name'))
      })
      // setup new object on form
      toggleAll(list)
      // focus on required text input (if any)
      $block.find('input[required]').first().focus()
      // commit only to perform reactive actions
      commit(data, true)
    }
    $add.click(add)

    // handle link to create transaction (when empty)
    $block.prev().find('a').click(function () {
      $add.click()
    })

    $remove.click(function () {
      var data = Data()
      var list = data[prop]
      // remove current index from list
      list.splice(index, 1)
      // update form and buttons
      toggleAll(list)
      // commit only to perform reactive actions
      commit(data, true)
    })

    $next.click(function () {
      // next object on list
      index++
      toggleAll()
    })

    /* return function to manually add object to list
    return add
    */
  }

  window.setupInputValues = function ($form, data, prefix, objectId) {
    if (!prefix) {
      prefix = ''
    }
    for (var prop in data) {
      var val = data[prop]
      var $el = $form.find('[name="' + prefix + prop + '"]:not(:disabled)')
      if (objectId) {
        $el = $el.filter(function () { return $(this).data('object-id') === objectId })
      }
      /*
      if (prefix !== '') {
        console.log(prefix + prop, $el)
      }
      */
      var i

      if ($el.length) {
        if (!$el.is('input:file')) {
          switch (typeof val) {
            case 'string':
              if ($el.attr('type') !== 'radio') {
                $el.val(val)
                // toggle related blocks based on current value
                if ($el.data('toggle-update')) {
                  toggleBlocksByValue($form, $el)
                }
              } else {
                // check respective radio input
                $el.filter(function () { return $(this).val() === val }).click()
              }
              break

            case 'number':
              // format number before set value
              if ($el.data('money')) {
                $el.val(formatMoney(val))
              } else if ($el.attr('type') === 'number') {
                $el.val(val)
              } else {
                $el.val(numberToString(val, !($el.data('integer'))))
              }
              break

            case 'object':
              // handle JSON objects and arrays
              // select fields ?
              if (Array.isArray(val)) {
                if (!$el.hasClass('tagsinput')) {
                  var list = []
                  for (i = 0; i < val.length; i++) {
                    var item = val[i]
                    if (typeof item !== 'string') {
                      // array of objects
                      list.push(JSON.stringify(item))
                    } else {
                      list.push(item)
                    }
                  }
                  $el.val(list)
                } else {
                  // add array items with tagsinput plugin
                  ;(function ($el, val) {
                    setTimeout(function () {
                      for (var i = 0; i < val.length; i++) {
                        $el.tagsinput('add', val[i])
                      }
                    }, 400)
                  }($el, val))
                }
              } else if (val !== null) {
                // JSON object
                $el.val(JSON.stringify(val))
              }
              break

            case 'boolean':
              // checkbox
              if (val) {
                $el.attr('checked', true)
              } else {
                $el.removeAttr('checked')
              }
          }
        }
      } else if (typeof val === 'object' && val !== null) {
        // recursive
        var nextPrefix = prefix + prop
        if (!Array.isArray(val)) {
          nextPrefix += '.'
          // nested object
          setupInputValues($form, val, nextPrefix)
        } else if (val[0] && typeof val[0] === 'object') {
          // array of nested objects
          for (i = 0; i < val.length; i++) {
            var arrayPrefix = nextPrefix
            if (!val[0]._id) {
              arrayPrefix += '[].' + i
            }
            arrayPrefix += '.'
            setupInputValues($form, val[i], arrayPrefix, val[i]._id)
          }
        }
      }
    }
  }

  window.getCombinations = function (options, optionIndex, results, current) {
    // receive object of arrays
    // set default params
    if (optionIndex === undefined) {
      optionIndex = 0
    }
    if (!results) {
      results = []
    }
    if (!current) {
      current = {}
    }

    // returns all possible combinations
    var allKeys = Object.keys(options)
    var optionKey = allKeys[optionIndex]
    var vals = options[optionKey]
    if (Array.isArray(vals)) {
      for (var i = 0; i < vals.length; i++) {
        current[optionKey] = vals[i]
        if (optionIndex + 1 < allKeys.length) {
          getCombinations(options, optionIndex + 1, results, current)
        } else {
          // clone the object
          var res = Object.assign({}, current)
          results.push(res)
        }
      }
    }
    return results
  }
}())


/*
|--------------------------------------------------------------------------
| Application Is Ready
|--------------------------------------------------------------------------
|
| When all the dependencies of the page are loaded and executed,
| the application automatically call this function. You can consider it as
| a replacer for jQuery ready function - "$( document ).ready()".
|
*/

app.ready(function () {
  var session = {}
  var reload = function () {
    // handle page reload
    // keep session
    for (var prop in session) {
      if (session.hasOwnProperty(prop)) {
        sessionStorage.setItem(prop, session[prop])
      }
    }
    // skip confirmation prompt
    $(window).off('beforeunload')
    // all done, reload browser tab
    location.reload()
  }

  var fatalError = function (err) {
    if (err) {
      // debug only
      console.error(err)
    }
    // send message then reload page to restart app
    alert(i18n({
      'en_us': 'Fatal error, restarting in 3 seconds',
      'pt_br': 'Erro fatal, reiniciando em 3 segundos'
    }))
    // restart after delay
    setTimeout(function () {
      reload()
    }, 3000)
  }

  var el
  var lang = localStorage.getItem('lang')
  if (!lang || !/^[a-z]{2}(_[a-z]{2})?$/.test(lang)) {
    // default language
    lang = 'pt_br'
  }
  window.lang = lang

  // set up the languages dropdown menu
  el = $('#langs-menu [data-lang="' + lang + '"]')
  // $('#langs-menu > a').removeClass('active')
  el.addClass('active')
  $('#current-lang')
    // copy img src
    .find('img').attr('src', el.find('img').attr('src'))
    // set language initials
    .next().text(lang.split('_')[0].toUpperCase())

  // change language onclick
  $('#langs-menu > a').click(function () {
    localStorage.setItem('lang', $(this).data('lang'))
    reload()
  })

  var i18n = function (label) {
    if (typeof label === 'boolean') {
      // parse boolean to 'yes' or 'no' string
      if (label) {
        label = {
          'en_us': 'Yes',
          'pt_br': 'Sim'
        }
      } else {
        label = {
          'en_us': 'No',
          'pt_br': 'Não'
        }
      }
    }

    if (typeof label === 'object' && label !== null) {
      if (label.hasOwnProperty('en_us')) {
        // object with languages options
        if (label.hasOwnProperty(lang)) {
          return label[lang]
        } else {
          // en_us as default
          return label.en_us
        }
      } else {
        // recursive
        for (var prop in label) {
          if (label.hasOwnProperty(prop)) {
            label[prop] = i18n(label[prop])
          }
        }
      }
    }
    return label
  }
  window.i18n = i18n

  // render language texts
  $('head').append('<style type="text/css">' +
    '.i18n > [data-lang="' + lang + '"]{' +
      'display: inline;' +
    '}' +
  '</style>')
  $('.after-i18n').fadeIn()

  var dictionary = {
    // menu
    'home': i18n({
      'en_us': 'Home',
      'pt_br': 'Início'
    }),
    'resources': i18n({
      'en_us': 'Resources',
      'pt_br': 'Recursos'
    }),
    'channels': i18n({
      'en_us': 'Sales channels',
      'pt_br': 'Canais de venda'
    }),
    'media': i18n({
      'en_us': 'Media',
      'pt_br': 'Mídia'
    }),
    'go_to_store': i18n({
      'en_us': 'Go to store',
      'pt_br': 'Ir à loja'
    }),
    'themes': i18n({
      'en_us': 'Themes',
      'pt_br': 'Temas'
    }),
    'settings': i18n({
      'en_us': 'Settings',
      'pt_br': 'Configurações'
    }),
    'all_the': i18n({
      'en_us': 'All the',
      'pt_br': 'Todos os'
    }),
    'create': i18n({
      'en_us': 'Add',
      'pt_br': 'Adicionar'
    }),
    // general
    'unknown_error': i18n({
      'en_us': 'Unknown error, please try again',
      'pt_br': 'Erro desconhecido, por favor tente novamente'
    })
  }

  var hideToastr = function () {
    // implement function to hide app toast manually
    $('div.toast.reveal').removeClass('reveal')
  }

  // fix toast for objects as param
  var notification = app.toast
  app.toast = function (obj) {
    if (typeof obj !== 'string' && obj) {
      try {
        // try to parse to string
        obj = JSON.stringify(obj)
      } catch (err) {
        console.error(err)
        return
      }
    }
    notification(obj)

    // keep toast while mouse is over the element
    setTimeout(function () {
      $('div.toast').one('mouseenter', function () {
        $(this).addClass('fix-reveal').one('mouseleave', function () {
          $(this).removeClass('fix-reveal')
        })
      })
    }, 30)
  }

  var apiError = function (json) {
    // handle API error response
    var msg
    if (typeof json === 'object' && json !== null) {
      if (json.hasOwnProperty('user_message')) {
        msg = json.user_message[lang]
      } else if (json.hasOwnProperty('message')) {
        msg = json.message
      }
    }
    if (msg !== undefined) {
      // valid JSON error
      console.log('API Error Code: ' + json.error_code)
    } else {
      msg = dictionary.unknown_error
    }

    // notification
    app.toast(msg, {
      duration: 7000
    })
  }

  if (typeof login === 'boolean' && login === true) {
    var dynamicBg = function (selector) {
      // change background image
      var images
      var setImages = function () {
        images = [
          '/assets/img/bg/coffee.jpg',
          '/assets/img/bg/notebook.jpg',
          '/assets/img/bg/numbers.jpg',
          '/assets/img/bg/pens.jpg',
          '/assets/img/bg/table.jpg',
          '/assets/img/bg/writer.jpg'
        ]
      }
      setImages()

      var changeBg = function () {
        // load image first
        var newImg = new Image()
        newImg.onload = function () {
          var img = this
          $(selector).fadeOut(1000, function () {
            $(this).css('background-image', 'url(' + img.src + ')').fadeIn()
          })
        }

        // select random image from array
        var el = Math.floor((Math.random() * (images.length - 1)))
        newImg.src = images[el]
        images.splice(el, 1)
        if (images.length === 0) {
          setImages()
        }
      }
      changeBg()
      setInterval(changeBg, 60000)
    }
    dynamicBg('#full-bg')

    // random quote of the day
    // select random quote from array
    var quote = (function () {
      var quotes = [{
        msg: {
          en_us: 'Start where you are. Use what you have. Do what you can.',
          pt_br: 'Comece de onde você está. Use o que você tiver. Faça o que você puder.'
        },
        author: 'Arthur Ashe'
      }, {
        msg: {
          en_us: 'Success is the sum of repeated small efforts day after day.',
          pt_br: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.'
        },
        author: 'Robert Collier'
      }, {
        msg: {
          en_us: 'All progress takes place outside the comfort zone.',
          pt_br: 'Todo progresso acontece fora da zona de conforto.'
        },
        author: 'Michael John Bobak'
      }, {
        msg: {
          en_us: 'Courage is the resistance and mastery of fear, not its absence.',
          pt_br: 'Coragem é a resistência e o domínio do medo, não a ausência dele.'
        },
        author: 'Mark Twain'
      }, {
        msg: {
          en_us: 'The only place where success comes before work is in the dictionary.',
          pt_br: 'O único lugar em que o sucesso vem antes do trabalho é no dicionário.'
        },
        author: 'Vidal Sassoon'
      }, {
        msg: {
          en_us: 'To dream small and big requires the same work.',
          pt_br: 'Sonhar grande e sonhar pequeno dá o mesmo trabalho.'
        },
        author: 'Jorge Paulo Lemann'
      }, {
        msg: {
          en_us: 'If you want to live and are curious, sleeping is not the most important thing.',
          pt_br: 'Se você tem vontade de viver e curiosidade, dormir não é a coisa mais importante.'
        },
        author: 'Martha Stewart'
      }, {
        msg: {
          en_us: 'Do or do not, there is no try.',
          pt_br: 'Faça ou não faça. Tentativas não existem.'
        },
        author: 'Yoda'
      }, {
        msg: {
          en_us: 'You don\'t need a company with 100 people to develop this idea.',
          pt_br: 'Você não precisa de uma equipe de 100 pessoas para desenvolver uma ideia.'
        },
        author: 'Larry Page'
      }, {
        msg: {
          en_us: 'Do not let what you cannot do interfere with what you can do.',
          pt_br: 'Não deixe o que você não pode fazer interferir no que você pode fazer.'
        },
        author: 'John Wooden'
      }, {
        msg: {
          en_us: 'Winners never quit and quitters never win.',
          pt_br: 'Vencedores nunca desistem e quem desiste nunca vence.'
        },
        author: 'Vince Lombardi'
      }]
      return quotes[Math.floor((Math.random() * (quotes.length - 1)))]
    }())

    el = $('#quote-of-day')
    el.find('[data-lang="en_us"]').text('"' + quote.msg.en_us + '"')
    el.find('[data-lang="pt_br"]').text('"' + quote.msg.pt_br + '"')
    el.find('cite').text(quote.author)

    // 'remember' username
    var username = localStorage.getItem('username')
    if (username) {
      $('#username').val(username)
    }

    // fix problem with label above the preset values
    $('#username, #password').change(function () {
      if ($(this).val() !== '') {
        $(this).parent().addClass('do-float')
      }
    }).trigger('change')

    // treat login form
    $('#login-form').submit(function () {
      if (!$(this).hasClass('ajax')) {
        // reset notification toast
        hideToastr()
        var username = $('#username').val()
        // get pass md5 hash
        var password = md5($('#password').val())

        if ($('#remember').is(':checked')) {
          // keep the username for next logins
          localStorage.setItem('username', username)
        } else {
          // remove local stored username, if exists
          localStorage.removeItem('username')
        }

        var form = $(this)
        // call ajax
        form.addClass('ajax')

        var authFail = function (jqXHR, textStatus, err) {
          if (jqXHR.status !== 403) {
            // unexpected status
            console.error(err)
          }

          apiError(jqXHR.responseJSON)
          form.removeClass('ajax')
        }

        $.ajax({
          url: 'https://api.e-com.plus/v1/_login.json?username',
          method: 'POST',
          dataType: 'json',
          contentType: 'application/json; charset=UTF-8',
          headers: {
            // random store ID
            'X-Store-ID': 1
          },
          data: JSON.stringify({
            'username': username,
            'pass_md5_hash': password
          })
        })

          .done(function (json) {
            console.log('Logged')
            // keep store ID
            var storeId = json.store_id
            localStorage.setItem('store_id', storeId)

            // authenticate
            $.ajax({
              url: 'https://api.e-com.plus/v1/_authenticate.json',
              method: 'POST',
              dataType: 'json',
              contentType: 'application/json; charset=UTF-8',
              headers: {
                'X-Store-ID': storeId
              },
              data: JSON.stringify({
                '_id': json._id,
                'api_key': json.api_key
              })
            })

              .done(function (json) {
                // authenticated
                // create a new E-Com Plus admin session
                $.ajax({
                  url: 'https://admin.e-com.plus/session/new',
                  method: 'PUT',
                  contentType: 'application/json; charset=UTF-8',
                  headers: {
                    'X-Store-ID': storeId,
                    'X-My-ID': json.my_id,
                    'X-Access-Token': json.access_token
                  },
                  xhrFields: {
                    withCredentials: true
                  }
                })

                  .always(function () {
                    var ssoUrl = window.location.search.split('sso_url=')[1]
                    if (ssoUrl && ssoUrl !== '') {
                      // redirect to external E-Com Plus service
                      window.location = 'https://admin.e-com.plus' + decodeURIComponent(ssoUrl)
                    } else {
                      // store authentication on browser session
                      // loss data when browser tab is closed
                      sessionStorage.setItem('my_id', json.my_id)
                      sessionStorage.setItem('access_token', json.access_token)
                      sessionStorage.setItem('expires', json.expires)
                      sessionStorage.setItem('username', username)

                      // redirect to dashboard
                      var goTo = sessionStorage.getItem('go_to')
                      if (goTo) {
                        sessionStorage.removeItem('go_to')
                      } else {
                        // redirect to index
                        goTo = '/'
                      }
                      window.location = goTo
                    }
                  })
              })
              .fail(authFail)
          })
          .fail(authFail)
      }
    })

    // submit login form on ENTER click
    $(document).keypress(function (e) {
      if (e.which === 13) {
        $('#login-form').submit()
      }
    })
  } else {
    // dashboard app
    var storeId = localStorage.getItem('store_id')
    session.my_id = session.access_token = null
    // try to start authentication session
    if (storeId > 0) {
      session.my_id = sessionStorage.getItem('my_id')
      session.access_token = sessionStorage.getItem('access_token')
    }

    if (!session.my_id || !session.access_token) {
      // redirect to login
      sessionStorage.setItem('go_to', window.location.href)
      window.location = '/pages/login.html'
      // force stop
      return
    }
    // start showing pace and headers while loading
    $('#dashboard').fadeIn()
    console.log('Hello #' + session.my_id + '\nStore #' + storeId)
    // hide for security
    sessionStorage.removeItem('my_id')
    sessionStorage.removeItem('access_token')

    // common APIs authentication headers
    var authHeaders = {
      'X-Store-ID': storeId,
      'X-My-ID': session.my_id,
      'X-Access-Token': session.access_token
    }
    // run API requests with intervals to prevent rate limit
    var apiQueue = []
    // control API requests queue
    var requestsRunning = false
    // confirm some requests with modal
    var confirmRequest = {}

    var runRequest = function () {
      if (apiQueue.length) {
        var req = apiQueue.shift()
        // up to 2 req/sec
        setTimeout(function () {
          // proceed to next request
          runRequest()
        }, 500)

        var options = req.options
        // always JSON
        options.dataType = 'json'
        if (options.data) {
          options.contentType = 'application/json; charset=UTF-8'
        }
        var callback = req.callback
        // call AJAX request
        var ajax = $.ajax(options)

        ajax.done(function (json) {
          // successful response
          if (typeof callback === 'function') {
            callback(null, json)
          } else {
            console.log(json)
          }
        })

        ajax.fail(function (jqXHR, textStatus, err) {
          var json = jqXHR.responseJSON
          // error response
          if (typeof callback === 'function') {
            callback(err, json)
          }
          if (req.skipError !== true) {
            apiError(json)
            if (jqXHR.status >= 500) {
              console.log('API request with internal error response:')
              console.log(jqXHR)
            }
          }
        })
      } else {
        // all done
        requestsRunning = false
      }
    }

    var addRequest = function (options, bodyObject, callback, skipError) {
      if (bodyObject) {
        options.data = JSON.stringify(bodyObject)
      }
      // console.log(options)
      // add request to queue
      apiQueue.push({
        'options': options,
        'callback': callback,
        'skipError': skipError
      })
      if (!requestsRunning) {
        // starts running the queue
        requestsRunning = true
        runRequest()
      }
    }

    var askConfirmation = function (uri, method, callback, bodyObject, msg) {
      // random unique request ID
      var id = Date.now()
      confirmRequest[id] = {
        'uri': uri,
        'method': method,
        'callback': callback,
        'bodyObject': bodyObject
      }
      // expose request
      var reqText = method + ' ' + uri
      if (bodyObject) {
        reqText += '\n' + JSON.stringify(bodyObject, null, 2)
      }

      // delay to prevent events crash
      setTimeout(function () {
        // open confirmation modal
        var modal = $('#modal-confirm-request')
        modal.find('#api-request-control').data('request-id', id)
        console.log('Confirm request', reqText)

        if (skipNextConfirms === null) {
          // wait user interaction
          modal.find('.modal-body > p').text(msg)
          // .next('pre').children('code').text(reqText)
          modal.modal('show')
        } else {
          // automatically cancel or confirm this request
          requestControl()
        }
      }, 400)
    }

    var callApi = function (endpoint, method, callback, bodyObject, skipError) {
      // reset notification toast
      hideToastr()
      // E-Com Plus Store API
      // https://ecomstore.docs.apiary.io/#
      var apiHost = 'https://api.e-com.plus/v1/'
      // API endpoint full URL
      var uri = apiHost + endpoint

      // request not confirmed
      switch (method) {
        case 'GET':
        case 'POST':
        case 'PATCH':
        case 'PUT':
          // continue
          break
        case 'DELETE':
          askConfirmation(uri, method, callback, bodyObject, i18n({
            'en_us': 'You are going to delete a resource permanently, are you sure?',
            'pt_br': 'Você vai excluir um recurso permanentemente, tem certeza?'
          }))
          return
        default:
          // invalid method
          app.toast(i18n({
            'en_us': 'Invalid request method',
            'pt_br': 'Método de requisição inválido'
          }))
          return
      }

      if (typeof endpoint === 'string' && endpoint !== '') {
        if (/^\$update\.json/.test(endpoint)) {
          // ensure confirmation
          skipNextConfirms = null
          askConfirmation(uri, method, callback, bodyObject, i18n({
            'en_us': 'You are going to do a bulk update, are you sure?',
            'pt_br': 'Você vai fazer uma atualização em massa, tem certeza?'
          }))
          return
        }
      } else {
        // invalid endpoint argument
        app.toast(i18n({
          'en_us': 'Invalid request endpoint',
          'pt_br': 'O endpoint da requisição é inválido'
        }))
        return
      }

      var options = {
        url: uri,
        headers: authHeaders,
        method: method
      }
      addRequest(options, bodyObject, callback, skipError)
    }

    var callMainApi = function (endpoint, method, callback, bodyObject) {
      // E-Com Plus Main API
      // https://ecomplus.docs.apiary.io/#
      var apiHost = 'https://e-com.plus/api/v1/'
      // API endpoint full URL
      var uri = apiHost + endpoint
      if (method === 'GET') {
        // specify store on URL query string
        uri += '?store_id=' + storeId
      }
      // console.log(uri)

      var options = {
        url: uri,
        method: method
      }
      addRequest(options, bodyObject, callback)
    }

    var storageApiPath = 'https://apx-storage.e-com.plus/' + storeId + '/api/v1/'
    var callStorageApi = function (s3Method, callback, bodyObject) {
      var uri = storageApiPath
      var method
      if (s3Method) {
        uri += 's3/' + s3Method + '.json'
        method = 'POST'
        // check if S3 method name starts with 'delete'
        if (/^delete/.test(s3Method)) {
          // require confirmation
          askConfirmation(uri, method, callback, bodyObject, i18n({
            'en_us': 'You are going to delete files permanently, are you sure?',
            'pt_br': 'Você vai excluir arquivos permanentemente, tem certeza?'
          }))
          return
        }
      } else {
        method = 'GET'
        /*
        {
          bucket,
          host: bucket + '.' + awsEndpoint
        }
        */
      }

      var options = {
        url: uri,
        headers: authHeaders,
        method: method
      }
      addRequest(options, bodyObject, callback)
    }

    var callSearchApi = function (endpoint, method, callback, bodyObject) {
      // E-Com Plus Search API
      // https://ecomsearch.docs.apiary.io/#
      var apiHost = 'https://apx-search.e-com.plus/api/v1/'
      // API endpoint full URL
      var uri = apiHost + endpoint

      var options = {
        url: uri,
        headers: {
          // authenticate store only
          // no authorization tokens
          'X-Store-ID': storeId
        },
        method: method
      }
      addRequest(options, bodyObject, callback)
    }

    // global
    window.callApi = callApi
    window.callStorageApi = callStorageApi
    window.callSearchApi = callSearchApi
    // use tabs functions and objects globally
    window.Tabs = {}

    // general function to load HTML content
    window.loadContent = function (uri, el) {
      // show loading spinner
      el.hide()
      var parent = el.closest('.ajax-content')
      parent.addClass('ajax')

      $.ajax({
        url: uri,
        dataType: 'html',
        // timeout in 6s
        timeout: 6000
      })
        .done(function (html) {
          // successful response
          // put HTML content
          el.html(html).fadeIn()
        })
        .fail(function (jqXHR, textStatus, err) {
          app.toast(i18n({
            'en_us': jqXHR.status + ' error, cannot load HTML content',
            'pt_br': 'Erro ' + jqXHR.status + ', não foi possível carregar o conteúdo HTML'
          }))
        })
        .always(function () {
          setTimeout(function () {
            parent.removeClass('ajax')
          }, 400)
        })
    }

    var skipNextConfirms = null
    var confirmationTimeout
    var requestControl = function (confirm) {
      // handle request confirmation or rejection
      var id = $('#api-request-control').data('request-id')
      if (id && confirmRequest.hasOwnProperty(id)) {
        var req = confirmRequest[id]

        // set timeout for in-stream requests
        var cb = req.callback
        req.callback = function (err, body) {
          if (skipNextConfirms !== null) {
            // reset
            confirmationTimeout = setTimeout(function () {
              skipNextConfirms = null
            }, 500)
          }
          if (typeof cb === 'function') {
            cb(err, body)
          }
        }
        // clear old timeout
        if (confirmationTimeout) {
          clearTimeout(confirmationTimeout)
          confirmationTimeout = null
        }

        if (confirm !== undefined) {
          if ($('#skip-next-confirms').is(':checked')) {
            // skip next requests confirmations
            skipNextConfirms = confirm
          } else {
            skipNextConfirms = null
          }
        } else {
          // get from last saved decision
          confirm = skipNextConfirms
        }

        if (!confirm) {
          // request rejected
          // callback with error
          setTimeout(function () {
            req.callback(new Error('Request rejected'), null)
          }, 200)
        } else {
          // confirmed
          // call API after confirmation
          var options = {
            url: req.uri,
            headers: authHeaders,
            method: req.method
          }
          addRequest(options, req.bodyObject, req.callback)
          delete confirmRequest[id]
        }
      }
    }

    $('#confirm-api-request').click(function () {
      requestControl(true)
    })
    $('#discard-api-request').click(function () {
      requestControl(false)
    })

    $(window).on('beforeunload', function (e) {
      // show promp before page redirect
      var dialogText = 'Are you sure you want to leave?'
      e.returnValue = dialogText
      return dialogText
    })

    // preset update sidebar function
    var updateSidebar = function () {
      // mark active menu link
      var $sidebar = $('#sidebar')
      var $links = $sidebar.find('.menu-link').filter(function () {
        // filter routes links only
        // no submenu
        return $(this).attr('href').slice(0, 3) === '/#/'
      })

      var updateActive = function ($item, method) {
        $item[method]('active')
        // update parent submenu link (if any)
        $item.parent('.menu-submenu').parent()[method]('active')
      }
      // unmark last active menu item
      updateActive($links.parent('.active'), 'removeClass')

      // find current active
      var found
      $links.each(function () {
        if ($(this).attr('href') === '/' + window.location.hash) {
          updateActive($(this).parent(), 'addClass')
          // break
          found = true
          return false
        }
      })
      if (!found && window.routeParams.length) {
        // try to match by route param
        var $li = $sidebar.find('li[data-route-param="' + window.routeParams[0] + '"]')
        if ($li.length) {
          updateActive($li, 'addClass')
        }
      }
    }

    // SPA
    // work with multiple tabs
    // each tab with a route
    var appTabs = {}
    var currentTab = null
    // control routing queue
    var routeInProgress = false
    var ignoreRoute = false
    var waitingRoute, routeReadyTimeout

    var newTab = function (callback, toHashNew) {
      if (routeInProgress !== true) {
        // random unique tab ID
        var id = Date.now()
        currentTab = id
        appTabs[currentTab] = {
          'tabTitle': null,
          'routesHistory': [],
          'saveAction': false,
          'actionTitle': null
        }
        // add tab to route content element
        $('#route-content').append('<div id="app-tab-' + id + '"></div>')

        // update tabs nav HTML
        var navItem = $('#new-nav-item').clone().attr('id', 'app-nav-' + id)
        navItem.prependTo('#app-nav-tabs').toggle('slide')
        navItem.children('a').attr('data-tab', id).click(changeTab).click()
        navItem.children('.close-tab').click(function () {
          closeTab(id)
        })

        if (toHashNew) {
          // new tab route
          if (window.location.hash === '#/new') {
            // force routing
            hashChange()
          } else {
            window.location = '/#/new'
          }
        }
      }
      if (typeof callback === 'function') {
        // usual to start routing
        callback()
      }
    }

    var changeTab = function () {
      if (routeInProgress !== true) {
        currentTab = parseInt($(this).attr('data-tab'), 10)
        var showTab = function () {
          // hide content, then show tab
          var elTab = $('#app-tab-' + currentTab)
          var elContent = elTab.children()
          elContent.hide()
          elTab.addClass('app-current-tab')
          // now route content appears
          elContent.fadeIn(100)
          // update browser tab title
          changeBrowserTabTitle(appTabs[currentTab].tabTitle)

          var hash = appTabs[currentTab].hash
          if (hash !== undefined) {
            if (hash === '') {
              // index
              hash = '#/'
            }
            if (hash !== window.location.hash) {
              // fix URL hash without routing again
              ignoreRoute = true
              window.location = '/' + hash
            }
          }
        }

        // remove classes from the previous tab
        var previousTab = $('#route-content > .app-current-tab')
        if (previousTab.length) {
          $('#app-nav-tabs .active').removeClass('active')
          previousTab.children().fadeOut(200, function () {
            previousTab.removeClass('app-current-tab')
            showTab()
          })
        } else {
          // first tab
          showTab()
        }

        // active this tab nav item
        $(this).addClass('active')
      }
    }

    $('#new-tab').click(function () {
      // toHashNew = true
      newTab(null, true)
    })

    var closeTab = function (tabId) {
      if (routeInProgress !== true) {
        var tabObj = appTabs[tabId]
        if (tabObj) {
          if (tabObj.unsavedChanges === true) {
            // have unsaved changes
            // focus on this tab
            $('#app-nav-' + tabId + ' > a').click()
            waitingRoute = null
            setTimeout(function () {
              $('#modal-unsaved').modal('show')
            }, 100)
            // do not close, wait for confirmation
            return
          }

          // remove from tabs object
          delete appTabs[tabId]
          // free up memory
          // console.log(window.Tabs[tabId])
          delete window.Tabs[tabId]

          if (tabId === currentTab) {
            // have to change the current tab
            var tabs = Object.keys(appTabs)
            if (tabs.length === 0) {
              // create new tab
              // toHashNew = true
              newTab(null, true)
            } else {
              // change tab
              // click on any nav item link
              $('#app-nav-' + tabs[tabs.length - 1] + ' > a').click()
            }
          }

          // remove from HTML dom
          $('#app-tab-' + tabId).remove()
          $('#app-nav-' + tabId).toggle('slide', function () {
            $(this).remove()
          })
        }
      }
    }

    $('#close-current-tab').click(function () {
      closeTab(currentTab)
    })

    var router = function (route, internal) {
      if (!internal) {
        if (routeInProgress === true) {
          // routing in progress
          return
        }
        // console.log('Go to route => ' + route)
        if (currentTab !== null) {
          // add route to history
          appTabs[currentTab].routesHistory.push(route)
        }
      }
      routeInProgress = true

      // reset route parameters
      window.routeParams = []
      var paths = route.split('/')
      // final route HTML file URI
      // only the first path
      var uri = 'routes/' + paths[0] + '.html'
      for (var i = 1; i < paths.length; i++) {
        // URI param
        if (paths[i] !== '') {
          window.routeParams.push(paths[i])
        }
      }

      $('#router > .loading').show()
      // load HTML content
      $.ajax({
        url: uri,
        dataType: 'html',
        // timeout in 10s
        timeout: 10000
      })
        .done(function (html) {
          // successful response
          var elTab = $('#app-tab-' + currentTab)
          // global to identify tab on route scripts
          window.tabId = currentTab
          window.elTab = elTab

          // store data when necessary
          // commit changes on tab data globally
          // get tab JSON data globally
          // improve reactivity
          window.Tabs[currentTab] = {
            /*
            data: {},
            commit: function () {},
            load: function () {},
            pagination: function () {},
            */
            state: window.Tabs[currentTab] ? window.Tabs[currentTab].state : {}
          }

          if (!internal) {
            // have to force routeReady call after 10s
            routeReadyTimeout = setTimeout(function () {
              router('408', true)
            }, 10000)
          }
          // put HTML content
          elTab.html(html)
        })
        .fail(function (jqXHR, textStatus, err) {
          if (jqXHR.status === 404) {
            // not found
            // internal rewrite
            window.e404()
          } else {
            // do internal route to error page
            var eNum
            switch (textStatus) {
              case 'abort':
                eNum = '400'
                break
              case 'timeout':
                eNum = '504'
                break
              default:
                // unexpected status
                console.error(err)
                eNum = '500'
            }
            router(eNum, true)
          }
        })
    }

    var contentPagination = function (prev) {
      // handle pagination inside current tab content if any
      var pagination = window.Tabs[currentTab].pagination
      if (typeof pagination === 'function') {
        pagination(prev)
      }
    }

    // general function to render DOM elements IDs based on current tab ID
    window.renderContentIds = function (el) {
      // current tab ID
      var tabId = window.tabId
      // jQuery element object
      if (!el) {
        el = window.elTab
      }
      // prefix tab ID on content elements IDs
      var prefixId = 't' + tabId + '-'
      el.find('[data-id]').each(function () {
        $(this).attr('id', prefixId + $(this).data('id'))
      })
      el.find('[data-id-href]').each(function () {
        $(this).attr('href', '#' + prefixId + $(this).data('id-href'))
      })
    }

    // global function to run after Route rendering
    window.routeReady = function (tabTitle) {
      // ajax routing done
      routeInProgress = false
      // drop timeout trigger
      clearTimeout(routeReadyTimeout)
      routeReadyTimeout = null

      // display content
      if (tabTitle !== undefined) {
        // change tab nav title
        $('#app-nav-' + window.tabId + ' > a').text(tabTitle)
      }
      $('#router > .loading').fadeOut()
      window.elTab.children().fadeIn()
      // save title for further tab changes
      appTabs[currentTab].tabTitle = tabTitle
      changeBrowserTabTitle(tabTitle)
    }

    var changeBrowserTabTitle = function (title) {
      if (!title) {
        // default
        title = 'Dashboard'
      }
      // update document title
      document.title = title + ' · E-Com Plus'
    }

    // global 404 error function
    window.e404 = function () {
      router('404', true)
    }

    var checkTabsRoutes = function (hash) {
      if (hash !== '#/new') {
        // check if a tab have this route
        for (var tabId in appTabs) {
          if (appTabs.hasOwnProperty(tabId) && appTabs[tabId].hash === hash) {
            // do not permit multiple tabs with same route
            // change to this tab
            $('#app-nav-' + tabId + ' > a').click()
            updateTopbar()
            return false
          }
        }
      }
      return true
    }

    var hashChange = function () {
      var hash = window.location.hash
      // eg.: #/any
      // cut prefix #/
      var route = hash.slice(2)
      // handle URL rewrites
      if (route === '') {
        // default index
        // go home
        window.location = '/#/home'
        return
      }

      // work with current tab object
      var tabObj = appTabs[currentTab]
      // route
      if (!ignoreRoute) {
        // check if a tab already have this route
        if (!checkTabsRoutes(hash)) {
          return
        }

        if (routeInProgress === true && keepRoute()) {
          // routing currenty in progress
          return
        } else if (tabObj.unsavedChanges === true && keepRoute()) {
          // have unsaved changes
          $('#modal-unsaved').modal('show')
          // do not route, wait for confirmation
          waitingRoute = route
          return
        }

        router(route)
        // unset save action
        if (tabObj && tabObj.saveAction) {
          // leaving form page
          tabObj.saveAction = false
          // discard save function and action title
          tabObj.saveCallback = tabObj.actionTitle = null
        }
      } else {
        // next will not be ignored
        ignoreRoute = false
      }

      if (tabObj) {
        // update current tab hash
        tabObj.hash = hash
        updateTopbar()
      }
    }
    $(window).on('hashchange', hashChange)

    var keepRoute = function () {
      if (currentTab !== null) {
        var routesHistory = appTabs[currentTab].routesHistory
        if (routesHistory.length > 0) {
          // still on current route
          ignoreRoute = true
          window.location = '/#/' + routesHistory[routesHistory.length - 1]
          return true
        }
      }
      return false
    }

    $('.previous-route').click(function () {
      var path = '/#/'
      if (currentTab !== null) {
        var routesHistory = appTabs[currentTab].routesHistory
        if (routesHistory.length - 2 >= 0) {
          // fix routes history pointer
          routesHistory.pop()
          var route = routesHistory.pop()
          // go to last visited route
          path += route
        }
      }
      window.location = path
    })

    $('#ignore-unsaved').click(function () {
      var tabObj = appTabs[currentTab]
      if (tabObj) {
        // discard unsaved changes
        tabObj.unsavedChanges = false
        if (waitingRoute) {
          // go to previous requested route
          window.location = '/#/' + waitingRoute
        } else {
          // close tab
          closeTab(currentTab)
        }
      }
    })

    // form pages
    // main save action
    var saveAction = function () {
      var tabObj = appTabs[currentTab]
      if (tabObj) {
        var save = function () {
          // mark saved
          tabObj.unsavedChanges = false
          /* nothing more to save, disable button
          $('#action-save').attr('disabled', true)
          */

          if (tabObj && typeof tabObj.saveCallback === 'function') {
            // call tab save action callback function
            tabObj.saveCallback(function (tabId) {
              if (tabId === currentTab) {
                // confirm action done
                var $todo = $('#action-todo')
                var $done = $('#action-done')
                $todo.fadeOut(200, function () {
                  $done.fadeIn(400, function () {
                    setTimeout(function () {
                      $done.fadeOut(200, function () {
                        $todo.fadeIn()
                      })
                    }, 800)
                  })
                })
              }
            })
          }
        }

        if (tabObj.unsavedChanges) {
          save()
        } else {
          // wait delay
          setTimeout(function () {
            if (tabObj.unsavedChanges) {
              save()
            } else {
              // message only
              app.toast(i18n({
                'en_us': 'Nothing to save',
                'pt_br': 'Não há alteração a ser salva'
              }))
            }
          }, 300)
        }
      }
    }
    $('#action-save').click(saveAction)

    // current action topbar status
    var watchingSave = false

    var watchSave = function () {
      var tabObj = appTabs[currentTab]
      if (tabObj) {
        if (tabObj.actionTitle === null) {
          // first time watching this tab
          var clearTopbarTitle = true
          if (window.elTab) {
            var elTitle = window.elTab.find('input.action-title')
            if (elTitle.length) {
              // write title on topbar
              var updateTopbarTitle = function (title) {
                tabObj.actionTitle = title
                $('#action-title').text(title)
              }
              elTitle.change(function () {
                updateTopbarTitle($(this).val())
              })
              // reset topbar title with current input val
              updateTopbarTitle(elTitle.val())
              clearTopbarTitle = false
            }
          }
          if (clearTopbarTitle === true) {
            // clear title on action topbar
            $('#action-title').text('')
          }
        } else {
          // just show current tab action title
          $('#action-title').text(tabObj.actionTitle)
        }

        /* disable save button while there are nothing to save
        if (tabObj.unsavedChanges === false) {
          $('#action-save').attr('disabled', true)
        } else {
          $('#action-save').removeAttr('disabled')
        }
        */
      }

      // show action (save) topbar
      $('#topbar-action').fadeIn()
      watchingSave = true
    }

    var unwatchSave = function () {
      // hide action (save) topbar
      $('#topbar-action').fadeOut()
      watchingSave = false
    }

    var updateTopbar = function () {
      var tabObj = appTabs[currentTab]
      if (tabObj) {
        // update current topbar state
        if (tabObj.saveAction) {
          watchSave()
        } else if (watchingSave) {
          unwatchSave()
        }
        // update menu active item
        updateSidebar()
      }
    }

    window.setSaveAction = function (elForm, callback) {
      var tabObj = appTabs[currentTab]
      if (tabObj) {
        if (elForm) {
          // start with nothing to save
          tabObj.unsavedChanges = false
          try {
            // watch form submit
            elForm.submit(saveAction)
          } catch (err) {
            // not a valid form element ?
            console.error(err)
          }
        }

        tabObj.saveAction = true
        tabObj.saveCallback = callback
        watchSave()
      }
    }

    window.unsetSaveAction = function () {
      var tabObj = appTabs[currentTab]
      if (tabObj) {
        // no save action
        tabObj.saveAction = false
        // discard action callback
        tabObj.saveCallback = null
        // update topbar
        unwatchSave()
      }
    }

    window.triggerUnsaved = function (tabId) {
      var tabObj = appTabs[tabId]
      if (tabObj) {
        // new unsaved changes
        if (tabObj.unsavedChanges !== true) {
          tabObj.unsavedChanges = true
          /* enable save button again
          $('#action-save').removeAttr('disabled')
          */
        }
      }
    }

    window.apiResources = {
      'products': {
        'label': {
          'en_us': 'Products',
          'pt_br': 'Produtos'
        },
        'icon': 'tag'
      },
      'orders': {
        'label': {
          'en_us': 'Orders',
          'pt_br': 'Pedidos'
        },
        'icon': 'inbox'
      },
      'brands': {
        'label': {
          'en_us': 'Brands',
          'pt_br': 'Marcas'
        },
        'icon': 'trademark'
      },
      'categories': {
        'label': {
          'en_us': 'Categories',
          'pt_br': 'Categorias'
        },
        'icon': 'bookmark'
      },
      'collections': {
        'label': {
          'en_us': 'Collections',
          'pt_br': 'Coleções'
        },
        'icon': 'th-large'
      },
      'grids': {
        'label': {
          'en_us': 'Grids',
          'pt_br': 'Grades'
        },
        'icon': 'filter'
      },
      'customers': {
        'label': {
          'en_us': 'Customers',
          'pt_br': 'Clientes'
        },
        'icon': 'users'
      },
      'carts': {
        'label': {
          'en_us': 'Carts',
          'pt_br': 'Carrinhos'
        },
        'icon': 'shopping-cart'
      },
      'authentications': {
        'label': {
          'en_us': 'Users',
          'pt_br': 'Usuários'
        },
        'icon': 'id-card'
      }
    }

    var renderMenu = function () {
      var mainResourceLink = function (slug, resources) {
        var resource
        // submenu with resource list
        var submenu = ''
        if (resources) {
          // list of slugs
          for (var i = 0; i < resources.length; i++) {
            var Slug = resources[i]
            resource = window.apiResources[Slug]
            submenu += '<li class="menu-item" data-route-param="' + Slug + '">' +
                         '<a class="menu-link" href="/#/resources/' + Slug + '">' +
                           '<span class="icon fa fa-' + resource.icon + '"></span>' +
                           '<span class="title">' + i18n(resource.label) + '</span>' +
                         '</a>' +
                       '</li>'
          }
        }

        // main resource
        resource = window.apiResources[slug]
        var label = i18n(resource.label)
        // parse first letter to lower
        var labelLower = label.toLowerCase()

        // render resource sidebar menu link and submenu
        return '<li class="menu-item" id="' + slug + '-menu" data-route-param="' + slug + '">' +
                 '<a class="menu-link" href="javascript:;">' +
                   '<span class="icon fa fa-' + resource.icon + '"></span>' +
                   '<span class="title">' + label + '</span>' +
                   '<span class="arrow"></span>' +
                 '</a>' +
                 '<ul class="menu-submenu">' +
                   '<li class="menu-item">' +
                     '<a class="menu-link" href="/#/resources/' + slug + '">' +
                       '<span class="icon fa fa-th-list"></span>' +
                       '<span class="title">' +
                         dictionary.all_the + ' ' + labelLower +
                       '</span>' +
                     '</a>' +
                   '</li>' +
                   '<li class="menu-item">' +
                     '<a class="menu-link" href="/#/resources/' + slug + '/new">' +
                       '<span class="icon fa fa-plus"></span>' +
                       '<span class="title">' +
                         dictionary.create + ' ' + labelLower.slice(0, -1) +
                       '</span>' +
                     '</a>' +
                   '</li>' +
                   submenu +
                 '</ul>' +
               '</li>'
      }

      var el = '<li class="menu-item">' +
                 '<a class="menu-link" href="/#/home">' +
                   '<span class="icon fa fa-home"></span>' +
                   '<span class="title">' + dictionary.home + '</span>' +
                 '</a>' +
               '</li>' +

               // resources links
               mainResourceLink('orders', [
                 'customers',
                 'carts'
               ]) +
               mainResourceLink('products', [
                 'brands',
                 'categories',
                 'collections',
                 'grids'
               ]) +

               '<li class="menu-item">' +
                 '<a class="menu-link" href="/#/apps">' +
                   '<span class="icon fa fa-puzzle-piece"></span>' +
                   '<span class="title">Apps</span>' +
                 '</a>' +
               '</li>' +
               '<li class="menu-item">' +
                 '<a class="menu-link" href="javascript:;" onclick="initStorageLib()" ' +
                 'data-toggle="quickview" data-target="#qv-storage">' +
                   '<span class="icon fa fa-picture-o"></span>' +
                   '<span class="title">' + dictionary.media + '</span>' +
                 '</a>' +
               '</li>' +
               '<li class="menu-item">' +
                 '<a class="menu-link" href="/#/settings">' +
                   '<span class="icon fa fa-cogs"></span>' +
                   '<span class="title">' + dictionary.settings + '</span>' +
                 '</a>' +
               '</li>' +

               // channels will be rendered after
               '<li class="menu-category" onclick="newChannel()">' +
                 dictionary.channels + '<i class="fa fa-plus-circle"></i>' +
               '</li>'

      var $menu = $('#sidebar')
      $menu.append(el)
      // add badge with number of orders
      var $badge = $('<span />', {
        'class': 'badge badge-primary'
      })
      $menu.find('#orders-menu > a > .title').after($badge)

      var countOrders = function () {
        // get current number of orders
        var callback = function (err, body) {
          if (!err) {
            $badge.text(body.count)
          }
        }
        var data = {
          resource: 'orders'
        }
        callApi('$count.json', 'POST', callback, data)
      }
      setTimeout(function () {
        countOrders()
        // reload number of orders periodically
        setInterval(countOrders, 60 * 1000 * 10)
      }, 600)

      if ($('.sidebar-toggler').is(':visible')) {
        // mobile
        // unfold sidebar by default
        sidebar.unfold()
      }
    }
    renderMenu()

    // store sales channels
    var channels = []
    var renderChannels = function () {
      var menu = $('#sidebar')
      // reset
      menu.find('.li-channel').remove()

      for (var i = 0; i < channels.length; i++) {
        var channel = channels[i]
        var url = '/#/channels/' + channel.id
        var link
        if (channel.domains.length) {
          // use last channel domain
          link = 'https://' + channel.domains[channel.domains.length - 1]
        } else {
          // @TODO
          // other channel type ?
          link = '#'
        }

        // sales channels on menu
        var $el = $('<li />', {
          'class': 'menu-item li-channel',
          html: '<a class="menu-link" href="javascript:;">' +
                  '<span class="icon fa fa-shopping-bag"></span>' +
                  '<span class="title">' + channel.title + '</span>' +
                  '<span class="arrow"></span>' +
                '</a>' +
                '<ul class="menu-submenu">' +
                  '<li class="menu-item">' +
                    '<a class="menu-link" href="' + link + '" target="_blank">' +
                      '<span class="icon fa fa-eye"></span>' +
                      '<span class="title">' + dictionary.go_to_store + '</span>' +
                    '</a>' +
                  '</li>' +
                  '<li class="menu-item">' +
                    '<a class="menu-link" href="' + url + '/themes">' +
                      '<span class="icon fa fa-paint-brush"></span>' +
                      '<span class="title">' + dictionary.themes + '</span>' +
                    '</a>' +
                  '</li>' +
                  '<li class="menu-item">' +
                    '<a class="menu-link" href="' + url + '/settings">' +
                      '<span class="icon fa fa-wrench"></span>' +
                      '<span class="title">' + dictionary.settings + '</span>' +
                    '</a>' +
                  '</li>' +
                '</ul>'
        })
        menu.append($el)
        // show channels with animation
        $el.slideDown('slow')
      }
    }
    // renderChannels()

    window.newChannel = function () {
      // handle new channel price and open modal
      // only first channel is free
      if (channels.length) {
        var price = Store.$main.additional_channels_cost
        if (price === undefined) {
          return
        } else {
          var $div = $('#channel-price')
          $div.children('strong').text(window.formatMoney(price))
          $div.show()
        }
      }
      $('#modal-channel').modal('show')
    }

    callStorageApi(null, function (err, json) {
      if (!err) {
        // use store bucket endpoint
        if (json.host) {
          var domain = 'https://' + json.host + '/'

          // global to return images selection
          var imagesCallback = null
          window.setImagesCallback = function (cb) {
            imagesCallback = cb
            // reset selected images array
            selectedImages = []
          }
          var selectedImages = []
          var selectImagesCallback = function (err) {
            if (typeof imagesCallback === 'function') {
              // return selected images
              imagesCallback(err, selectedImages)
              // callback just once, unset
              imagesCallback = null
            }
          }
          $('#uploads-done').click(function () {
            selectImagesCallback()
          })

          // image is resized after upload
          var imageSizes = {
            zoom: {
              // original size
              // no path, domain root
              path: ''
            },
            small: {
              size: 100,
              path: 'imgs/100px/'
            },
            normal: {
              size: 400,
              path: 'imgs/400px/'
            },
            big: {
              size: 700,
              path: 'imgs/700px/'
            }
          }

          var deleteImages = function (keys) {
            // delete bucket object
            // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property
            var s3Method = 'deleteObjects'

            // mount array of objects with Key property
            var objects = []
            for (var i = 0; i < keys.length; i++) {
              // delete all image sizes
              // ref.: https://github.com/ecomclub/storage-api/blob/master/bin/web.js
              var baseKey = keys[i].replace(/^.*(@.*)$/, '$1')
              for (var thumb in imageSizes) {
                if (imageSizes.hasOwnProperty(thumb)) {
                  objects.push({ Key: imageSizes[thumb].path + baseKey })
                }
              }
            }
            var bodyObject = {
              Delete: {
                Objects: objects,
                Quiet: true
              }
            }

            var $ajax = $('#storage-content').closest('.ajax-content')
            $ajax.addClass('ajax')
            var callback = function (err, json) {
              if (!err) {
                // reload
                loadStorageContent()
              }
              $ajax.removeClass('ajax')
            }
            callStorageApi(s3Method, callback, bodyObject)
          }

          var activeImages = function () {
            // mount array with keys of selected images
            var keys = []
            $('#storage-content a.active').each(function () {
              var key = $(this).data('key')
              if (key) {
                keys.push(key)
              }
            })
            return keys
          }
          var unactivateImages = function () {
            // unset selected images
            $('#storage-content a.active').removeClass('active')
          }

          $('#storage-select').click(function () {
            var keys = activeImages()
            if (keys.length) {
              for (var i = 0; i < keys.length; i++) {
                // all image sizes
                // ref.: https://github.com/ecomclub/storage-api/blob/master/bin/web.js
                var baseKey = keys[i].replace(/^.*(@.*)$/, '$1')
                // picture object
                // based on product resource picture property
                // https://ecomstore.docs.apiary.io/#reference/products/product-object
                var picture = {}
                for (var thumb in imageSizes) {
                  if (imageSizes.hasOwnProperty(thumb)) {
                    picture[thumb] = { url: domain + imageSizes[thumb].path + baseKey }
                  }
                }
                selectedImages.push(picture)
              }
              unactivateImages()
            }
            selectImagesCallback()
          })

          $('#storage-delete').click(function () {
            var keys = activeImages()
            if (keys.length) {
              deleteImages(keys)
              unactivateImages()
            } else {
              app.toast(i18n({
                'en_us': 'No image selected to delete',
                'pt_br': 'Nenhuma imagem selecionada para deletar'
              }))
            }
          })

          // images pagination control
          var isTruncated, lastKey
          $('#load-storage').click(function () {
            loadStorageContent(lastKey)
          })

          var loadStorageContent = function (nextMarker) {
            // reset DOM element
            var $el = $('#storage-content')
            var $ajax = $el.closest('.ajax-content')
            if (!nextMarker) {
              $el.html('')
            }
            $ajax.addClass('ajax')
            var $btn = $('#load-storage')
            $btn.attr('disabled', true)

            // get bucket objects from Storage API
            // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
            var s3Method = 'listObjects'
            var bodyObject = {
              // show thumbnails only
              Prefix: imageSizes.normal.path,
              MaxKeys: 15
            }
            if (nextMarker) {
              bodyObject.Marker = nextMarker
            }

            var callback = function (err, json) {
              if (!err) {
                var list = json.Contents
                if (Array.isArray(list)) {
                  // HTML content listing files
                  // Mansory grid
                  var content = ''
                  var todo = list.length
                  var done = 0
                  var Done = function () {
                    done++
                    if (done >= todo) {
                      // ready
                      isTruncated = json.IsTruncated
                      if (isTruncated) {
                        // there are more images to load
                        $btn.removeAttr('disabled')
                        if (json.NextMarker) {
                          lastKey = json.NextMarker
                        }
                      }
                      $ajax.removeClass('ajax')
                      $el.append(content).find('.storage-object').fadeIn()
                    }
                  }

                  if (todo > 0) {
                    for (var i = 0; i < todo; i++) {
                      (function () {
                        var key = list[i].Key
                        // load image first
                        var newImg = new Image()
                        newImg.onload = function () {
                          content += '<div class="masonry-item storage-object">' +
                                       '<a href="javascript:;" onclick="$(this).toggleClass(\'active\')" ' +
                                       'data-key="' + key + '">' +
                                         '<img src="' + this.src + '">' +
                                       '</a>' +
                                     '</div>'
                          Done()
                        }
                        newImg.src = domain + key
                      }())
                    }
                  } else {
                    // no content
                    Done()
                  }
                }
              }
            }

            callStorageApi(s3Method, callback, bodyObject)
          }

          // handle dropzone with Storage API
          // http://www.dropzonejs.com/#configuration
          /* global Dropzone */
          var dropzone = new Dropzone('#dropzone', {
            url: storageApiPath + 'upload.json',
            headers: authHeaders
          })

          dropzone.on('complete', function (file) {
            // console.log(file)
            // API request done
            try {
              var json = JSON.parse(file.xhr.responseText)
            } catch (e) {
              // unexpected response
              apiError()
              console.error(new Error('Upload filed'), file)
              return
            }
            if (file.status !== 'success') {
              apiError(json)
            }

            if (typeof imagesCallback === 'function') {
              // check if uploaded file is an image by mime type
              if (file.type.substr(0, 6) === 'image/' && json.key && file.status === 'success') {
                // picture object
                // based on product resource picture property
                // https://ecomstore.docs.apiary.io/#reference/products/product-object
                var picture = {}
                var thumb
                for (thumb in imageSizes) {
                  if (imageSizes.hasOwnProperty(thumb)) {
                    picture[thumb] = { url: domain + imageSizes[thumb].path + json.key }
                  }
                }

                if (file.height && file.width) {
                  // save image sizes
                  var w = file.width
                  var h = file.height
                  // original sizes
                  picture.zoom.size = w + 'x' + h
                  // calculate thumbnails sizes
                  for (thumb in imageSizes) {
                    if (imageSizes.hasOwnProperty(thumb)) {
                      var px = imageSizes[thumb].size
                      if (px) {
                        // resize base
                        picture[thumb].size = w > h
                          ? px + 'x' + Math.round(h * px / w)
                          : Math.round(w * px / h) + 'x' + px
                      }
                    }
                  }
                }
                if (file.name) {
                  // use filename as default image alt
                  // remove file extension
                  var alt = file.name.replace(/\.[^.]+$/, '')
                  for (thumb in picture) {
                    if (picture.hasOwnProperty(thumb)) {
                      picture[thumb].alt = alt
                    }
                  }
                }

                selectedImages.push(picture)
                // console.log(selectedImages)
              }

              /* wait for further uploads
              if (dropzone.getQueuedFiles().length === 0 && dropzone.getUploadingFiles().length === 0) {
                // all uploads done
                selectImagesCallback()
              }
              */
            }
          })

          window.upload = function () {
            // clear dropzone and open modal
            dropzone.removeAllFiles()
            // reset
            // selectedImages = []
            $('#modal-uploads').modal('show')
          }

          var editImageCallback = null
          window.editImage = function (callback, picture) {
            editImageCallback = callback
            // configure image options
            var $modal = $('#modal-edit-image')
            if (picture) {
              $modal.find('input').each(function () {
                var value = picture[$(this).attr('name')]
                if (value) {
                  $(this).val(value)
                } else {
                  // clear
                  $(this).val('')
                }
              })
            } else {
              // clear all inputs
              $modal.find('input').val('')
            }
            // open modal and show form
            $modal.modal('show')
          }

          $('#edit-image').click(function () {
            if (typeof editImageCallback === 'function') {
              // return JSON of edit images form
              var data = {}
              $('#modal-edit-image input').each(function () {
                var val = $(this).val().trim()
                if (val !== '') {
                  data[$(this).attr('name')] = val
                }
              })
              editImageCallback(null, data)
            }
          })

          $('#remove-image').click(function () {
            if (typeof editImageCallback === 'function') {
              // return false to remove selected image
              editImageCallback(null, false)
            }
          })

          // init images library
          window.initStorageLib = function () {
            if (lastKey === undefined) {
              loadStorageContent()
            }
          }
        } else {
          console.log('Unexpected Storage API response:', json)
        }
      } else {
        // hash, try to debug
        console.error(err)
      }
    })

    // store and user JSON body
    var Store, User

    // get store object
    callApi('stores/me.json', 'GET', function (err, body) {
      if (err) {
        fatalError(err)
      } else {
        Store = body
        // console.log(Store)
        // get authentication object
        callApi('authentications/me.json', 'GET', function (err, body) {
          if (err) {
            fatalError(err)
          } else {
            User = body
            var notifications = User.notifications
            console.log(notifications)
            for (var i = 0; i < notifications.length; i++) {
              if (notifications[i].datetime) {
                var dayNotifications = parseInt(notifications[i].datetime.substring(8, 10))
                var monthNotifications = parseInt(notifications[i].datetime.substring(5, 7))
                var yearNotifications = parseInt(notifications[i].datetime.substring(0, 4))
                var hourNotifications = parseInt(notifications[i].datetime.substring(11, 13))
                console.log(hourNotifications)
                var todayNotifications = new Date()
                var ddNotifications = todayNotifications.getDate()
                var mmNotifications = (todayNotifications.getMonth() + 1)
                var yyyyNotifications = todayNotifications.getFullYear()
                var timeZoneCalc = todayNotifications.getTimezoneOffset()
                if (todayNotifications.getHours() < 24 && todayNotifications.getHours() > 3) {
                  var hrNotifications = todayNotifications.getHours() - timeZoneCalc / 60
                } else {
                  hrNotifications = todayNotifications.getHours()
                }
                var idNfcs = notifications[i]._id
                console.log(idNfcs)
                var acao, action, urlNotification, resourcesNfcsBr, resourcesNfcsUs, htmlNotification, bgIconNfcs, iconNfcs, daysNfcBr, daysNfcUs, id, diffDays
                var allResources = function () {
                  htmlNotification = '<a class="media" href="/#/' + urlNotification + '/' + id + ' ">' +
                      '  <span class="avatar ' + bgIconNfcs + '"><i class="' + iconNfcs + '"></i></span>' +
                      '  <div class="media-body">' +
                      '<p class="i18n">' +
                      '  <span data-lang="pt_br">' + resourcesNfcsBr + ' ' + acao + '</span>' +
                      '  <span data-lang="en_us">' + resourcesNfcsUs + ' ' + action + '/span>' +
                      '</p>' +
                      '<p class="i18n">' +
                      ' <time data-lang="pt_br">' + diffDays + ' ' + daysNfcBr + ' atrás</time>' +
                      ' <time data-lang="en_us">' + diffDays + ' ' + daysNfcUs + ' ago</time>' +
                      '</p>' +
                      '</div></a>'
                }
                var authentication = function () {
                  urlNotification = 'authentications'
                  resourcesNfcsBr = 'Autenticação'
                  resourcesNfcsUs = 'Authentication'
                  iconNfcs = 'icon fa fa-key'
                  allResources(urlNotification, resourcesNfcsBr, resourcesNotifications, id, action, acao, diffDays, iconNfcs, bgIconNfcs)
                  $('.notification').append(htmlNotification)
                }
                var products = function () {
                  urlNotification = 'resources/products'
                  resourcesNfcsBr = 'Produto'
                  resourcesNfcsUs = 'Product'
                  iconNfcs = 'icon fa fa-tag'
                  allResources(urlNotification, resourcesNfcsBr, resourcesNotifications, id, action, acao, diffDays, iconNfcs, bgIconNfcs)
                  $('.notification').append(htmlNotification)
                }
                var orders = function () {
                  urlNotification = 'resources/orders'
                  resourcesNfcsBr = 'Pedido'
                  resourcesNfcsUs = 'Order'
                  iconNfcs = 'icon fa fa-inbox'
                  allResources(urlNotification, resourcesNfcsBr, resourcesNotifications, id, action, acao, diffDays, iconNfcs, bgIconNfcs)
                  $('.notification').append(htmlNotification)
                }
                var categories = function () {
                  urlNotification = 'resources/categories'
                  resourcesNfcsBr = 'Categoria'
                  resourcesNfcsUs = 'Category'
                  iconNfcs = 'icon fa fa-bookmark'
                  allResources(urlNotification, resourcesNfcsBr, resourcesNotifications, id, action, acao, diffDays, iconNfcs, bgIconNfcs)
                  $('.notification').append(htmlNotification)
                }
                var brands = function () {
                  urlNotification = 'resources/brands'
                  resourcesNfcsBr = 'Marca'
                  resourcesNfcsUs = 'Brand'
                  iconNfcs = 'icon fa fa-trademark'
                  allResources(urlNotification, resourcesNfcsBr, resourcesNotifications, id, action, acao, diffDays, iconNfcs, bgIconNfcs)
                  $('.notification').append(htmlNotification)
                }
                var collections = function () {
                  urlNotification = 'resources/collections'
                  resourcesNfcsBr = 'Coleção'
                  resourcesNfcsUs = 'Collection'
                  iconNfcs = 'icon fa fa-th-large'
                  allResources(urlNotification, resourcesNfcsBr, resourcesNotifications, id, action, acao, diffDays, iconNfcs, bgIconNfcs)
                  $('.notification').append(htmlNotification)
                }
                var applications = function () {
                  urlNotification = 'applications'
                  resourcesNfcsBr = 'App'
                  resourcesNfcsUs = 'App'
                  iconNfcs = 'icon fa fa-database'
                  allResources(urlNotification, resourcesNfcsBr, resourcesNotifications, id, action, acao, diffDays, iconNfcs, bgIconNfcs)
                  $('.notification').append(htmlNotification)
                }
                var grids = function () {
                  urlNotification = 'resources/grids'
                  resourcesNfcsBr = 'Grade'
                  resourcesNfcsUs = 'Grid'
                  iconNfcs = 'icon fa fa-filter'
                  allResources(urlNotification, resourcesNfcsBr, resourcesNotifications, id, action, acao, diffDays, iconNfcs, bgIconNfcs)
                  $('.notification').append(htmlNotification)
                }
                var resourcesNotifications = function () {
                  if (notifications[i].content.api_event.resource === 'authentications') {
                    authentication(id, diffDays)
                  }
                  if (notifications[i].content.api_event.resource === 'products') {
                    products(id, diffDays)
                  }
                  if (notifications[i].content.api_event.resource === 'orders') {
                    orders(id, diffDays)
                  }
                  if (notifications[i].content.api_event.resource === 'categories') {
                    categories(id, diffDays)
                  }
                  if (notifications[i].content.api_event.resource === 'brands') {
                    brands(id, diffDays)
                  }
                  if (notifications[i].content.api_event.resource === 'collections') {
                    collections(id, diffDays)
                  }
                  if (notifications[i].content.api_event.resource === 'applications') {
                    applications(id, diffDays)
                  }
                  if (notifications[i].content.api_event.resource === 'grids') {
                    grids(id, diffDays)
                  }
                }
                if (yyyyNotifications === yearNotifications) {
                  if (mmNotifications === monthNotifications) {
                    if (ddNotifications === dayNotifications) {
                      id = notifications[i].content.api_event.resource_id
                      diffDays = hrNotifications - hourNotifications
                      if (notifications[i].content.api_event.action === 'change') {
                        acao = 'alterado'
                        action = 'changed'
                        bgIconNfcs = 'bg-warning'
                        daysNfcBr = 'horas'
                        daysNfcUs = 'hours'
                        resourcesNotifications(id, diffDays, acao, action, bgIconNfcs, daysNfcUs, daysNfcBr)
                      }
                      if (notifications[i].content.api_event.action === 'delete') {
                        acao = 'deletado'
                        action = 'deleted'
                        bgIconNfcs = 'bg-danger'
                        daysNfcBr = 'horas'
                        daysNfcUs = 'hours'
                        resourcesNotifications(id, diffDays, acao, action, bgIconNfcs, daysNfcUs, daysNfcBr)
                      }
                      if (notifications[i].content.api_event.action === 'create') {
                        acao = 'criado'
                        action = 'created'
                        bgIconNfcs = 'bg-success'
                        daysNfcBr = 'horas'
                        daysNfcUs = 'hours'
                        resourcesNotifications(id, diffDays, acao, action, bgIconNfcs, daysNfcUs, daysNfcBr)
                      }
                    }
                    if (ddNotifications > dayNotifications) {
                      id = notifications[i].content.api_event.resource_id
                      diffDays = ddNotifications - dayNotifications
                      if (diffDays < 0) {
                        diffDays = 'Momentos'
                      }

                      if (notifications[i].content.api_event.action === 'change') {
                        acao = 'alterado'
                        action = 'changed'
                        bgIconNfcs = 'bg-warning'
                        daysNfcBr = 'dias'
                        daysNfcUs = 'days'
                        resourcesNotifications(id, diffDays, acao, action, bgIconNfcs, daysNfcUs, daysNfcBr)
                      }
                      if (notifications[i].content.api_event.action === 'delete') {
                        acao = 'deletado'
                        action = 'deleted'
                        bgIconNfcs = 'bg-danger'
                        daysNfcBr = 'dias'
                        daysNfcUs = 'days'
                        resourcesNotifications(id, diffDays, acao, action, bgIconNfcs, daysNfcUs, daysNfcBr)
                      }
                      if (notifications[i].content.api_event.action === 'create') {
                        acao = 'criado'
                        action = 'created'
                        bgIconNfcs = 'bg-success'
                        daysNfcBr = 'dias'
                        daysNfcUs = 'days'
                        resourcesNotifications(id, diffDays, acao, action, bgIconNfcs, daysNfcUs, daysNfcBr)
                      }
                    }
                  }
                }
              }
            }
            // ready to start dashboard
            Start()
            getStoreChannels()
          }
        })
      }
    })

    // get store channels and domains from Main API
    var getStoreChannels = function () {
      callMainApi('channels.json', 'GET', function (err, body) {
        if (!err) {
          channels = body.result
          if (channels.length) {
            for (var i = 0; i < channels.length; i++) {
              // setup channel domains array
              channels[i].domains = []
            }

            // get store domains and associate with channels
            callMainApi('domains.json', 'GET', function (err, body) {
              if (!err) {
                var domains = body.result
                // add each domain to respective channel
                for (var i = 0; i < domains.length; i++) {
                  var domain = domains[i].id
                  for (var ii = 0; ii < channels.length; ii++) {
                    if (domains[i].channel_id === channels[ii].id) {
                      channels[ii].domains.push(domain)
                    }
                  }

                  // check domain name
                  if (!window.shopDomain) {
                    if (domain.indexOf('.e-com.plus') === -1 || i === domains.length - 1) {
                      // save as main domain globally
                      window.shopDomain = domain
                    }
                  }
                }

                // render channels on sidebar menu
                renderChannels()
              }
            })
          }
        }
      })
    }

    var Start = function () {
      // create first tab
      newTab(function () {
        // force routing
        hashChange()
      })

      // global quickview
      $('.qv-close').click(function () {
        quickview.close($(this).closest('.quickview'))
      })

      // logout buttons
      $('.logout').click(function () {
        // open confirmation modal
        $('#modal-logout').modal('show')
      })

      $('#logout').click(function () {
        // skip confirmation promp
        $(window).off('beforeunload')
        // just redirect to lose session and logout
        window.location = '/'
      })

      $('#new-channel').click(function () {
        // create new sales channel
        var body = {}
        $('#modal-channel').find('input,select').each(function () {
          var prop = $(this).attr('name')
          var val = $(this).val()
          if (prop && val) {
            // add property to request body
            body[prop] = val
          }
        })

        var callback = function (err) {
          if (!err) {
            // reload store channels
            getStoreChannels()
            // reset form
            $('#modal-channel input').val('')
          }
        }

        callApi('@channels.json', 'POST', callback, body)
      })

      // open new tab on target blank click
      var targetBlank = false

      var handleTargetBlank = function (hash) {
        // check if a tab already have this route
        if (!checkTabsRoutes(hash)) {
          return
        }

        newTab(function () {
          if (window.location.hash === hash) {
            // force routing
            hashChange()
          } else {
            window.location = '/' + hash
          }
        })
      }

      $(document).mousedown(function (e) {
        if (e.ctrlKey || e.which === 2) {
          targetBlank = true
        }
        // to allow the browser to know that we handled it
        return true
      })

      $(document).click(function (e) {
        // handle new tab routes
        if (targetBlank === true) {
          // prevent loop
          targetBlank = false

          // click with target blank
          // if is changing route, prevent default event and open new tab
          var t, el
          t = e.target
          while (t && el === undefined) {
            switch (t.nodeName) {
              case 'A':
                el = t
                break
              case 'DIV':
              case 'P':
              case 'BUTTON':
              case 'BODY':
                // stop searching link
                t = false
                break
              default:
                // try next parent element
                t = t.parentElement
            }
          }
          if (el === undefined || typeof el.href !== 'string') {
            // not a valid link
            // we handled it
            return true
          }

          switch (el.href) {
            case 'javascript:;':
            case '#':
              // no link URL
              e.preventDefault()
              return true
          }
          var uriParts = el.href.split(window.location.origin + '/#')
          if (uriParts.length === 2) {
            e.preventDefault()
            var hash = '#' + uriParts[1]
            if (hash !== '#') {
              // same of javascript:;
              handleTargetBlank(hash)
            }
          }
        }
      })

      // handle search input
      var $search = $('#app-search')
      $search.attr('placeholder', i18n({
        'en_us': 'Search',
        'pt_br': 'Pesquisar'
      }))

      /* default app shortcuts */

      // save keys pressed simultaneously
      var keysPressed = {}
      var keysLoop = {}

      var runShortcut = function (e) {
        // Ref.: https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
        // count current pressed keys
        switch (Object.keys(keysPressed).length) {
          case 1:
            // check single key shortcuts
            switch (e.keyCode) {
              case 37:
                // left
                // change tab
                $('#app-nav-' + currentTab).prev().children('a').click()
                break
              case 39:
                // right
                // change tab
                var li = $('#app-nav-' + currentTab).next()
                if (li.attr('id') !== 'new-nav-item') {
                  li.children('a').click()
                }
                break
              case 84:
                // t
                // shortcut to #new-tab click
                newTab(null, true)
                break
              case 87:
                // w
                // shortcut to #close-current-tab click
                closeTab(currentTab)
                break
              case 83:
                // s
                // focus on topbar search input
                // prevent write on input
                e.preventDefault()
                $search.focus()
                break
              case 81:
                // q
                // open or close global quickview
                $('.topbar img.avatar').click()
                break
              case 77:
                // m
                // open or close Mony
                dock.toggleMinimize('#dock-chat')
                $('#mony-publish input').focus()
                break
              case 74:
                // j
                // go to previous route pagination
                contentPagination(true)
                break
              case 75:
                // k
                // go to next route pagination
                contentPagination()
                break
            }
            break

            /* multiple keys shortcuts */

          case 2:
            // second key
            var resourceKey = function () {
              switch (e.keyCode) {
                case 80:
                  // p
                  // go to products
                  return '/#/resources/products'
                case 79:
                  // o
                  // go to orders
                  return '/#/resources/orders'
                case 73:
                  // i
                  // go to categories
                  return '/#/resources/categories'
                case 85:
                  // u
                  // go to customers
                  return '/#/resources/customers'
                case 89:
                  // y
                  // go to brands
                  return '/#/resources/brands'
                case 84:
                  // t
                  // go to carts
                  return '/#/resources/carts'
                case 82:
                  // r
                  // go to grids
                  return '/#/resources/grids'
                case 69:
                  // e
                  // go to collections
                  return '/#/resources/collections'
                case 87:
                  // w
                  // go to authentications
                  return '/#/resources/authentications'
              }
            }

            // try navigation shortcuts
            var uri
            if (keysPressed[71] === 0) {
              // g
              // go to
              switch (e.keyCode) {
                case 72:
                  // h
                  // go to home
                  window.location = '/#/home'
                  break
                case 83:
                  // s
                  // go to settings
                  window.location = '/#/settings'
                  break
                case 65:
                  // a
                  // go to apps
                  window.location = '/#/apps'
                  break
                default:
                  uri = resourceKey()
                  if (uri) {
                    window.location = uri
                  }
              }
            } else if (keysPressed[65] === 0) {
              // a
              // add
              uri = resourceKey()
              if (uri) {
                window.location = uri + '/new'
              }
            }
            break

          case 3:
            // third key
            if (keysPressed[66] === 0 && keysPressed[89] === 1 && keysPressed[69] === 2) {
              // bye
              // force logout
              $('#logout').click()
            }
            break
        }
      }

      var checkKeyTarget = function (e) {
        // check keyboard event target to handle shortcuts
        switch (e.target.nodeName) {
          case 'BODY':
          case 'A':
          case 'BUTTON':
            return true
          default:
            return false
        }
      }

      $(document).keydown(function (e) {
        // console.log(e.target.nodeName)
        if (!checkKeyTarget(e)) {
          if (e.keyCode === 27) {
            // esc
            // focus on document
            $(e.target).blur()
            return
          } else {
            // focus is not on body
            return true
          }
        }

        if (keysLoop[e.keyCode] !== true) {
          if (keysPressed[e.keyCode] !== undefined) {
            runShortcut(e)
            keysLoop[e.keyCode] = true
          } else {
            // store key
            keysPressed[e.keyCode] = Object.keys(keysPressed).length
          }
        } else {
          return true
        }
      }).keyup(function (e) {
        if (!checkKeyTarget(e)) {
          // focus is not on body
          return true
        }

        if (keysLoop[e.keyCode] !== true) {
          if (keysPressed[e.keyCode] !== undefined) {
            runShortcut(e)
          }
        } else {
          delete keysLoop[e.keyCode]
        }
        // remove this key
        delete keysPressed[e.keyCode]
      })

      // setup Mony chatbot
      // see util.js
      window.startMony(Store, User, session)
    }
    // see util.js
    window.appReady()
  }
})
