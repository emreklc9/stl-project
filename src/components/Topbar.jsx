import './Topbar.css'

const NAV_ITEMS = [
  { id: 'viewer', label: '3D Görüntüleyici', active: true },
  { id: 'coords', label: 'Koordinatlar', active: false },
]

export default function Topbar({ modelName = 'Spiderman.stl' }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-brand">
          <span className="topbar-logo" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 4L26 10v12L16 28 6 22V10L16 4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M16 10v12M10 13l6 3 6-3M10 19l6 3 6-3"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className="topbar-brand-text">
            <span className="topbar-title">STL Studio</span>
            <span className="topbar-subtitle">3D Model Görüntüleyici</span>
          </div>
        </div>

        <nav className="topbar-nav" aria-label="Ana menü">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={item.active ? 'active' : undefined}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="topbar-actions">
          <span className="topbar-model-badge" title="Yüklü model">
            <span className="topbar-model-dot" aria-hidden="true" />
            {modelName}
          </span>
        </div>
      </div>
    </header>
  )
}
