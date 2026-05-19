import { useEffect, useMemo, useRef, useState } from 'react'
import Topbar from './components/Topbar'
import StlViewer from './components/StlViewer'
import { CUSTOM_MODEL_ID, DEFAULT_MODEL_ID, STL_MODELS } from './models'
import './App.scss'

function App() {
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)
  const [customModel, setCustomModel] = useState(null)
  const customUrlRef = useRef(null)

  const activeModel = useMemo(() => {
    if (modelId === CUSTOM_MODEL_ID && customModel) return customModel
    return STL_MODELS.find((m) => m.id === modelId) ?? STL_MODELS[0]
  }, [modelId, customModel])

  useEffect(() => {
    return () => {
      if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current)
    }
  }, [])

  const handleFileSelect = (file) => {
    const name = file.name.toLowerCase()
    if (!name.endsWith('.stl')) {
      window.alert('Lütfen .stl uzantılı bir dosya seçin.')
      return
    }

    if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current)

    const url = URL.createObjectURL(file)
    customUrlRef.current = url
    setCustomModel({ id: CUSTOM_MODEL_ID, label: file.name, url })
    setModelId(CUSTOM_MODEL_ID)
  }

  return (
    <>
      <Topbar
        modelId={modelId}
        customModel={customModel}
        onModelChange={setModelId}
        onFileSelect={handleFileSelect}
      />
      <main className="app">
        <section className="app-hero">
          <h1>Model önizleme</h1>
          <p>
            Hazır modellerden birini seçin veya bilgisayarınızdan STL yükleyin. Yüzeyde
            nokta seçmek için <kbd>Shift</kbd> tuşuna basılı tutarak tıklayın.
          </p>
        </section>
        <StlViewer model={activeModel} />
      </main>
    </>
  )
}

export default App
