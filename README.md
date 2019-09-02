# react-resize-reporter

Lightweight React Component that reports width and height changes when its parent resizes.

## Install

```
npm install react-resize-reporter
```

```
yarn add react-resize-reporter
```

## Usage

```javascript
// <object> onresize event based implementation
import ResizeReporter from 'react-resize-reporter'
// or
// import { ResizeReporter } from 'react-resize-reporter/object'
// or the scroll event based implementation
// import { ResizeReporter } from 'react-resize-reporter/scroll'

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <ResizeReporter onSizeChanged={console.log} reportInit debounce={1000} />
      <p>other stuff</p>
    </div>
  )
}
```

## Props

All props are optional.

```typescript
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
```

The rest of the props are passed to the injected `<div>` or `<object>` element.

## Limitations

Currently there is no perfect solution for detecting element resizing.

- [react-resize-detector](https://github.com/maslianok/react-resize-detector) is based on the fairly new Resize Observer API which requires an imperfect polyfill.
- [react-resize-aware](https://github.com/FezVrasta/react-resize-aware) injects an `<object>` element and listens to the `resize` event. Not so happy with its hook-abusing API and buggy implementation.
- [react-height](https://github.com/nkbt/react-height) relies on React lifecycle which may not truly reflect the element size changing (e.g. Animation delay or Image loading delay).

This library comes with two implementations with the same API.

The `<object>` resize event based is similar to that of react-resize-aware but with cleaner implementation.

The scroll event based injects a `<div>` which contains two `<div>` children for detecting expanding and shrinking. Whenever the target resizes, one of the detectors will trigger a scroll event. The algorithm is derived from the [scrolling](https://www.w3.org/TR/cssom-view-1/#scroll-an-element) spec which is respected by almost every browser.

This also means it comes with the same limitations as react-resize-aware:

- The target element should be able to contain children. Replaced elements like `<img>` are no no. A workaround is to wrap them in a `<div>`.
- The `position` CSS property of the target element should not be `static` so that the detectors (which always have the same size as the target) can use `absolute` to hide itself.

To trigger a "shrink-to-fit" width calculation for a block element you can apply either float, inline-block, absolutly positioning, flex or other styling methods.
