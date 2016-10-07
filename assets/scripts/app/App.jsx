import React from 'react'
import { IntlProvider } from 'react-intl'
import { app } from '../preinit/app_settings'
import { getLocale } from './locale'
import MenusContainer from '../menus/MenusContainer'
import StreetNameCanvas from '../streets/StreetNameCanvas'
import WelcomePanel from './WelcomePanel'
import Palette from './Palette'
import DialogRoot from '../dialogs/DialogRoot'
import StatusMessage from './StatusMessage'
import NoConnectionMessage from './NoConnectionMessage'
import Flash from './Flash'
import DebugInfo from './DebugInfo'
import Gallery from '../gallery/Gallery'
import BlockingError from './BlockingError'
import MiscHTMLStuff from './MiscHTMLStuff'
import PrintContainer from './PrintContainer'
import { API_URL } from './config'

// Flattens a nested object from translation response, e.g.
// { key1: { key2: "string" }} => { "key1.key2": "string" }
// This is because react-intl expects to look up translations this way.
// ES6-ported function from https://gist.github.com/penguinboy/762197
// This is quite simple; it does not address arrays or null values, since
// the responses from the server will not be containing those.
function flattenObject (obj) {
  const toReturn = {}
  let flatObject
  Object.keys(obj).forEach(i => {
    if (typeof obj[i] === 'object') {
      flatObject = flattenObject(obj[i])
      Object.keys(flatObject).forEach(x => {
        toReturn[i + '.' + x] = flatObject[x]
      })
    } else {
      toReturn[i] = obj[i]
    }
  })
  return toReturn
}

export default class App extends React.Component {
  constructor (props) {
    super(props)

    // Use state to update IntlProvider
    this.state = {
      // Converts "es_MX" to "en-MX" (and similar) for react-intl
      locale: getLocale().replace('_', '-'),
      translations: null
    }

    this.getTranslations = this.getTranslations.bind(this)
  }

  componentWillMount () {
    this.getTranslations()

    window.addEventListener('stmx:language_changed', this.getTranslations)
  }

  getTranslations () {
    const locale = getLocale()

    window.fetch(`${API_URL}v1/translate/${locale}/main`)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
      })
      .then(translations => {
        this.setState({
          locale: locale.replace('_', '-'),
          translations: flattenObject(translations)
        })
      })
  }

  render () {
    const { locale, translations } = this.state

    return (
      <IntlProvider locale={locale} key={locale} messages={translations}>
        <div>
          <BlockingError />
          <Gallery />
          <div className="main-screen">
            <MenusContainer />
            <StreetNameCanvas />
            <WelcomePanel />
            <Palette />
            <DialogRoot />
            <MiscHTMLStuff />
            <StatusMessage />
            <NoConnectionMessage />
          </div>

          <Flash />
          <DebugInfo />
          <PrintContainer />
        </div>
      </IntlProvider>
    )
  }
}
