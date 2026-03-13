import { useState, useEffect } from 'react'

function App() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className="p-8 max-w-800 mx-auto">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1>ERP Dashboard</h1>
          <p className="text-muted-foreground">Modern OKLCH styling with Dark Mode support.</p>
        </div>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="btn btn-outline"
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <section className="card mb-8">
        <h3 className="mb-4">System Components</h3>
        <p className="mb-6 text-muted-foreground">
          This interface uses the OKLCH color space for better perceptual uniformity and vibrant colors in both light and dark themes.
        </p>
        
        <div className="flex gap-4 mb-8">
          <button className="btn btn-primary">Primary Action</button>
          <button className="btn btn-secondary">Secondary Action</button>
          <button className="btn btn-destructive">Destructive Action</button>
        </div>

        <div className="grid gap-6">
          <div className="card border bg-muted">
            <label className="mb-2 font-semibold block">Quick Search</label>
            <input type="text" placeholder="Search employees, tasks, or reports..." />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 rounded border bg-card shadow flex flex-col items-center">
          <span className="text-2xl mb-2">📊</span>
          <span className="font-bold">Analytics</span>
        </div>
        <div className="p-6 rounded border bg-card shadow flex flex-col items-center">
          <span className="text-2xl mb-2">👥</span>
          <span className="font-bold">Team</span>
        </div>
        <div className="p-6 rounded border bg-card shadow flex flex-col items-center">
          <span className="text-2xl mb-2">⚙️</span>
          <span className="font-bold">Settings</span>
        </div>
      </div>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        ERP System v1.0 • Built with OKLCH & CSS Variables
      </footer>
    </div>
  )
}

export default App
