/**
 * locale.js
 * handles internationalization (i18n)
 *
 */
import i18next from 'i18next'
import i18nextXhr from 'i18next-xhr-backend'
import { supplant } from '../util/helpers'
import { addLocaleData } from 'react-intl'

// Add react-intl files for all the languages we support (added manually for now)
import es from 'react-intl/locale-data/es'
import de from 'react-intl/locale-data/de'
import fi from 'react-intl/locale-data/fi'
import pl from 'react-intl/locale-data/pl'
import pt from 'react-intl/locale-data/pt'
import zh from 'react-intl/locale-data/zh'

import { API_URL } from './config'
import { debug } from '../preinit/debug_settings'

// Add react-intl locale data
addLocaleData([...es, ...de, ...fi, ...pl, ...pt, ...zh])

// Default language is set by browser, or is English if undetermined
const defaultLocale = navigator.language || 'en'

export function initLocale (experimental) {
  // Current language is the one set by Streetmix or is the browser default, if unset
  let locale
  if (experimental) {
    locale = getLocale()
  } else {
    locale = 'en'
  }
}

export function onNewLocaleSelected (event) {
  setLocale(event.target.value)
}

export function getLocale () {
  if (debug.experimental) {
    // Currently experimental-only
    return window.localStorage.getItem('locale') || defaultLocale
  } else {
    return 'en'
  }
}

export function setLocale (locale) {
  window.localStorage.setItem('locale', locale)
  doTheI18n(locale)
}

export function clearLocale () {
  window.localStorage.removeItem('locale')
// TODO: clear language cache here if it's activated
}

function doTheI18n (locale) {
  const options = {
    lng: locale,
    ns: ['main', 'segment-info'],
    defaultNS: 'main',
    fallbackLng: 'en',
    load: 'all',
    backend: {
      loadPath: API_URL + 'v1/translate/{{lng}}/{{ns}}'
    },
    // Do not escape characters automatically. React already escapes strings,
    // so we want to avoid double-escaping output.
    interpolation: { escapeValue: false }
  }

  const callback = function (err, t) {
    if (err) {
      console.log(err)
    }
    const els = document.querySelectorAll('[data-i18n]')
    for (let i = 0, j = els.length; i < j; i++) {
      const key = els[i].getAttribute('data-i18n')
      let translation = ''
      for (let ns of options.ns) {
        translation = translation || t(key, {ns: options.ns[ns]})
      }
      els[i].textContent = translation
    }

    // Some parts of the UI need to know language has changed
    window.dispatchEvent(new window.CustomEvent('stmx:language_changed'))
  }

  i18next
    .use(i18nextXhr)
    .init(options, callback)
}

export function t (key, fallback, options) {
  const text = i18next.t(key, options)
  if (!text || text === key) {
    // Must manually supplant fallback strings if replacements are necessary
    if (options) {
      return supplant(fallback, options)
    } else {
      // Otherwise return as-is
      return fallback
    }
  } else {
    return text
  }
}
