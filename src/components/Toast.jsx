import { useEffect, useState } from 'react'

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random()
      const t = { id, message: e.detail.message, type: e.detail.opts?.type || 'info' }
      setToasts((s) => [...s, t])
      // auto-remove after 3s
      setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), 3000)
    }
    window.addEventListener('app-toast', handler)
    return () => window.removeEventListener('app-toast', handler)
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`glass px-4 py-2 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 ${t.type==='success' ? 'border-green-400' : t.type==='error' ? 'border-red-400' : ''}`}>
          <div className="text-sm font-medium">{t.message}</div>
        </div>
      ))}
    </div>
  )
}
