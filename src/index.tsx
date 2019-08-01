import React, { ComponentProps, CSSProperties, PureComponent } from 'react'

export interface ResizeReporterProps extends ComponentProps<'div'> {
  maxWidth?: number
  maxHeight?: number
  reportInit?: boolean
  debounce?: number
  onSizeChanged?: (width: number, height: number) => void
  onWidthChanged?: (width: number) => void
  onHeightChanged?: (height: number) => void
}

const detecterStyles: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: -10000,
  overflow: 'hidden',
  visibility: 'hidden'
}

const shrinkScrollerStyles: CSSProperties = {
  transition: '0s',
  animation: 'none',
  width: '250%',
  height: '250%'
}

export class ResizeReporter extends PureComponent<ResizeReporterProps> {
  containerRef = React.createRef<HTMLDivElement>()
  expandRef = React.createRef<HTMLDivElement>()
  shrinkRef = React.createRef<HTMLDivElement>()
  lastWidth = 0
  lastHeight = 0
  _debounceStamp: ReturnType<typeof setTimeout> | undefined

  resetPosition = () => {
    const { maxWidth = 2000, maxHeight = 2000 } = this.props
    if (this.expandRef.current) {
      this.expandRef.current.scrollTop = maxHeight
      this.expandRef.current.scrollLeft = maxWidth
    }
    if (this.shrinkRef.current) {
      this.shrinkRef.current.scrollTop = maxHeight
      this.shrinkRef.current.scrollLeft = maxWidth
    }
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

        this.resetPosition()
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
    if (process.env.NODE_ENV !== 'production') {
      if (this.containerRef.current) {
        const parent = this.containerRef.current.parentElement
        if (parent) {
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
      }
    }

    if (this.containerRef.current) {
      const parent = this.containerRef.current.parentElement
      if (parent) {
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

        this.resetPosition()
        this.lastWidth = newWidth
        this.lastHeight = newHeight
      }
    }
  }

  render() {
    const {
      maxWidth = 2000,
      maxHeight = 2000,
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
        <div
          ref={this.expandRef}
          style={detecterStyles}
          onScroll={this.onScroll}
        >
          <div
            style={{
              transition: '0s',
              animation: 'none',
              width: maxWidth,
              height: maxHeight
            }}
          ></div>
        </div>
        <div
          ref={this.shrinkRef}
          style={detecterStyles}
          onScroll={this.onScroll}
        >
          <div style={shrinkScrollerStyles}></div>
        </div>
        {children}
      </div>
    )
  }
}

export default ResizeReporter
