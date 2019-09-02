import React, { ComponentProps, CSSProperties, PureComponent } from 'react'
import { checkParent } from './check-parent'

export interface ResizeReporterProps extends ComponentProps<'div'> {
  /** Report the init rendered size. Default false.  */
  reportInit?: boolean
  /** Debounce time in millisecond. Default no debounce. */
  debounce?: number
  /** Fires when width or height changes. */
  onSizeChanged?: (width: number, height: number) => void
  /** Fires only when width changes. */
  onWidthChanged?: (width: number) => void
  /** Fires only when height changes. */
  onHeightChanged?: (height: number) => void
}

const scrollerStyles: CSSProperties = {
  overflow: 'hidden',
  position: 'absolute',
  zIndex: -1000,
  top: 0,
  right: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  pointerEvents: 'none'
}

const expandDetectorStyles: CSSProperties = {
  transition: '0s',
  animation: 'none'
}

const shrinkDetectorStyles: CSSProperties = {
  transition: '0s',
  animation: 'none',
  width: '250%',
  height: '250%'
}

/**
 * Scroll event based resize detector
 */
export class ResizeReporter extends PureComponent<ResizeReporterProps> {
  containerRef = React.createRef<HTMLDivElement>()
  lastWidth = -1
  lastHeight = -1
  _debounceTicket: number | null | undefined
  _setScrollPositionTicket: number | null | undefined

  resetPosition = (
    container: HTMLDivElement,
    newWidth: number,
    newHeight: number
  ) => {
    const $expand = container.firstChild as HTMLDivElement
    const $shrink = $expand.nextSibling as HTMLDivElement

    // ensure expand detector can scroll
    // shrink detector uses percentage so it will always be able to scroll
    const $expandDetector = $expand.firstChild as HTMLDivElement
    $expandDetector.style.width = newWidth + 1000 + 'px'
    $expandDetector.style.height = newHeight + 1000 + 'px'

    // after styles are applied
    this._setScrollPositionTicket = window.setTimeout(() => {
      $expand.scrollLeft = newWidth + 1000
      $expand.scrollTop = newHeight + 1000

      $shrink.scrollLeft = newWidth * 2.5
      $shrink.scrollTop = newHeight * 2.5
    }, 0)
  }

  checkSize = () => {
    if (this.containerRef.current) {
      const parent = this.containerRef.current.parentElement
      if (parent) {
        const newWidth = parent.offsetWidth || 0
        const newHeight = parent.offsetHeight || 0

        if (this.props.onSizeChanged) {
          if (newWidth !== this.lastWidth || newHeight !== this.lastHeight) {
            this.props.onSizeChanged(newWidth, newHeight)
          }
        }

        if (this.props.onWidthChanged && newWidth !== this.lastWidth) {
          this.props.onWidthChanged(newWidth)
        }

        if (this.props.onHeightChanged && newHeight !== this.lastHeight) {
          this.props.onHeightChanged(newHeight)
        }

        this.resetPosition(this.containerRef.current, newWidth, newHeight)
        this.lastWidth = newWidth
        this.lastHeight = newHeight
      }
    }
  }

  onScroll = () => {
    if (this._debounceTicket) {
      window.clearTimeout(this._debounceTicket)
      this._debounceTicket = null
    }
    // height and width scrolling happens on next loop
    // add timeout even for 0
    this._debounceTicket = window.setTimeout(
      this.checkSize,
      this.props.debounce || 0
    )
  }

  componentDidMount() {
    if (this.containerRef.current) {
      const parent = this.containerRef.current.parentElement
      if (process.env.NODE_ENV !== 'production') {
        checkParent(parent)
      }

      if (parent) {
        if (this.props.reportInit) {
          this.checkSize()
        } else {
          this.lastWidth = parent.offsetWidth || 0
          this.lastHeight = parent.offsetHeight || 0
          this.resetPosition(
            this.containerRef.current,
            this.lastWidth,
            this.lastHeight
          )
        }
      }
    }
  }

  componentWillUnmount() {
    if (this._debounceTicket) {
      window.clearTimeout(this._debounceTicket)
      this._debounceTicket = null
    }
    if (this._setScrollPositionTicket) {
      window.clearTimeout(this._setScrollPositionTicket)
      this._setScrollPositionTicket = null
    }
  }

  render() {
    const {
      reportInit,
      debounce,
      onSizeChanged,
      onWidthChanged,
      onHeightChanged,
      children,
      ...restProps
    } = this.props

    return (
      <div
        aria-hidden={true}
        aria-label="react-resize-reporter"
        tabIndex={-1}
        {...restProps}
        ref={this.containerRef}
      >
        <div style={scrollerStyles} onScroll={this.onScroll}>
          <div style={expandDetectorStyles}></div>
        </div>
        <div style={scrollerStyles} onScroll={this.onScroll}>
          <div style={shrinkDetectorStyles}></div>
        </div>
        {children}
      </div>
    )
  }
}

export default ResizeReporter
