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
import { ResizeReporter } from './ResizeReporter'

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

- `maxWidth?: number` Default `2000`. The detecter needs to be larger than element. See explanation below.
- `maxHeight?: number` Default `2000`. The detecter needs to be larger than element. See explanation below.
- `reportInit?: boolean` Default `false`. Report the init rendered value.
- `debounce?: number` Default no debounce.
- `onSizeChanged?: (width: number, height: number) => void`
- `onWidthChanged?: (width: number) => void`
- `onHeightChanged?: (height: number) => void`
- The rest of the props are passed to the injected `<div>` element.

## Limitations

Currently there is no perfect solution for detecting element resizing.

- [react-resize-detector](https://github.com/maslianok/react-resize-detector) is based on the fairly new Resize Observer API which requires polyfill.
- [react-resize-aware](https://github.com/FezVrasta/react-resize-aware) injects an `<object>` element and listens to the `resize` event. It seems to have cross-browser [issuses](https://github.com/FezVrasta/react-resize-aware/issues/26).
- [react-height](https://github.com/nkbt/react-height) relies on React lifecycle which may not truly reflect the element size changing (e.g. Animation delay or Image loading delay).

This library's approach is similar to that of [react-resize-aware](https://github.com/FezVrasta/react-resize-aware). Instead of injecting an `<object>` element, it injects a `<div>` which contains two `<div>` children for detecting expanding and shrinking. Whenever the target resizes, one of the detectors will trigger a scroll event. The algorithm is derived from the [scrolling](https://www.w3.org/TR/cssom-view-1/#scroll-an-element) spec which is implemented in almost every browser.

This also means it comes with the same limitations:

- The target element should be able to contain children. Replaced elements like `<img>` are no no. A workaround is to wrap them in a `<div>`.
- The `position` CSS property of the target element should not be `static` so that the detectors (which always have the same size as the target) can use `absolute` to hide itself.
