// Lightweight helper to trigger toasts via a window event
export function showToast(message, opts = {}) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, opts } }))
}
