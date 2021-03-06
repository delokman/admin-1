import session from './lib/session'
import ecomUtils from '@ecomplus/utils'
import '@ecomplus/storefront-twbs/src/'
import './lib/forms/selectpicker'

const { sessionStorage, app } = window

app.ready(() => {
  if (!session.my_id || !session.access_token) {
    sessionStorage.setItem('go_to', window.location.href)
    import('@/login/').catch(console.error)
  } else {
    import('@/dashboard').catch(console.error)
  }
})

window.ecomUtils = ecomUtils
