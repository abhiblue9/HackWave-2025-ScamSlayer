import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props){
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error){
    return { error }
  }
  componentDidCatch(error, info){
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught:', error, info)
  }
  render(){
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-3xl p-6">
          <div className="glass p-4 border border-red-400/40">
            <div className="font-semibold text-red-300">Something went wrong</div>
            <div className="text-sm text-white/70 break-all mt-1">{String(this.state.error?.message || this.state.error)}</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
