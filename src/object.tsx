import React, { ComponentProps, CSSProperties, PureComponent } from 'react'
import { checkParent } from './check-parent'

export interface ResizeReporterProps extends ComponentProps<'object'> {
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

const containerStyles: CSSProperties = {
  overflow: 'hidden',
  position: 'absolute',
  zIndex: -1000,
  top: '0',
  right: '0',
  width: '100%',
  height: '100%',
  opacity: 0,
  pointerEvents: 'none'
}

/**
 * HTML <object> version of the resize reporter
 */
export class ResizeReporter extends PureComponent<ResizeReporterProps> {
  $container: HTMLObjectElement | null | undefined
  lastWidth = -1
  lastHeight = -1
  _debounceTicket: number | null | undefined

  onLoad = (e: React.SyntheticEvent<HTMLObjectElement, Event>) => {
    if (process.env.NODE_ENV !== 'production') {
      checkParent(e.currentTarget.parentElement)
    }

    // clean up if there is a previous element
    this.cleanUp()

    this.$container = e.currentTarget

    const win =
      e.currentTarget.contentDocument &&
      e.currentTarget.contentDocument.defaultView

    if (win) {
      win.addEventListener('resize', this.onResize)
    }

    if (this.props.reportInit) {
      this.checkSize()
    } else {
      this.lastWidth = e.currentTarget.offsetWidth || 0
      this.lastHeight = e.currentTarget.offsetHeight || 0
    }
  }

  checkSize = () => {
    if (this.$container) {
      const newWidth = this.$container.offsetWidth || 0
      const newHeight = this.$container.offsetHeight || 0

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

      this.lastWidth = newWidth
      this.lastHeight = newHeight
    }
  }

  onResize = () => {
    if (this._debounceTicket) {
      window.clearTimeout(this._debounceTicket)
      this._debounceTicket = null
    }

    if (this.props.debounce) {
      this._debounceTicket = window.setTimeout(
        this.checkSize,
        this.props.debounce
      )
    } else {
      this.checkSize()
    }
  }

  cleanUp = () => {
    if (this._debounceTicket) {
      window.clearTimeout(this._debounceTicket)
      this._debounceTicket = null
    }

    const win =
      this.$container &&
      this.$container.contentDocument &&
      this.$container.contentDocument.defaultView

    if (win) {
      win.removeEventListener('resize', this.onResize)
    }
  }

  componentWillUnmount() {
    this.cleanUp()
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
      <object
        aria-hidden={true}
        aria-label="react-resize-reporter"
        tabIndex={-1}
        {...restProps}
        style={containerStyles}
        onLoad={this.onLoad}
        type="text/html"
        data="about:blank"
      />
    )
  }
}

export default ResizeReporter
