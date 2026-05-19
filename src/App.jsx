import Topbar from './components/Topbar'
import StlViewer from './components/StlViewer'
import './App.css'

function App() {
  return (
    <>
      <Topbar modelName="Spiderman.stl" />
      <main className="app">
        <section className="app-hero">
          <h1>Model önizleme</h1>
          <p>
            STL dosyanızı 3D ortamda inceleyin. Yüzeyde nokta seçmek için{' '}
            <kbd>Shift</kbd> tuşuna basılı tutarak tıklayın.
          </p>
        </section>
        <StlViewer />
      </main>
    </>
  )
}

export default App
