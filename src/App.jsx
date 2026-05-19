import { useState } from 'react'
import Topbar from './components/Topbar'
import StlViewer from './components/StlViewer'
import { DEFAULT_MODEL_ID } from './models'
import './App.scss'

function App() {
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)

  return (
    <>
      <Topbar modelId={modelId} onModelChange={setModelId} />
      <main className="app">
        <section className="app-hero">
          <h1>Model önizleme</h1>
          <p>
            STL dosyanızı 3D ortamda inceleyin. Yüzeyde nokta seçmek için{' '}
            <kbd>Shift</kbd> tuşuna basılı tutarak tıklayın.
          </p>
        </section>
        <StlViewer modelId={modelId} />
      </main>
    </>
  )
}

export default App
