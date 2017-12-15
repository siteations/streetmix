import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import RemoveButton from './RemoveButton'
import WidthControl from './WidthControl'
import { infoBubble } from './info_bubble'
import { resumeFadeoutControls } from '../segments/resizing'
import { getStreet } from '../streets/data_model'
// import { msg } from '../app/messages'
// import { trackEvent } from '../app/event_tracking'
import { BUILDING_VARIANTS, BUILDING_VARIANT_NAMES } from '../segments/buildings'
import { SEGMENT_INFO } from '../segments/info'

const INFO_BUBBLE_TYPE_SEGMENT = 1
const INFO_BUBBLE_TYPE_LEFT_BUILDING = 2
const INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3

class InfoBubble extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    dataNo: PropTypes.number
  }

  static defaultProps = {
    visible: false
  }

  constructor (props) {
    super(props)

    this.state = {
      type: null,
      street: null
    }
  }

  componentDidMount () {
    // This listener hides the info bubble when the mouse leaves the
    // document area. Do not normalize it to a pointerleave event
    // because it doesn't make sense for other pointer types
    document.addEventListener('mouseleave', infoBubble.hide)

    // Listen for external triggers to update contents here
    window.addEventListener('stmx:force_infobubble_update', (e) => {
      this.updateInfoBubbleState()
    })
  }

  onTouchStart (event) {
    resumeFadeoutControls()
  }
  
  // TODO: verify this continues to work with pointer / touch taps
  onMouseEnter = (event) => {
    if (infoBubble.segmentEl) {
      infoBubble.segmentEl.classList.add('hide-drag-handles-when-inside-info-bubble')
    }

    infoBubble.mouseInside = true

    infoBubble.updateHoverPolygon()
  }

  onMouseLeave = (event) => {
    // TODO: Prevent pointer taps from flashing the drag handles
    if (infoBubble.segmentEl) {
      infoBubble.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble')
    }

    infoBubble.mouseInside = false
  }

  updateInfoBubbleState = () => {
    this.setState({
      type: infoBubble.type,
      street: getStreet()
    })
  }

  getName = () => {
    const street = this.state.street
    let name

    switch (this.state.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        const segment = street.segments[this.props.dataNo]
        if (segment) {
          const segmentInfo = SEGMENT_INFO[segment.type]
          const variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]
          name = variantInfo.name || segmentInfo.name
        }
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.leftBuildingVariant)]
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.rightBuildingVariant)]
        break
      default:
        break
    }

    return name
  }

  render () {
    const type = this.state.type
    const canBeDeleted = (type === INFO_BUBBLE_TYPE_SEGMENT)
    const showWidth = (type === INFO_BUBBLE_TYPE_SEGMENT)
    const segment = infoBubble.segmentEl
    const className = 'info-bubble' + ((this.props.visible) ? ' visible' : '')

    return (
      <div
        className={className}
        data-type={(type === INFO_BUBBLE_TYPE_SEGMENT) ? 'segment' : 'building'}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onTouchStart={this.onTouchStart}
      >
        <div className="info-bubble-triangle" />
        <header>
          {this.getName()}
          <RemoveButton enabled={canBeDeleted} segment={segment} />
        </header>
        <WidthControl enabled={showWidth} segment={segment} />
        <div id="info-bubble-transition-element" />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    visible: state.infoBubble.visible,
    dataNo: state.infoBubble.dataNo
  }
}

export default connect(mapStateToProps)(InfoBubble)
