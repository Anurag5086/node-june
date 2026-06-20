import UploadForm from './components/UploadForm'
import './App.css'

function App() {
  return (
    <div className="page">
      <div className="ambient ambient--one" aria-hidden />
      <div className="ambient ambient--two" aria-hidden />

      <header className="page-header">
        <p className="eyebrow">Private collection</p>
        <h1 className="page-title">Atelier Upload</h1>
        <p className="page-lead">
          Curate your imagery with a title and description. Only refined visuals belong in the
          gallery.
        </p>
      </header>

      <main className="card">
        <UploadForm />
      </main>

      <footer className="page-footer">
        <span>Images only · up to 5 MB</span>
        <span className="divider" aria-hidden />
        <span>Secured upload</span>
      </footer>
    </div>
  )
}

export default App
