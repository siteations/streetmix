import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import { createPalette } from '../segments/palette'
import { undo, redo, isUndoAvailable, isRedoAvailable } from '../streets/undo_stack'

class Palette extends React.PureComponent {
  static propTypes = {
    undoPosition: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.state = {
      undo: false,
      redo: false
    }
  }

  componentDidMount () {
    // We have to run this after this event in order to give images time to load.
    window.addEventListener('stmx:everything_loaded', (event) => {
      createPalette()
      this.adjustPaletteLayout()
      window.addEventListener('stmx:language_changed', this.adjustPaletteLayout)
    })
  }

  componentWillReceiveProps (nextProps) {
    // Update undo or redo buttons if the undo position has changed.
    if (this.props.undoPosition !== nextProps.undoPosition) {
      this.setState({
        undo: isUndoAvailable(),
        redo: isRedoAvailable()
      })
    }
  }

  setScrollableRef = (ref) => {
    this.paletteEl = ref
  }

  adjustPaletteLayout = () => {
    const commandsWidth = this.commandsEl.getBoundingClientRect().width

    // Only do work if palette commands has increased in width
    // TODO: don't hardcode magic number
    const delta = commandsWidth - 105 // 105 is approx what default width is

    // Reset palette right position
    this.paletteEl.style.right = ''

    if (delta > 0) {
      const paletteRightPos = window.parseInt(window.getComputedStyle(this.paletteEl).right, 10)
      const newPaletteRightPos = paletteRightPos + delta
      this.paletteEl.style.right = newPaletteRightPos + 'px'
    }

    // Check button visibility state by calling this method on the Scrollable
    // component directly.
    this.scrollable.checkButtonVisibilityState()
  }

  render () {
    return (
      <div className="palette-container">
        <div className="palette-trashcan" data-i18n="palette.remove">
          Drag here to remove
        </div>
        <div className="palette-commands" ref={(ref) => { this.commandsEl = ref }}>
          <button id="undo" data-i18n="btn.undo" onClick={undo} disabled={!this.state.undo}>Undo</button>
          <button id="redo" data-i18n="btn.redo" onClick={redo} disabled={!this.state.redo}>Redo</button>
        </div>
        <Scrollable className="palette" setRef={this.setScrollableRef} ref={(ref) => { this.scrollable = ref }}>
          <div className="palette-canvas" />
        </Scrollable>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    undoPosition: state.undo.position
  }
}

export default connect(mapStateToProps)(Palette)
