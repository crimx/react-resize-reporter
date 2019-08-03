import React, { ComponentProps, CSSProperties, PureComponent } from 'react'

export interface ResizeReporterProps extends ComponentProps<'div'> {
  /** @deprecated no longer needed */
  maxWidth?: number
  /** @deprecated no longer needed */
  maxHeight?: number
  /** Report the init rendered size */
  reportInit?: boolean
  debounce?: number
  onSizeChanged?: (width: number, height: number) => void
  onWidthChanged?: (width: number) => void
  onHeightChanged?: (height: number) => void
}

const scrollerStyles: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: -10000,
  overflow: 'hidden',
  visibility: 'hidden'
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

export class ResizeReporter extends PureComponent<ResizeReporterProps> {
  containerRef = React.createRef<HTMLDivElement>()
  lastWidth = 0
  lastHeight = 0
  _debounceStamp: ReturnType<typeof setTimeout> | undefined

  resetPosition = (
    container: HTMLDivElement,
    newWidth: number,
    newHeight: number
  ) => {
    const $expand = container.firstChild as HTMLDivElement
    const $shrink = $expand.nextSibling as HTMLDivElement

    // ensure expand detector can scroll
    // shrink detector use percentage so it will alwayss be able to scroll
    const $expandDetector = $expand.firstChild as HTMLDivElement
    $expandDetector.style.width = newWidth + 1000 + 'px'
    $expandDetector.style.height = newHeight + 1000 + 'px'

    $expand.scrollLeft = $shrink.scrollLeft = newWidth + 1000
    $expand.scrollTop = $shrink.scrollTop = newHeight + 1000
  }

  checkSize = () => {
    if (this.containerRef.current) {
      const parent = this.containerRef.current.parentElement
      if (parent) {
        const newWidth = parent.offsetWidth || 1
        const newHeight = parent.offsetHeight || 1

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
    if (this.props.debounce) {
      this._debounceStamp && clearTimeout(this._debounceStamp)
      this._debounceStamp = setTimeout(this.checkSize, this.props.debounce)
    } else {
      this.checkSize()
    }
  }

  componentDidMount() {
    if (this.containerRef.current) {
      const parent = this.containerRef.current.parentElement
      if (parent) {
        if (process.env.NODE_ENV !== 'production') {
          switch (parent.tagName) {
            case 'area':
            case 'base':
            case 'br':
            case 'col':
            case 'embed':
            case 'hr':
            case 'img':
            case 'input':
            case 'keygen':
            case 'link':
            case 'menuitem':
            case 'meta':
            case 'param':
            case 'source':
            case 'track':
            case 'wbr':
            case 'script':
            case 'style':
            case 'textarea':
            case 'title':
              console.error(
                'react-resize-reporter: ' +
                  `Unsupported parent tag name ${parent.tagName}. ` +
                  'Change the tag or wrap it in a supported tag(e.g. div).'
              )
          }

          const parentStyles = window.getComputedStyle(parent)
          if (
            parentStyles &&
            parentStyles.getPropertyValue('position') === 'static'
          ) {
            console.warn(
              'react-resize-reporter: ' +
                `The 'position' CSS property of element ${parent.tagName} should not be 'static'.`
            )
          }
        }

        const newWidth = parent.offsetWidth || 1
        const newHeight = parent.offsetHeight || 1

        if (this.props.reportInit) {
          if (this.props.onSizeChanged) {
            this.props.onSizeChanged(newWidth, newHeight)
          }

          if (this.props.onWidthChanged) {
            this.props.onWidthChanged(newWidth)
          }

          if (this.props.onHeightChanged) {
            this.props.onHeightChanged(newHeight)
          }
        }

        this.resetPosition(this.containerRef.current, newWidth, newHeight)
        this.lastWidth = newWidth
        this.lastHeight = newHeight
      }
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
      <div ref={this.containerRef} {...restProps}>
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