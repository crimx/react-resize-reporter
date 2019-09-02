export function checkParent(parent: Element | null) {
  if (!parent) {
    console.error(new Error('react-resize-reporter: empty parent element'))
    return
  }

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
        new Error(
          'react-resize-reporter: ' +
            'Unsupported parent tag name ' +
            parent.tagName.toLowerCase() +
            '.' +
            parent.className.replace(/\s+/, '.') +
            ' . Change the tag or wrap it in a supported tag(e.g. div).'
        )
      )
  }

  const parentStyles = window.getComputedStyle(parent)
  if (parentStyles && parentStyles.getPropertyValue('position') === 'static') {
    console.warn(
      new Error(
        'react-resize-reporter: ' +
          "The 'position' CSS property of element " +
          parent.tagName.toLowerCase() +
          '.' +
          parent.className.replace(/\s+/, '.') +
          " should not be 'static'."
      )
    )
  }
}
