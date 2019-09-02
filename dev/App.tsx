import React from 'react'
import { ResizeReporter } from '../src/object'

const App: React.FC = () => {
  return (
    <div
      className="App"
      style={{
        position: 'relative',
        width: 200,
        height: 200,
        background: 'orange'
      }}
    >
      <ResizeReporter reportInit onSizeChanged={console.log} />
    </div>
  )
}

export default App
